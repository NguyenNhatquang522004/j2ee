package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.request.OrderRequest;
import nhom5.demo.dto.response.OrderResponse;
import nhom5.demo.entity.*;
import nhom5.demo.enums.OrderStatusEnum;
import nhom5.demo.exception.BusinessException;
import nhom5.demo.exception.ResourceNotFoundException;
import nhom5.demo.repository.*;
import nhom5.demo.service.BatchService;
import nhom5.demo.service.MailService;
import nhom5.demo.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import nhom5.demo.security.SecurityUtils;
import nhom5.demo.service.AuditService;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;
    private final BatchService batchService;
    private final MailService mailService;
    private final AuditService auditService;
    private final nhom5.demo.service.NotificationService notificationService;
    private final nhom5.demo.repository.FlashSaleItemRepository flashSaleItemRepository;

    @Override
    @Transactional
    public OrderResponse createOrder(String username, OrderRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Build order items and validate stock
        List<OrderItem> orderItems = request.getItems().stream().map(itemReq -> {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemReq.getProductId()));

            if (!product.getIsActive()) {
                throw new BusinessException("Sản phẩm '" + product.getName() + "' hiện không còn bán");
            }

            // Check Flash Sale with Lock for thread safety
            BigDecimal unitPrice = product.getPrice();
            Long flashSaleItemId = null;
            Optional<FlashSaleItem> flashSaleItemOpt = flashSaleItemRepository.findActiveByProductId(product.getId(), LocalDateTime.now());
            
            if (flashSaleItemOpt.isPresent()) {
                // Re-fetch with Lock to ensure accurate soldQuantity
                FlashSaleItem flashSaleItem = flashSaleItemRepository.findByIdWithLock(flashSaleItemOpt.get().getId())
                        .orElse(flashSaleItemOpt.get());

                if (flashSaleItem.getSoldQuantity() + itemReq.getQuantity() <= flashSaleItem.getQuantityLimit()) {
                    // Entire quantity fits in flash sale
                    unitPrice = flashSaleItem.getFlashSalePrice();
                    flashSaleItemId = flashSaleItem.getId();
                    flashSaleItem.setSoldQuantity(flashSaleItem.getSoldQuantity() + itemReq.getQuantity());
                    flashSaleItemRepository.save(flashSaleItem);
                } else if (flashSaleItem.getSoldQuantity() < flashSaleItem.getQuantityLimit()) {
                    // PARTIAL Flash Sale? 
                    // For simplicity in UI, if the requested quantity exceeds the remaining flash sale stock, 
                    // we apply the system price (as requested: "hết số lượng thì dùng giá hệ thống").
                    // Or we could check if they are okay with system price. 
                    // Most systems would revert to regular price if the "deal" quantity is exhausted.
                    unitPrice = product.getPrice(); 
                }
            }

            return OrderItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice) // snapshot current price (maybe flash sale)
                    .subtotal(unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity())))
                    .productName(product.getName()) // snapshot current name
                    .productImageUrl(product.getImageUrl()) // snapshot current image
                    .flashSaleItemId(flashSaleItemId)
                    .build();
        }).toList();

        // Calculate total
        BigDecimal totalAmount = orderItems.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Apply coupon if provided
        BigDecimal discountAmount = BigDecimal.ZERO;
        Coupon coupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            coupon = couponRepository.findByCodeAndIsActiveTrueWithLock(request.getCouponCode())
                    .orElseThrow(() -> new BusinessException("Mã giảm giá không hợp lệ hoặc đã hết hạn"));

            if (coupon.getExpiryDate().isBefore(LocalDate.now())) {
                throw new BusinessException("Mã giảm giá đã hết hạn");
            }
            if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
                throw new BusinessException("Mã giảm giá đã hết lượt sử dụng");
            }
            if (coupon.getMinOrderAmount() != null && totalAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
                throw new BusinessException("Đơn hàng tối thiểu " + coupon.getMinOrderAmount() + "đ để dùng mã này");
            }

            discountAmount = totalAmount
                    .multiply(BigDecimal.valueOf(coupon.getDiscountPercent()))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            if (coupon.getMaxDiscountAmount() != null &&
                    discountAmount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discountAmount = coupon.getMaxDiscountAmount();
            }

            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        }

        BigDecimal finalAmount = totalAmount.subtract(discountAmount);

        // Deduct stock using FEFO — must be done inside transaction
        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            batchService.deductStock(itemReq.getProductId(), itemReq.getQuantity());
        }

        // Create order
        String orderCode = "ORD-" + DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
                .format(LocalDateTime.now()) + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .shippingAddress(request.getShippingAddress())
                .phone(request.getPhone())
                .note(request.getNote())
                .paymentMethod(request.getPaymentMethod())
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .status(OrderStatusEnum.PENDING)
                .isPaid(false)
                .coupon(coupon)
                .build();

        Order savedOrder = orderRepository.save(order);

        // Save order items linked to order
        List<OrderItem> savedItems = orderItems.stream().map(item -> {
            item.setOrder(savedOrder);
            return orderItemRepository.save(item);
        }).toList();

        savedOrder.setOrderItems(savedItems);

        // Clear cart after placing order
        cartRepository.findByUserId(user.getId()).ifPresent(cart -> {
            cartItemRepository.deleteByCartId(cart.getId());
        });

        // Send confirmation email asynchronously (fire-and-forget)
        try {
            mailService.sendOrderConfirmation(savedOrder);
            notificationService.createNotification(user,
                    "Đơn hàng #" + orderCode + " của bạn đã được tạo thành công!",
                    "SUCCESS",
                    "/profile/orders/" + savedOrder.getId());
        } catch (Exception ignored) {
            // Email/Notification failure should not abort the order
        }

        return toResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id, String username) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        // Admin can see any order; user can only see their own
        if (!order.getUser().getUsername().equals(username)) {
            User requester = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
            if (!requester.getRole().name().equals("ROLE_ADMIN")) {
                throw new BusinessException("Bạn không có quyền xem đơn hàng này");
            }
        }
        return toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByUser(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(String query, OrderStatusEnum status, Pageable pageable) {
        return orderRepository.searchOrders(query, status, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatusEnum status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        // Validation: Cannot go back to PENDING from SHIPPING/DELIVERED
        if (status == OrderStatusEnum.PENDING && 
           (order.getStatus() == OrderStatusEnum.SHIPPING || order.getStatus() == OrderStatusEnum.DELIVERED)) {
            throw new BusinessException("Không thể chuyển từ trạng thái " + order.getStatus().name() + " về Chờ xác nhận");
        }

        order.setStatus(status);
        LocalDateTime now = LocalDateTime.now();
        
        switch (status) {
            case PENDING -> { /* Chờ xác nhận */ }
            case CONFIRMED -> { if (order.getConfirmedAt() == null) order.setConfirmedAt(now); }
            case PACKAGING -> { /* Just status update */ }
            case SHIPPING -> { if (order.getShippedAt() == null) order.setShippedAt(now); }
            case DELIVERED -> { 
                if (order.getDeliveredAt() == null) order.setDeliveredAt(now);
                order.setIsPaid(true);
            }
            case CANCELLED -> { 
                if (order.getCancelledAt() == null) order.setCancelledAt(now); 
                revertCouponUsage(order);
                revertStock(order);
                revertFlashSaleUsage(order);
            }
        }
        
        Order savedOrder = orderRepository.save(order);
        
        // Notify user about status change
        notificationService.createNotification(order.getUser(),
                "Đơn hàng #" + order.getOrderCode() + " đã chuyển sang trạng thái: " + status.getDisplayName(),
                status == OrderStatusEnum.CANCELLED ? "WARNING" : "INFO",
                "/profile/orders/" + order.getId());

        auditService.log(SecurityUtils.getCurrentUsername(), "STATUS_UPDATE", "Order", id.toString(), 
                "Updated order " + order.getOrderCode() + " status to " + status);
        return toResponse(savedOrder);
    }

    private void revertCouponUsage(Order order) {
        if (order.getCoupon() != null) {
            Coupon coupon = order.getCoupon();
            coupon.setUsedCount(Math.max(0, coupon.getUsedCount() - 1));
            couponRepository.save(coupon);
        }
    }

    private void revertFlashSaleUsage(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            if (item.getFlashSaleItemId() != null) {
                flashSaleItemRepository.findByIdWithLock(item.getFlashSaleItemId()).ifPresent(fsItem -> {
                    fsItem.setSoldQuantity(Math.max(0, fsItem.getSoldQuantity() - item.getQuantity()));
                    flashSaleItemRepository.save(fsItem);
                });
            }
        }
    }

    private void revertStock(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            if (item.getProduct() != null) {
                batchService.returnStock(item.getProduct().getId(), item.getQuantity());
            }
        }
    }

    @Override
    @Transactional
    public void cancelOrder(Long id, String username) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        if (!order.getUser().getUsername().equals(username)) {
            throw new BusinessException("Bạn không có quyền hủy đơn hàng này");
        }
        if (order.getStatus() != OrderStatusEnum.PENDING &&
                order.getStatus() != OrderStatusEnum.CONFIRMED) {
            throw new BusinessException("Không thể hủy đơn hàng ở trạng thái: " + order.getStatus().name());
        }

        order.setStatus(OrderStatusEnum.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        revertCouponUsage(order);
        revertStock(order);
        revertFlashSaleUsage(order);
        orderRepository.save(order);
        
        notificationService.createNotification(order.getUser(),
                "Bạn đã hủy thành công đơn hàng #" + order.getOrderCode(),
                "WARNING",
                "/profile/orders/" + order.getId());

        auditService.log(username, "CANCEL", "Order", id.toString(), "Cancelled order " + order.getOrderCode());
    }

    private OrderResponse toResponse(Order order) {
        List<OrderResponse.OrderItemResponse> items = order.getOrderItems().stream()
                .map(item -> OrderResponse.OrderItemResponse.builder()
                        .orderItemId(item.getId())
                        .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                        .productName(item.getProductName() != null ? item.getProductName() : 
                                   (item.getProduct() != null ? item.getProduct().getName() : "Sản phẩm đã bị xóa"))
                        .productImageUrl(item.getProductImageUrl() != null ? item.getProductImageUrl() : 
                                       (item.getProduct() != null ? item.getProduct().getImageUrl() : null))
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .userId(order.getUser().getId())
                .username(order.getUser().getUsername())
                .shippingAddress(order.getShippingAddress())
                .phone(order.getPhone())
                .note(order.getNote())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalAmount())
                .status(order.getStatus())
                .statusDisplayName(order.getStatus().getDisplayName())
                .paymentMethod(order.getPaymentMethod())
                .isPaid(order.getIsPaid())
                .couponCode(order.getCoupon() != null ? order.getCoupon().getCode() : null)
                .orderItems(items)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .confirmedAt(order.getConfirmedAt())
                .shippedAt(order.getShippedAt())
                .deliveredAt(order.getDeliveredAt())
                .cancelledAt(order.getCancelledAt())
                .build();
    }
}

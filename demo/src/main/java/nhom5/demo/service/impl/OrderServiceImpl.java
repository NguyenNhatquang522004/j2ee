package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.request.OrderRequest;
import nhom5.demo.dto.response.OrderResponse;
import nhom5.demo.entity.*;
import nhom5.demo.enums.OrderStatusEnum;
import nhom5.demo.enums.PaymentMethodEnum;
import nhom5.demo.exception.BusinessException;
import nhom5.demo.exception.ResourceNotFoundException;
import nhom5.demo.repository.*;
import nhom5.demo.service.BatchService;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import nhom5.demo.security.SecurityUtils;
import nhom5.demo.service.AuditService;
import nhom5.demo.event.OrderEvent;
import org.springframework.context.ApplicationEventPublisher;

/**
 * Triển khai các dịch vụ quản lý Đơn hàng.
 * Bao gồm: Tạo đơn hàng, Quản lý trạng thái, Hoàn tiền, Trả hàng và Tích hợp xử lý kho (Redis + DB).
 */
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
    private final AuditService auditService;
    private final nhom5.demo.service.NotificationService notificationService;
    private final nhom5.demo.repository.FlashSaleItemRepository flashSaleItemRepository;
    private final nhom5.demo.service.RedisStockReservationService redisStockReservationService;
    private final SystemSettingRepository systemSettingRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Tạo đơn hàng mới.
     * Quy trình: Kiểm tra bảo mật -> Tính toán giá (Flash Sale) -> Kiểm tra Stock (Redis Reservation) -> Áp dụng Coupon -> Lưu DB.
     */
    @Override
    @Transactional
    public OrderResponse createOrder(String username, OrderRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Anti-Double Click / Idempotency check (Point 16)
        // Prevent creating identical orders within a short window (5 seconds)
        Optional<Order> recentOrder = orderRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId());
        if (recentOrder.isPresent() && 
            recentOrder.get().getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(5))) {
            throw new BusinessException("Hệ thống đang xử lý đơn hàng của bạn, vui lòng đợi giây lát");
        }

        // Build order items and validate stock
        List<OrderItem> orderItems = request.getItems().stream().map(itemReq -> {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemReq.getProductId()));

            if (!product.getIsActive()) {
                throw new BusinessException("Sản phẩm '" + product.getName() + "' hiện không còn bán");
            }

            // Check Flash Sale with Lock for thread safety
            BigDecimal unitPrice = product.getPrice();
            Optional<FlashSaleItem> flashSaleItemOpt = flashSaleItemRepository.findActiveByProductId(product.getId(), LocalDateTime.now());
            
            if (flashSaleItemOpt.isPresent()) {
                // Re-fetch with Lock to ensure accurate soldQuantity
                FlashSaleItem flashSaleItem = flashSaleItemRepository.findByIdWithLock(flashSaleItemOpt.get().getId())
                        .orElse(flashSaleItemOpt.get());

                if (flashSaleItem.getSoldQuantity() + itemReq.getQuantity() <= flashSaleItem.getQuantityLimit()) {
                    // Entire quantity fits in flash sale
                    unitPrice = flashSaleItem.getFlashSalePrice();
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
                    .flashSaleItem(flashSaleItemOpt.map(f -> f).orElse(null))
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

            // Security Check: Is this a private coupon assigned only to certain users?
            if (coupon.getIsPrivate()) {
                boolean isAssigned = coupon.getAssignedUsers().stream()
                        .anyMatch(u -> u.getUsername().equals(user.getUsername()));
                if (!isAssigned) {
                    throw new BusinessException("Mã giảm giá này không dành cho tài khoản của bạn");
                }
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

        // Calculate shipping fee based on system settings
        BigDecimal shippingFee = BigDecimal.ZERO;
        try {
            BigDecimal fee = systemSettingRepository.findBySettingKey("SHIPPING_FEE")
                    .map(s -> new BigDecimal(s.getSettingValue()))
                    .orElse(BigDecimal.ZERO);
            BigDecimal threshold = systemSettingRepository.findBySettingKey("FREE_SHIPPING_THRESHOLD")
                    .map(s -> new BigDecimal(s.getSettingValue()))
                    .orElse(BigDecimal.valueOf(Long.MAX_VALUE));

            if (totalAmount.compareTo(threshold) < 0) {
                shippingFee = fee;
            }
        } catch (Exception e) {
            // Log error or fall back to zero fee
        }

        BigDecimal finalAmount = totalAmount.subtract(discountAmount).add(shippingFee);

        // Register in Redis for 15-min payment window
        Map<Long, Integer> itemsToReserve = new HashMap<>();
        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            itemsToReserve.put(itemReq.getProductId(), itemReq.getQuantity());
        }

        // Create order
        String orderCode = "ORD-" + DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
                .format(LocalDateTime.now()) + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        
        // Register in Redis for 15-min payment window (TRUE Reservation: No physical DB subtract yet)
        itemsToReserve.forEach((pid, qty) -> redisStockReservationService.reserve(orderCode, pid, qty));

        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .shippingAddress(request.getShippingAddress())
                .phone(request.getPhone())
                .note(request.getNote())
                .paymentMethod(request.getPaymentMethod())
                .totalAmount(totalAmount)
                .discountAmount(discountAmount.compareTo(BigDecimal.ZERO) == 0 ? null : discountAmount)
                .shippingFee(shippingFee)
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

        // Publish event for asynchronous decoupled processing (Emails, Notifications, Auditing)
        eventPublisher.publishEvent(OrderEvent.builder()
                .order(savedOrder)
                .type("CREATED")
                .build());

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

    /**
     * Cập nhật trạng thái đơn hàng.
     * Áp dụng máy trạng thái (State Machine) để đảm bảo trình tự logic (VD: Không thể giao hàng nếu chưa CONFIRMED).
     * Xử lý trừ kho thực tế (Physical Deduction) khi đơn hàng chuyển sang trạng thái CONFIRMED hoặc DELIVERED.
     */
    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatusEnum status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        // Strict State Transition Validation (Point 10)
        OrderStatusEnum currentStatus = order.getStatus();
        
        boolean isValidTransition = switch (currentStatus) {
            case PENDING -> 
                status == OrderStatusEnum.CONFIRMED || status == OrderStatusEnum.CANCELLED;
            case CONFIRMED -> 
                status == OrderStatusEnum.PACKAGING || status == OrderStatusEnum.SHIPPING || status == OrderStatusEnum.CANCELLED;
            case PACKAGING -> 
                status == OrderStatusEnum.SHIPPING || status == OrderStatusEnum.CANCELLED;
            case SHIPPING -> 
                status == OrderStatusEnum.DELIVERED || status == OrderStatusEnum.CANCELLED;
            case DELIVERED -> 
                status == OrderStatusEnum.RETURN_REQUESTED;
            case RETURN_REQUESTED ->
                status == OrderStatusEnum.RETURNED || status == OrderStatusEnum.RETURN_REJECTED;
            case CANCELLED, RETURNED, RETURN_REJECTED -> 
                false; // Final states
            default -> false;
        };

        if (!isValidTransition) {
            throw new BusinessException("Trạng thái đơn hàng không hợp lệ khi chuyển từ " + 
                    currentStatus.getDisplayName() + " sang " + status.getDisplayName());
        }

        order.setStatus(status);
        LocalDateTime now = LocalDateTime.now();
        
        switch (status) {
            case PENDING -> { /* Chờ xác nhận */ }
            case CONFIRMED -> { 
                if (order.getConfirmedAt() == null) order.setConfirmedAt(now); 
                // Only mark as paid if it's NOT COD (pre-paid methods like Bank/Momo)
                if (order.getPaymentMethod() != PaymentMethodEnum.COD && !order.getIsPaid()) {
                    // Physical deduction from DB batches now that payment is real
                    for (OrderItem item : order.getOrderItems()) {
                        batchService.deductStock(item.getProduct().getId(), item.getQuantity());
                    }
                    order.setIsPaid(true);
                    order.setPaidAt(now);
                }
                redisStockReservationService.commit(order.getOrderCode(), getOrderItemMap(order));
            }
            case PACKAGING -> {
                if (order.getPackagingAt() == null) order.setPackagingAt(now);
            }
            case SHIPPING -> {
                if (order.getShippedAt() == null) order.setShippedAt(now);
            }
            case DELIVERED -> { 
                if (order.getDeliveredAt() == null) order.setDeliveredAt(now);
                // Mark COD as paid upon delivery
                if (!order.getIsPaid()) {
                    for (OrderItem item : order.getOrderItems()) {
                        batchService.deductStock(item.getProduct().getId(), item.getQuantity());
                    }
                    order.setIsPaid(true);
                    order.setPaidAt(now);
                }
                redisStockReservationService.commit(order.getOrderCode(), getOrderItemMap(order));
            }
            case CANCELLED -> { 
                if (order.getCancelledAt() == null) order.setCancelledAt(now); 
                revertCouponUsage(order);
                revertFlashSaleUsage(order); // Flash sale is allocated immediately upon creation
                
                // If it was already CONFIRMED/PAID, we revert physical stock. 
                // If it was just PENDING, it was never subtracted from DB, only Redis.
                if (order.getIsPaid()) {
                    revertStock(order);
                }
                redisStockReservationService.release(order.getOrderCode(), getOrderItemMap(order));
            }
            case RETURNED -> {
                if (order.getReturnedAt() == null) order.setReturnedAt(now);
                revertStock(order);
                order.setUpdatedAt(now);
            }
            case RETURN_REQUESTED -> {
                if (order.getReturnRequestedAt() == null) order.setReturnRequestedAt(now);
                order.setUpdatedAt(now);
            }
            case RETURN_REJECTED -> {
                order.setUpdatedAt(now);
                // If by any chance it wasn't paid (e.g. error in flow), 
                // reject means they KEEP it, so it's definitively paid now.
                if (!order.getIsPaid()) {
                    order.setIsPaid(true);
                    order.setPaidAt(now);
                }
            }
            default -> {
                // For any status that implies progress/payment success, commit the reservation
                if (status == OrderStatusEnum.CONFIRMED || status == OrderStatusEnum.DELIVERED) {
                    redisStockReservationService.commit(order.getOrderCode(), getOrderItemMap(order));
                }
            }
        }
        
        Order savedOrder = orderRepository.save(order);
        
        // Use event for decoupled side effects
        eventPublisher.publishEvent(OrderEvent.builder()
                .order(savedOrder)
                .status(status)
                .type("STATUS_UPDATED")
                .build());

        return toResponse(savedOrder);
    }

    private Map<Long, Integer> getOrderItemMap(Order order) {
        Map<Long, Integer> items = new HashMap<>();
        for (OrderItem item : order.getOrderItems()) {
            items.put(item.getProduct().getId(), item.getQuantity());
        }
        return items;
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
            if (item.getFlashSaleItem() != null) {
                flashSaleItemRepository.findByIdWithLock(item.getFlashSaleItem().getId()).ifPresent(fsItem -> {
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
        
        updateOrderStatus(id, OrderStatusEnum.CANCELLED);
        
        notificationService.createNotification(order.getUser(),
                "Bạn đã hủy thành công đơn hàng #" + order.getOrderCode(),
                "WARNING",
                "/orders/" + order.getId());

        auditService.log(username, "CANCEL", "Order", id.toString(), "Cancelled order " + order.getOrderCode());
    }

    /**
     * Đánh dấu đơn hàng đã được hoàn tiền (Dành cho Admin).
     * Chỉ áp dụng cho đơn hàng đã Hủy hoặc đã Trả lại.
     */
    @Override
    @Transactional
    public OrderResponse markAsRefunded(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
                
        if (order.getStatus() != OrderStatusEnum.CANCELLED && order.getStatus() != OrderStatusEnum.RETURNED) {
            throw new BusinessException("Chỉ có thể hoàn tiền cho những đơn hàng đã HỦY hoặc đã TRẢ HÀNG");
        }
        
        if (!order.getIsPaid()) {
            throw new BusinessException("Đơn hàng này chưa được thanh toán, không cần hoàn tiền");
        }
        
        if (order.getIsRefunded()) {
            throw new BusinessException("Đơn hàng này đã được hoàn tiền trước đó");
        }
        
        order.setIsRefunded(true);
        order.setRefundedAt(LocalDateTime.now());
        order.setNote((order.getNote() != null ? order.getNote() : "") + " | Đã hoàn tiền cho khách");
        Order savedOrder = orderRepository.save(order);
        
        notificationService.createNotification(order.getUser(),
                "Đơn hàng #" + order.getOrderCode() + " đã được hoàn tiền thành công",
                "SUCCESS",
                "/orders/" + order.getId());

        auditService.log(SecurityUtils.getCurrentUsername(), "MARK_REFUNDED", "Order", id.toString(), 
                "Marked order " + order.getOrderCode() + " as refunded");
                
        return toResponse(savedOrder);
    }

    @Override
    @Transactional
    public OrderResponse requestReturn(Long id, String reason, String returnMedia, String username) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        if (!order.getUser().getUsername().equals(username)) {
            throw new BusinessException("Bạn không có quyền yêu cầu trả hàng cho đơn hàng này");
        }

        if (order.getStatus() != OrderStatusEnum.DELIVERED) {
            throw new BusinessException("Chỉ có thể trả hàng cho đơn hàng đã GIAO THÀNH CÔNG");
        }

        // Check time window (e.g., 7 days) if needed
        if (order.getDeliveredAt() != null && 
            order.getDeliveredAt().isBefore(LocalDateTime.now().minusDays(7))) {
             throw new BusinessException("Đã quá thời hạn 7 ngày để yêu cầu trả hàng");
        }

        order.setReturnReason(reason);
        order.setReturnMedia(returnMedia);
        return updateOrderStatus(id, OrderStatusEnum.RETURN_REQUESTED);
    }

    @Override
    @Transactional
    public OrderResponse confirmReturn(Long id) {
        return updateOrderStatus(id, OrderStatusEnum.RETURNED);
    }

    @Override
    @Transactional
    public OrderResponse rejectReturn(Long id, String reason) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        order.setRejectReason(reason);
        return updateOrderStatus(id, OrderStatusEnum.RETURN_REJECTED);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getRefundRequests(String query, Pageable pageable) {
        return orderRepository.searchRefundRequests(query, pageable).map(this::toResponse);
    }

    private OrderResponse toResponse(Order order) {
        List<OrderResponse.OrderItemResponse> items = order.getOrderItems().stream()
                .map(item -> new OrderResponse.OrderItemResponse(
                        item.getId(),
                        item.getProduct() != null ? item.getProduct().getId() : null,
                        item.getProductName() != null ? item.getProductName() : 
                                   (item.getProduct() != null ? item.getProduct().getName() : "Sản phẩm đã bị xóa"),
                        item.getProductImageUrl() != null ? item.getProductImageUrl() : 
                                       (item.getProduct() != null ? item.getProduct().getImageUrl() : null),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubtotal()
                ))
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .userId(order.getUser().getId())
                .username(order.getUser().getUsername())
                .shippingAddress(order.getShippingAddress())
                .addressDetail(order.getAddressDetail())
                .ward(order.getWard())
                .district(order.getDistrict())
                .province(order.getProvince())
                .phone(order.getPhone())
                .receiverName(order.getReceiverName())
                .trackingNumber(order.getTrackingNumber())
                .estimatedArrival(order.getEstimatedArrival())
                .note(order.getNote())
                .returnReason(order.getReturnReason())
                .returnMedia(order.getReturnMedia())
                .rejectReason(order.getRejectReason())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .shippingFee(order.getShippingFee())
                .finalAmount(order.getFinalAmount())
                .status(order.getStatus())
                .statusDisplayName(order.getStatus() != null ? order.getStatus().getDisplayName() : null)
                .paymentMethod(order.getPaymentMethod())
                .isPaid(order.getIsPaid())
                .isRefunded(order.getIsRefunded() != null ? order.getIsRefunded() : false)
                .couponCode(order.getCoupon() != null ? order.getCoupon().getCode() : null)
                .orderItems(items)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .confirmedAt(order.getConfirmedAt())
                .packagingAt(order.getPackagingAt())
                .shippedAt(order.getShippedAt())
                .deliveredAt(order.getDeliveredAt())
                .cancelledAt(order.getCancelledAt())
                .paidAt(order.getPaidAt())
                .returnRequestedAt(order.getReturnRequestedAt())
                .returnedAt(order.getReturnedAt())
                .refundedAt(order.getRefundedAt())
                .build();
    }
}

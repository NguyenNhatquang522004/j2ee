package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.dto.request.CartItemRequest;
import nhom5.demo.dto.response.CartResponse;
import nhom5.demo.entity.Cart;
import nhom5.demo.entity.CartItem;
import nhom5.demo.entity.Product;
import nhom5.demo.entity.User;
import nhom5.demo.exception.BusinessException;
import nhom5.demo.exception.ResourceNotFoundException;
import nhom5.demo.repository.CartItemRepository;
import nhom5.demo.repository.CartRepository;
import nhom5.demo.repository.ProductBatchRepository;
import nhom5.demo.repository.ProductRepository;
import nhom5.demo.repository.UserRepository;
import nhom5.demo.service.CartService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;
import java.util.Objects;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductBatchRepository batchRepository;
    private final UserRepository userRepository;
    private final nhom5.demo.repository.FlashSaleItemRepository flashSaleItemRepository;
    private final nhom5.demo.repository.SystemSettingRepository systemSettingRepository;

    @Override
    @Transactional
    public CartResponse getCart(@NonNull String username) {
        Cart cart = getOrCreateCart(username);
        Long cartId = Objects.requireNonNull(cart.getId());
        List<CartItem> items = cartItemRepository.findByCartId(cartId);
        return toResponse(cart, items);
    }

    @Override
    @Transactional
    public CartResponse addToCart(@NonNull String username, @NonNull CartItemRequest request) {
        Cart cart = getOrCreateCart(username);
        Long productId = Objects.requireNonNull(request.getProductId());
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        LocalDate today = LocalDate.now();
        boolean productActive = product.getIsActive() == null || product.getIsActive();
        long availableStock = batchRepository.sumRemainingQuantityByProductId(Objects.requireNonNull(product.getId()), today);

        if (!productActive) {
            throw new BusinessException("Sản phẩm '" + product.getName() + "' hiện không còn bán");
        }

        if (availableStock <= 0) {
            throw new BusinessException("Sản phẩm '" + product.getName() + "' hiện hết hàng");
        }

        if (request.getQuantity() > availableStock) {
            throw new BusinessException(
                    "Sản phẩm '" + product.getName() + "' chỉ còn " + availableStock + " " + product.getUnit());
        }

        Long cartId = Objects.requireNonNull(cart.getId());
        CartItem existingItem = cartItemRepository.findByCartIdAndProductId(cartId, product.getId())
                .orElse(null);

        if (existingItem != null) {
            int newQty = existingItem.getQuantity() + request.getQuantity();
            if (newQty > 10) {
                throw new BusinessException("Mỗi sản phẩm chỉ được mua tối đa 10 đơn vị để đảm bảo sản phẩm có thể đến tay nhiều khách hàng nhất");
            }
            if (newQty > availableStock) {
                throw new BusinessException("Tổng số lượng vượt quá tồn kho: " + availableStock);
            }
            existingItem.setQuantity(newQty);
            cartItemRepository.save(existingItem);
        } else {
            if (request.getQuantity() > 10) {
                throw new BusinessException("Mỗi sản phẩm chỉ được mua tối đa 10 đơn vị để đảm bảo sản phẩm có thể đến tay nhiều khách hàng nhất");
            }
            CartItem cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(Objects.requireNonNull(cartItem));
        }

        List<CartItem> items = cartItemRepository.findByCartId(cartId);
        return toResponse(cart, items);
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(@NonNull String username, @NonNull Long cartItemId, int quantity) {
        Cart cart = getOrCreateCart(username);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (!Objects.equals(Objects.requireNonNull(item.getCart()).getId(), cart.getId())) {
            throw new BusinessException("Không có quyền cập nhật giỏ hàng này");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else if (quantity > 10) {
            throw new BusinessException("Rất tiếc, mỗi sản phẩm chỉ được mua tối đa 10 đơn vị để phục vụ được nhiều khách hàng hơn");
        } else {
            boolean active = item.getProduct().getIsActive() == null || item.getProduct().getIsActive();
            if (!active) {
                throw new BusinessException("Sản phẩm hiện không còn kinh doanh");
            }
            long stock = batchRepository
                    .sumRemainingQuantityByProductId(Objects.requireNonNull(item.getProduct().getId()), LocalDate.now());
            if (quantity > stock) {
                throw new BusinessException("Chỉ còn " + stock + " " + item.getProduct().getUnit() + " trong kho");
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        Long cartId = Objects.requireNonNull(cart.getId());
        List<CartItem> items = cartItemRepository.findByCartId(cartId);
        return toResponse(cart, items);
    }

    @Override
    @Transactional
    public void removeCartItem(@NonNull String username, @NonNull Long cartItemId) {
        Cart cart = getOrCreateCart(username);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (!Objects.equals(Objects.requireNonNull(item.getCart()).getId(), cart.getId())) {
            throw new BusinessException("Không có quyền xóa mục này");
        }
        cartItemRepository.delete(item);
    }

    @Override
    @Transactional
    public void clearCart(@NonNull String username) {
        Cart cart = getOrCreateCart(username);
        Long cartId = Objects.requireNonNull(cart.getId());
        cartItemRepository.deleteByCartId(cartId);
    }

    private Cart getOrCreateCart(@NonNull String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Long userId = Objects.requireNonNull(user.getId());
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart newCart = Cart.builder().user(user).build();
            return cartRepository.save(Objects.requireNonNull(newCart));
        });
    }

    private CartResponse toResponse(Cart cart, List<CartItem> cartItems) {
        List<Long> productIds = cartItems.stream()
                .map(item -> Objects.requireNonNull(item.getProduct()).getId())
                .toList();

        // 1. Pre-fetch stocks in batch (Lenient check for debugging)
        Map<Long, Integer> stockMap = new java.util.HashMap<>();
        LocalDate today = LocalDate.now();
        if (!productIds.isEmpty()) {
            List<Object[]> stocks = batchRepository.sumRemainingQuantitiesByProductIds(productIds, today);
            for (Object[] row : stocks) {
                if (row[0] != null && row[1] != null) {
                    stockMap.put((Long) row[0], ((Number) row[1]).intValue());
                }
            }
        }

        // 2. Pre-fetch active Flash Sales in batch
        Map<Long, nhom5.demo.entity.FlashSaleItem> flashSaleMap = new java.util.HashMap<>();
        if (!productIds.isEmpty()) {
            List<nhom5.demo.entity.FlashSaleItem> activeFlashSales = flashSaleItemRepository
                    .findActiveByProductIds(productIds, java.time.LocalDateTime.now());
            for (nhom5.demo.entity.FlashSaleItem fs : activeFlashSales) {
                flashSaleMap.put(fs.getProduct().getId(), fs);
            }
        }

        List<CartResponse.CartItemResponse> items = cartItems.stream()
                .map(item -> {
                    Long productId = item.getProduct().getId();
                    int stock = stockMap.getOrDefault(productId, 0);

                    BigDecimal unitPrice = item.getProduct().getPrice();
                    nhom5.demo.entity.FlashSaleItem fsItem = flashSaleMap.get(productId);

                    if (fsItem != null) {
                        if (fsItem.getSoldQuantity() + item.getQuantity() <= fsItem.getQuantityLimit()) {
                            unitPrice = fsItem.getFlashSalePrice();
                        }
                    }

                    BigDecimal subtotal = Objects.requireNonNull(unitPrice)
                            .multiply(BigDecimal.valueOf(item.getQuantity()));
                    // Logic isActive nới lỏng: mặc định là true trừ khi explicitly false
                    boolean productActive = item.getProduct().getIsActive() == null || 
                                          Boolean.TRUE.equals(item.getProduct().getIsActive()) || 
                                          (item.getProduct().getIsActive() instanceof Boolean ? (Boolean)item.getProduct().getIsActive() : true);
                    
                    return CartResponse.CartItemResponse.builder()
                            .cartItemId(item.getId())
                            .productId(productId)
                            .productSlug(item.getProduct().getSlug())
                            .productName(item.getProduct().getName())
                            .productImageUrl(item.getProduct().getImageUrl())
                            .unitPrice(unitPrice)
                            .quantity(item.getQuantity())
                            .subtotal(subtotal)
                            .availableStock(stock)
                            .isActive(productActive)
                            .build();
                }).toList();

        BigDecimal total = items.stream()
                .map(CartResponse.CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate shipping fee based on system settings
        BigDecimal shippingFee = BigDecimal.ZERO;
        try {
            BigDecimal fee = systemSettingRepository.findBySettingKey("SHIPPING_FEE")
                    .map(s -> new BigDecimal(s.getSettingValue()))
                    .orElse(BigDecimal.ZERO);
            BigDecimal threshold = systemSettingRepository.findBySettingKey("FREE_SHIPPING_THRESHOLD")
                    .map(s -> new BigDecimal(s.getSettingValue()))
                    .orElse(BigDecimal.valueOf(Long.MAX_VALUE));

            if (total.compareTo(threshold) < 0 && total.compareTo(BigDecimal.ZERO) > 0) {
                shippingFee = fee;
            }
        } catch (Exception e) {
            // Log error or fall back to zero fee
        }

        return CartResponse.builder()
                .cartId(cart.getId())
                .items(items)
                .totalAmount(total)
                .shippingFee(shippingFee)
                .finalAmount(total.add(shippingFee))
                .totalItems(items.size())
                .build();
    }
}

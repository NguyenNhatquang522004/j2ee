package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
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

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductBatchRepository batchRepository;
    private final UserRepository userRepository;
    private final nhom5.demo.repository.FlashSaleItemRepository flashSaleItemRepository;

    @Override
    @Transactional
    public CartResponse getCart(String username) {
        Cart cart = getOrCreateCart(username);
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        return toResponse(cart, items);
    }

    @Override
    @Transactional
    public CartResponse addToCart(String username, CartItemRequest request) {
        Cart cart = getOrCreateCart(username);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (!product.getIsActive()) {
            throw new BusinessException("Sản phẩm '" + product.getName() + "' hiện không còn bán");
        }

        long availableStock = batchRepository.sumRemainingQuantityByProductId(product.getId());
        if (request.getQuantity() > availableStock) {
            throw new BusinessException(
                    "Sản phẩm '" + product.getName() + "' chỉ còn " + availableStock + " " + product.getUnit());
        }

        CartItem existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElse(null);

        if (existingItem != null) {
            int newQty = existingItem.getQuantity() + request.getQuantity();
            if (newQty > availableStock) {
                throw new BusinessException("Tổng số lượng vượt quá tồn kho: " + availableStock);
            }
            existingItem.setQuantity(newQty);
            cartItemRepository.save(existingItem);
        } else {
            CartItem cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(cartItem);
        }

        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        return toResponse(cart, items);
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(String username, Long cartItemId, int quantity) {
        Cart cart = getOrCreateCart(username);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BusinessException("Không có quyền cập nhật giỏ hàng này");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            long stock = batchRepository.sumRemainingQuantityByProductId(item.getProduct().getId());
            if (quantity > stock) {
                throw new BusinessException("Chỉ còn " + stock + " " + item.getProduct().getUnit() + " trong kho");
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        return toResponse(cart, items);
    }

    @Override
    @Transactional
    public void removeCartItem(String username, Long cartItemId) {
        Cart cart = getOrCreateCart(username);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BusinessException("Không có quyền xóa mục này");
        }
        cartItemRepository.delete(item);
    }

    @Override
    @Transactional
    public void clearCart(String username) {
        Cart cart = getOrCreateCart(username);
        cartItemRepository.deleteByCartId(cart.getId());
    }

    private Cart getOrCreateCart(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        return cartRepository.findByUserId(user.getId()).orElseGet(() -> {
            Cart newCart = Cart.builder().user(user).build();
            return cartRepository.save(newCart);
        });
    }

    private CartResponse toResponse(Cart cart, List<CartItem> cartItems) {
        List<CartResponse.CartItemResponse> items = cartItems.stream()
                .map(item -> {
                    long stock = batchRepository.sumRemainingQuantityByProductId(item.getProduct().getId());
                    // Check Flash Sale for price display
                    BigDecimal unitPrice = item.getProduct().getPrice();
                    java.util.Optional<nhom5.demo.entity.FlashSaleItem> fsItemOpt = flashSaleItemRepository.findActiveByProductId(item.getProduct().getId(), java.time.LocalDateTime.now());
                    
                    if (fsItemOpt.isPresent()) {
                        nhom5.demo.entity.FlashSaleItem fsItem = fsItemOpt.get();
                        if (fsItem.getSoldQuantity() + item.getQuantity() <= fsItem.getQuantityLimit()) {
                            unitPrice = fsItem.getFlashSalePrice();
                        }
                    }

                    BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                    return CartResponse.CartItemResponse.builder()
                            .cartItemId(item.getId())
                            .productId(item.getProduct().getId())
                            .productName(item.getProduct().getName())
                            .productImageUrl(item.getProduct().getImageUrl())
                            .unitPrice(unitPrice)
                            .quantity(item.getQuantity())
                            .subtotal(subtotal)
                            .availableStock((int) stock)
                            .build();
                }).toList();

        BigDecimal total = items.stream()
                .map(CartResponse.CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .cartId(cart.getId())
                .items(items)
                .totalAmount(total)
                .totalItems(items.size())
                .build();
    }
}

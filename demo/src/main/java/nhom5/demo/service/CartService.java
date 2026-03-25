package nhom5.demo.service;

import nhom5.demo.dto.request.CartItemRequest;
import nhom5.demo.dto.response.CartResponse;

public interface CartService {
    CartResponse getCart(String username);

    CartResponse addToCart(String username, CartItemRequest request);

    CartResponse updateCartItem(String username, Long cartItemId, int quantity);

    void removeCartItem(String username, Long cartItemId);

    void clearCart(String username);
}

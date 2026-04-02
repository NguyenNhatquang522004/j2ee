package nhom5.demo.service;

import nhom5.demo.dto.request.CartItemRequest;
import nhom5.demo.dto.response.CartResponse;
import org.springframework.lang.NonNull;

public interface CartService {
    CartResponse getCart(@NonNull String username);

    CartResponse addToCart(@NonNull String username, @NonNull CartItemRequest request);

    CartResponse updateCartItem(@NonNull String username, @NonNull Long cartItemId, int quantity);

    void removeCartItem(@NonNull String username, @NonNull Long cartItemId);

    void clearCart(@NonNull String username);
}

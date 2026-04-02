package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nhom5.demo.constant.AppConstants;
import nhom5.demo.dto.request.CartItemRequest;
import nhom5.demo.dto.request.CartItemUpdateRequest;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.dto.response.CartResponse;
import nhom5.demo.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;
import java.util.Objects;

/**
 * REST CONTROLLER: CartController
 * ---------------------------------------------------------
 * Manages individual user shopping carts.
 * Every operation is strictly bound to the authenticated user's context.
 * 
 * Security: Requires Bearer Authentication (JWT).
 */
@Tag(name = "Cart", description = "Quản lý giỏ hàng")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping(AppConstants.CART_PATH)
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /**
     * getCart: Retrieves the current state of the user's shopping cart.
     * Automatically creates a new cart instance if one doesn't exist for the user.
     */
    @Operation(summary = "Xem giỏ hàng")
    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @AuthenticationPrincipal @NonNull UserDetails userDetails) {
        CartResponse data = cartService.getCart(Objects.requireNonNull(userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * addToCart: Adds a specific volume of a product to the user's cart.
     * If the item already exists, the quantity is incremented.
     */
    @Operation(summary = "Thêm sản phẩm vào giỏ hàng")
    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @AuthenticationPrincipal @NonNull UserDetails userDetails,
            @Valid @RequestBody @NonNull CartItemRequest request) {
        CartResponse data = cartService.addToCart(Objects.requireNonNull(userDetails.getUsername()), request);
        return ResponseEntity.ok(ApiResponse.success("Đã thêm vào giỏ hàng", data));
    }

    /**
     * updateItem: Adjusts the quantity of an existing item in the cart.
     * Prevents negative quantities via DTO validation and service logic.
     */
    @Operation(summary = "Cập nhật số lượng sản phẩm trong giỏ")
    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @AuthenticationPrincipal @NonNull UserDetails userDetails,
            @PathVariable @NonNull Long cartItemId,
            @Valid @RequestBody @NonNull CartItemUpdateRequest request) {
        CartResponse data = cartService.updateCartItem(Objects.requireNonNull(userDetails.getUsername()), cartItemId, request.getQuantity());
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật giỏ hàng", data));
    }

    /**
     * removeItem: Removes a specific line item from the shopping cart.
     */
    @Operation(summary = "Xoá một sản phẩm khỏi giỏ")
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<Void>> removeItem(
            @AuthenticationPrincipal @NonNull UserDetails userDetails,
            @PathVariable @NonNull Long cartItemId) {
        cartService.removeCartItem(Objects.requireNonNull(userDetails.getUsername()), cartItemId);
        return ResponseEntity.ok(ApiResponse.success("Đã xoá sản phẩm khỏi giỏ hàng", null));
    }

    /**
     * clearCart: Resets the cart state by removing all items for the current user.
     */
    @Operation(summary = "Xoá toàn bộ giỏ hàng")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @AuthenticationPrincipal @NonNull UserDetails userDetails) {
        cartService.clearCart(Objects.requireNonNull(userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success("Đã xoá toàn bộ giỏ hàng", null));
    }
}

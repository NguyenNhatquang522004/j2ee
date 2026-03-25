package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nhom5.demo.constant.AppConstants;
import nhom5.demo.dto.request.CartItemRequest;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.dto.response.CartResponse;
import nhom5.demo.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Cart", description = "Quản lý giỏ hàng")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping(AppConstants.CART_PATH)
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @Operation(summary = "Xem giỏ hàng")
    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        CartResponse data = cartService.getCart(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @Operation(summary = "Thêm sản phẩm vào giỏ hàng")
    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CartItemRequest request) {
        CartResponse data = cartService.addToCart(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Đã thêm vào giỏ hàng", data));
    }

    @Operation(summary = "Cập nhật số lượng sản phẩm trong giỏ")
    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long cartItemId,
            @RequestParam int quantity) {
        CartResponse data = cartService.updateCartItem(userDetails.getUsername(), cartItemId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật giỏ hàng", data));
    }

    @Operation(summary = "Xoá một sản phẩm khỏi giỏ")
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<Void>> removeItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long cartItemId) {
        cartService.removeCartItem(userDetails.getUsername(), cartItemId);
        return ResponseEntity.ok(ApiResponse.success("Đã xoá sản phẩm khỏi giỏ hàng", null));
    }

    @Operation(summary = "Xoá toàn bộ giỏ hàng")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        cartService.clearCart(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Đã xoá toàn bộ giỏ hàng", null));
    }
}

package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.dto.response.ProductResponse;
import nhom5.demo.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

/**
 * REST CONTROLLER: WishlistController
 * ---------------------------------------------------------
 * Manages the user's collection of favorite/saved products.
 * Every interaction is scoped to the authenticated user.
 */
@Tag(name = "Wishlist", description = "Quản lý sản phẩm yêu thích")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    /**
     * getMyWishlist: Retrieves the full list of products marked as favorite by the user.
     */
    @Operation(summary = "Lấy danh sách sản phẩm yêu thích của tôi")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getMyWishlist(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ProductResponse> data = wishlistService.getMyWishlist(Objects.requireNonNull(userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * addToWishlist: Marks a specific product for the user's secondary viewing/later purchase.
     */
    @Operation(summary = "Thêm sản phẩm vào danh sách yêu thích")
    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> addToWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        wishlistService.addToWishlist(Objects.requireNonNull(userDetails.getUsername()), Objects.requireNonNull(productId));
        return ResponseEntity.ok(ApiResponse.success("Đã thêm vào danh sách yêu thích", null));
    }

    /**
     * removeFromWishlist: Unmarks a product from the favorite collection.
     */
    @Operation(summary = "Xoá sản phẩm khỏi danh sách yêu thích")
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        wishlistService.removeFromWishlist(Objects.requireNonNull(userDetails.getUsername()), Objects.requireNonNull(productId));
        return ResponseEntity.ok(ApiResponse.success("Đã xoá khỏi danh sách yêu thích", null));
    }

    /**
     * isInWishlist: Quick check to determine if a product is already in the user's saved list.
     * Used for toggling heart icons on the UI.
     */
    @Operation(summary = "Kiểm tra sản phẩm có trong danh sách yêu thích không")
    @GetMapping("/check/{productId}")
    public ResponseEntity<ApiResponse<Boolean>> isInWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        boolean data = wishlistService.isInWishlist(Objects.requireNonNull(userDetails.getUsername()), Objects.requireNonNull(productId));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * getWishlistCount: Returns the numeric total of saved items.
     * Useful for navbar indicators or sidebars.
     */
    @Operation(summary = "Lấy số lượng sản phẩm yêu thích")
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getWishlistCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        long data = wishlistService.getWishlistCount(Objects.requireNonNull(userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}

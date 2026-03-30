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

@Tag(name = "Wishlist", description = "Quản lý sản phẩm yêu thích")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @Operation(summary = "Lấy danh sách sản phẩm yêu thích của tôi")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getMyWishlist(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ProductResponse> data = wishlistService.getMyWishlist(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @Operation(summary = "Thêm sản phẩm vào danh sách yêu thích")
    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> addToWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        wishlistService.addToWishlist(userDetails.getUsername(), productId);
        return ResponseEntity.ok(ApiResponse.success("Đã thêm vào danh sách yêu thích", null));
    }

    @Operation(summary = "Xoá sản phẩm khỏi danh sách yêu thích")
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        wishlistService.removeFromWishlist(userDetails.getUsername(), productId);
        return ResponseEntity.ok(ApiResponse.success("Đã xoá khỏi danh sách yêu thích", null));
    }

    @Operation(summary = "Kiểm tra sản phẩm có trong danh sách yêu thích không")
    @GetMapping("/check/{productId}")
    public ResponseEntity<ApiResponse<Boolean>> isInWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        boolean data = wishlistService.isInWishlist(userDetails.getUsername(), productId);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @Operation(summary = "Lấy số lượng sản phẩm yêu thích")
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getWishlistCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        long data = wishlistService.getWishlistCount(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}

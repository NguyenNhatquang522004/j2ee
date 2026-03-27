package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nhom5.demo.constant.AppConstants;
import nhom5.demo.dto.request.ReviewRequest;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.dto.response.ReviewResponse;
import nhom5.demo.service.ReviewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Reviews", description = "Đánh giá sản phẩm")
@RestController
@RequestMapping(AppConstants.REVIEW_PATH)
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @Operation(summary = "Đánh giá sản phẩm")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart("review") @Valid ReviewRequest request,
            @RequestPart(value = "files", required = false) java.util.List<org.springframework.web.multipart.MultipartFile> files) throws java.io.IOException {
        ReviewResponse data = reviewService.addReview(userDetails.getUsername(), request, files);
        return ResponseEntity.status(201).body(ApiResponse.created(data));
    }

    @Operation(summary = "Danh sách đánh giá theo sản phẩm (public)")
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getByProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ReviewResponse> data = reviewService.getReviewsByProduct(productId, pageable);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @Operation(summary = "Danh sách tất cả đánh giá (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/all")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(reviewService.getAllReviews(pageable)));
    }

    @Operation(summary = "Duyệt / Phản hồi đánh giá (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{id}/moderate")
    public ResponseEntity<ApiResponse<ReviewResponse>> moderateReview(
            @PathVariable Long id,
            @Valid @RequestBody nhom5.demo.dto.request.ModerateReviewRequest request) {
        ReviewResponse data = reviewService.moderateReview(id, request.getStatus(), request.getAdminReply());
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật trạng thái đánh giá", data));
    }

    @Operation(summary = "Xoá đánh giá (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Đã xoá đánh giá", null));
    }
}

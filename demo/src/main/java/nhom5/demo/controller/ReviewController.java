package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nhom5.demo.constant.AppConstants;
import nhom5.demo.dto.request.ReviewRequest;
import nhom5.demo.dto.request.ModerateReviewRequest;
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
import org.springframework.lang.NonNull;
import java.util.Objects;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

/**
 * REST CONTROLLER: ReviewController
 * ---------------------------------------------------------
 * Manages customer feedback and product ratings.
 * Supports image attachment uploads and administrative moderation.
 * 
 * Visibility:
 * - Public: Approved reviews for each product.
 * - Authenticated: Self-review history and submission.
 * - Admin: Full moderation queue and reply capabilities.
 */
@Tag(name = "Reviews", description = "Đánh giá sản phẩm")
@RestController
@RequestMapping(AppConstants.REVIEW_PATH)
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * addReview: Submits a new customer evaluation for a product.
     * Supports multiple photographic proofs of the product quality.
     * @throws java.io.IOException if image upload fails at the storage layer.
     */
    @Operation(summary = "Đánh giá sản phẩm")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(
            @AuthenticationPrincipal @NonNull UserDetails userDetails,
            @RequestPart("review") @Valid @NonNull ReviewRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) throws java.io.IOException {
        ReviewResponse data = reviewService.addReview(Objects.requireNonNull(userDetails.getUsername()), Objects.requireNonNull(request), files);
        return ResponseEntity.status(201).body(ApiResponse.created(data));
    }

    /**
     * getByProduct: Retrieves approved reviews for a specific item in the shop.
     */
    @Operation(summary = "Danh sách đánh giá theo sản phẩm (public)")
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getByProduct(
            @PathVariable @NonNull Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ReviewResponse> data = reviewService.getReviewsByProduct(Objects.requireNonNull(productId), pageable);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * getMyReviews: Returns the personal review history of the current user.
     */
    @Operation(summary = "Danh sách đánh giá của tôi")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/my-reviews")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getMyReviews(
            @AuthenticationPrincipal @NonNull UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(reviewService.getMyReviews(Objects.requireNonNull(userDetails.getUsername()), pageable)));
    }

    /**
     * getAllReviews: Administrative access to the full database of reviews for moderation.
     */
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

    /**
     * moderateReview: Approves, Rejects, or Replies to a customer review.
     */
    @Operation(summary = "Duyệt / Phản hồi đánh giá (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{id}/moderate")
    public ResponseEntity<ApiResponse<ReviewResponse>> moderateReview(
            @PathVariable @NonNull Long id,
            @Valid @RequestBody @NonNull ModerateReviewRequest request) {
        ReviewResponse data = reviewService.moderateReview(Objects.requireNonNull(id), Objects.requireNonNull(request.getStatus()), request.getAdminReply());
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật trạng thái đánh giá", data));
    }

    /**
     * deleteReview: Permanent removal of a review record from the system.
     */
    @Operation(summary = "Xoá đánh giá (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable @NonNull Long reviewId) {
        reviewService.deleteReview(Objects.requireNonNull(reviewId));
        return ResponseEntity.ok(ApiResponse.success("Đã xoá đánh giá", null));
    }

    /**
     * canReview: Security check for UI logic to determine if a user has purchased the item and can leave feedback.
     */
    @Operation(summary = "Kiểm tra quyền đánh giá")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/can-review/{productId}")
    public ResponseEntity<ApiResponse<Boolean>> canReview(
            @AuthenticationPrincipal @NonNull UserDetails userDetails,
            @PathVariable @NonNull Long productId) {
        boolean canReview = reviewService.canReview(Objects.requireNonNull(userDetails.getUsername()), Objects.requireNonNull(productId));
        return ResponseEntity.ok(ApiResponse.success(canReview));
    }
}

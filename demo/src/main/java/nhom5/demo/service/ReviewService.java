package nhom5.demo.service;

import nhom5.demo.dto.request.ReviewRequest;
import nhom5.demo.dto.response.ReviewResponse;
import nhom5.demo.enums.ReviewStatusEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

public interface ReviewService {
    ReviewResponse addReview(@NonNull String username, @NonNull ReviewRequest request, List<MultipartFile> files) throws IOException;

    Page<ReviewResponse> getReviewsByProduct(@NonNull Long productId, Integer rating, String viewerUsername, @NonNull Pageable pageable);

    Page<ReviewResponse> getMyReviews(@NonNull String username, @NonNull Pageable pageable);

    Page<ReviewResponse> getAllReviews(@NonNull Pageable pageable);

    ReviewResponse moderateReview(@NonNull Long id, @NonNull ReviewStatusEnum status, String adminReply);

    void deleteReview(@NonNull Long reviewId);
    void deleteMyReview(@NonNull String username, @NonNull Long reviewId);
    ReviewResponse updateReview(@NonNull String username, @NonNull Long reviewId, @NonNull ReviewRequest request, List<MultipartFile> files) throws IOException;
    String canReview(@NonNull String username, @NonNull Long productId);
}

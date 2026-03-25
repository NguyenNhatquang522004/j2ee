package nhom5.demo.service;

import nhom5.demo.dto.request.ReviewRequest;
import nhom5.demo.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewResponse addReview(String username, ReviewRequest request);

    Page<ReviewResponse> getReviewsByProduct(Long productId, Pageable pageable);

    void deleteReview(Long reviewId, String username);
}

package nhom5.demo.service;

import nhom5.demo.dto.request.ReviewRequest;
import nhom5.demo.dto.response.ReviewResponse;
import nhom5.demo.enums.ReviewStatusEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewResponse addReview(String username, ReviewRequest request, java.util.List<org.springframework.web.multipart.MultipartFile> files) throws java.io.IOException;

    Page<ReviewResponse> getReviewsByProduct(Long productId, Pageable pageable);

    Page<ReviewResponse> getAllReviews(Pageable pageable);

    ReviewResponse moderateReview(Long id, ReviewStatusEnum status, String adminReply);

    void deleteReview(Long reviewId);
}

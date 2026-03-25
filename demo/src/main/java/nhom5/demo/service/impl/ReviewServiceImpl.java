package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.request.ReviewRequest;
import nhom5.demo.dto.response.ReviewResponse;
import nhom5.demo.entity.Product;
import nhom5.demo.entity.Review;
import nhom5.demo.entity.User;
import nhom5.demo.exception.BusinessException;
import nhom5.demo.exception.ResourceNotFoundException;
import nhom5.demo.repository.OrderItemRepository;
import nhom5.demo.repository.ProductRepository;
import nhom5.demo.repository.ReviewRepository;
import nhom5.demo.repository.UserRepository;
import nhom5.demo.service.ReviewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    @Transactional
    public ReviewResponse addReview(String username, ReviewRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        // Validate: user must have purchased this product
        if (!orderItemRepository.existsByOrderUserIdAndProductId(user.getId(), product.getId())) {
            throw new BusinessException("Bạn chỉ có thể đánh giá sản phẩm đã mua");
        }

        if (reviewRepository.existsByProductIdAndUserId(product.getId(), user.getId())) {
            throw new BusinessException("Bạn đã đánh giá sản phẩm này rồi");
        }

        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .product(product)
                .user(user)
                .build();

        return toResponse(reviewRepository.save(review));
    }

    @Override
    public Page<ReviewResponse> getReviewsByProduct(Long productId, Pageable pageable) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId, String username) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new BusinessException("Bạn không có quyền xóa đánh giá này");
        }

        reviewRepository.delete(review);
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .userId(review.getUser().getId())
                .username(review.getUser().getUsername())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .createdAt(review.getCreatedAt())
                .build();
    }
}

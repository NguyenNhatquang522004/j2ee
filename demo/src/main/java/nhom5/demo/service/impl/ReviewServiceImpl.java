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
import nhom5.demo.security.SecurityUtils;
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
    private final com.cloudinary.Cloudinary cloudinary;

    @Override
    @Transactional
    public ReviewResponse addReview(String username, ReviewRequest request, java.util.List<org.springframework.web.multipart.MultipartFile> files) throws java.io.IOException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        // Validate: user must have purchased and received this product
        if (!orderItemRepository.existsByOrderUserIdAndProductIdAndOrderStatus(
                user.getId(), product.getId(), nhom5.demo.enums.OrderStatusEnum.DELIVERED)) {
            throw new BusinessException("Bạn chỉ có thể đánh giá sản phẩm sau khi đã nhận được hàng");
        }

        if (reviewRepository.existsByProductIdAndUserIdAndStatusIsNot(product.getId(), user.getId(), nhom5.demo.enums.ReviewStatusEnum.REJECTED)) {
            throw new BusinessException("Bạn đã đánh giá sản phẩm này rồi");
        }

        Review review = Review.builder()
                .rating(request.getRating())
                .comment(SecurityUtils.sanitize(request.getComment()))
                .product(product)
                .user(user)
                .status(nhom5.demo.enums.ReviewStatusEnum.PENDING)
                .build();

        Review savedReview = reviewRepository.save(review);

        if (files != null && !files.isEmpty()) {
            for (org.springframework.web.multipart.MultipartFile file : files) {
                String resourceType = file.getContentType() != null && file.getContentType().startsWith("video") ? "video" : "image";
                java.util.Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), 
                        com.cloudinary.utils.ObjectUtils.asMap("resource_type", resourceType, "folder", "reviews"));
                
                nhom5.demo.entity.ReviewMedia media = nhom5.demo.entity.ReviewMedia.builder()
                        .url(uploadResult.get("secure_url").toString())
                        .fileType(resourceType)
                        .review(savedReview)
                        .build();
                savedReview.getMedia().add(media);
            }
        }

        return toResponse(reviewRepository.save(savedReview));
    }

    @Override
    public Page<ReviewResponse> getReviewsByProduct(Long productId, Pageable pageable) {
        return reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(productId, nhom5.demo.enums.ReviewStatusEnum.APPROVED, pageable).map(this::toResponse);
    }

    @Override
    public Page<ReviewResponse> getAllReviews(Pageable pageable) {
        return reviewRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public ReviewResponse moderateReview(Long id, nhom5.demo.enums.ReviewStatusEnum status, String adminReply) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
        review.setStatus(status);
        review.setAdminReply(SecurityUtils.sanitize(adminReply));
        return toResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new ResourceNotFoundException("Review", "id", reviewId);
        }
        reviewRepository.deleteById(reviewId);
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .userId(review.getUser().getId())
                .username(review.getUser().getUsername())
                .userFullName(review.getUser().getFullName())
                .userAvatarUrl(review.getUser().getAvatarUrl())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .status(review.getStatus())
                .adminReply(review.getAdminReply())
                .mediaUrls(review.getMedia().stream().map(m -> m.getUrl()).collect(java.util.stream.Collectors.toList()))
                .createdAt(review.getCreatedAt())
                .build();
    }
}

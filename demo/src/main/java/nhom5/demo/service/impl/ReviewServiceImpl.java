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
import org.springframework.lang.NonNull;
import java.util.Objects;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;
import nhom5.demo.enums.OrderStatusEnum;
import nhom5.demo.enums.ReviewStatusEnum;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final com.cloudinary.Cloudinary cloudinary;

    @SuppressWarnings("null")
    @Override
    @Transactional
    public ReviewResponse addReview(@NonNull String username, @NonNull ReviewRequest request, List<MultipartFile> files)
            throws IOException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Long productId = Objects.requireNonNull(request.getProductId());
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (!product.getIsActive()) {
            throw new BusinessException("Sản phẩm này đã ngừng kinh doanh, không thể đánh giá");
        }

        // Validate: user must have purchased and received this product
        Long userId = Objects.requireNonNull(user.getId());
        if (!orderItemRepository.existsByOrderUserIdAndProductIdAndOrderStatus(
                userId, productId, OrderStatusEnum.DELIVERED)) {
            throw new BusinessException("Bạn chỉ có thể đánh giá sản phẩm sau khi đã nhận được hàng");
        }

        if (reviewRepository.existsByProductIdAndUserIdAndStatusIsNot(productId, userId, ReviewStatusEnum.REJECTED)) {
            throw new BusinessException("Bạn đã đánh giá sản phẩm này rồi");
        }

        Review review = Review.builder()
                .rating(request.getRating())
                .comment(SecurityUtils.sanitize(request.getComment()))
                .product(product)
                .user(user)
                .status(ReviewStatusEnum.PENDING)
                .media(new java.util.ArrayList<>()) // Ensure list is initialized
                .build();

        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                String contentType = file.getContentType();
                boolean isVideo = contentType != null && contentType.startsWith("video");
                long maxSize = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024;

                if (file.getSize() > maxSize) {
                    throw new BusinessException((isVideo ? "Video" : "Hình ảnh") + " đánh giá không được vượt quá "
                            + (maxSize / (1024 * 1024)) + "MB");
                }

                String resourceType = isVideo ? "video" : "image";
                Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                        com.cloudinary.utils.ObjectUtils.asMap("resource_type", resourceType, "folder", "reviews"));

                nhom5.demo.entity.ReviewMedia media = nhom5.demo.entity.ReviewMedia.builder()
                        .url(Objects.requireNonNull(uploadResult.get("secure_url")).toString())
                        .fileType(resourceType)
                        .review(review) // Link to the unsaved review
                        .build();
                review.getMedia().add(media);
            }
        }

        return toResponse(java.util.Objects.requireNonNull(reviewRepository.save(review)));
    }

    @Override
    public Page<ReviewResponse> getReviewsByProduct(@NonNull Long productId, @NonNull Pageable pageable) {
        return reviewRepository
                .findByProductIdAndStatusOrderByCreatedAtDesc(productId, ReviewStatusEnum.APPROVED, pageable)
                .map(this::toResponse);
    }

    @Override
    public Page<ReviewResponse> getMyReviews(@NonNull String username, @NonNull Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        Long userId = Objects.requireNonNull(user.getId());
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable).map(this::toResponse);
    }

    @Override
    public Page<ReviewResponse> getAllReviews(@NonNull Pageable pageable) {
        return reviewRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public ReviewResponse moderateReview(@NonNull Long id, @NonNull ReviewStatusEnum status, String adminReply) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
        review.setStatus(status);
        review.setAdminReply(SecurityUtils.sanitize(adminReply));
        return toResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional
    public void deleteReview(@NonNull Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new ResourceNotFoundException("Review", "id", reviewId);
        }
        reviewRepository.deleteById(reviewId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canReview(@NonNull String username, @NonNull Long productId) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null)
            return false;

        Long userId = Objects.requireNonNull(user.getId());
        boolean hasPurchased = orderItemRepository.existsByOrderUserIdAndProductIdAndOrderStatus(
                userId, productId, OrderStatusEnum.DELIVERED);

        if (!hasPurchased)
            return false;

        boolean alreadyReviewed = reviewRepository.existsByProductIdAndUserIdAndStatusIsNot(
                productId, userId, ReviewStatusEnum.REJECTED);

        return !alreadyReviewed;
    }

    private ReviewResponse toResponse(@NonNull Review review) {
        User user = Objects.requireNonNull(review.getUser());
        Product product = Objects.requireNonNull(review.getProduct());

        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .userId(user.getId())
                .username(user.getUsername())
                .userFullName(user.getFullName())
                .userAvatarUrl(user.getAvatarUrl())
                .productId(product.getId())
                .productName(product.getName())
                .status(review.getStatus())
                .adminReply(review.getAdminReply())
                .mediaUrls(review.getMedia().stream()
                        .map(m -> Objects.requireNonNull(m.getUrl()))
                        .collect(java.util.stream.Collectors.toList()))
                .createdAt(review.getCreatedAt())
                .build();
    }
}

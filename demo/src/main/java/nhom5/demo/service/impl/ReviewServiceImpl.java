package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.request.ReviewRequest;
import nhom5.demo.dto.response.ReviewResponse;
import nhom5.demo.dto.response.MediaResponse;
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
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByProduct(@NonNull Long productId, Integer rating, String viewerUsername, @NonNull Pageable pageable) {
        return reviewRepository
                .findByProductIdAndRating(productId, ReviewStatusEnum.APPROVED, viewerUsername, rating, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getMyReviews(@NonNull String username, @NonNull Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        Long userId = Objects.requireNonNull(user.getId());
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
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
    @Transactional
    public void deleteMyReview(@NonNull String username, @NonNull Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        
        if (!review.getUser().getUsername().equals(username)) {
            throw new BusinessException("Bạn không có quyền xoá đánh giá của người khác");
        }
        
        reviewRepository.delete(review);
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(@NonNull String username, @NonNull Long reviewId, @NonNull ReviewRequest request, List<MultipartFile> files) throws IOException {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!review.getUser().getUsername().equals(username)) {
            throw new BusinessException("Bạn không có quyền sửa đánh giá của người khác");
        }

        if (request.getRating() != null) {
            review.setRating(request.getRating());
        }
        
        if (request.getComment() != null) {
            review.setComment(SecurityUtils.sanitize(request.getComment()));
        }
        
        review.setStatus(ReviewStatusEnum.PENDING); // Reset status for re-moderation

        // 1. Remove media if requested
        if (request.getRemoveMediaIds() != null && !request.getRemoveMediaIds().isEmpty()) {
            review.getMedia().removeIf(m -> request.getRemoveMediaIds().contains(m.getId()));
        }

        // 2. Add new media if provided
        if (files != null && !files.isEmpty()) {
            if (review.getMedia() == null) {
                review.setMedia(new java.util.ArrayList<>());
            }
            
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
                        .review(review)
                        .build();
                review.getMedia().add(media);
            }
        }

        return toResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional(readOnly = true)
    public String canReview(@NonNull String username, @NonNull Long productId) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null)
            return "NOT_PURCHASED"; // Default to forbid if user not found

        Long userId = Objects.requireNonNull(user.getId());
        boolean hasPurchased = orderItemRepository.existsByOrderUserIdAndProductIdAndOrderStatus(
                userId, productId, OrderStatusEnum.DELIVERED);

        if (!hasPurchased)
            return "NOT_PURCHASED";

        boolean alreadyReviewed = reviewRepository.existsByProductIdAndUserIdAndStatusIsNot(
                productId, userId, ReviewStatusEnum.REJECTED);

        if (alreadyReviewed)
            return "ALREADY_REVIEWED";

        return "ALLOWED";
    }

    private ReviewResponse toResponse(@NonNull Review review) {
        User user = review.getUser();
        Product product = review.getProduct();

        java.util.List<MediaResponse> mediaResponses = (review.getMedia() == null) ? new java.util.ArrayList<>() : 
                review.getMedia().stream()
                        .map(m -> MediaResponse.builder()
                                .id(m.getId())
                                .url(m.getUrl())
                                .fileType(m.getFileType())
                                .build())
                        .collect(java.util.stream.Collectors.toList());

        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .userId(user != null ? user.getId() : null)
                .username(user != null ? user.getUsername() : "deleted")
                .userFullName(user != null ? user.getFullName() : "Người dùng đã xóa")
                .userAvatarUrl(user != null ? user.getAvatarUrl() : null)
                .productId(product != null ? product.getId() : null)
                .productName(product != null ? product.getName() : "Sản phẩm đã xóa")
                .status(review.getStatus())
                .adminReply(review.getAdminReply())
                .media(mediaResponses)
                .createdAt(review.getCreatedAt())
                .build();
    }
}

package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.response.ProductResponse;
import nhom5.demo.entity.Product;
import nhom5.demo.entity.User;
import nhom5.demo.entity.WishlistItem;
import nhom5.demo.exception.ResourceNotFoundException;
import nhom5.demo.repository.ProductRepository;
import nhom5.demo.repository.UserRepository;
import nhom5.demo.repository.WishlistItemRepository;
import nhom5.demo.service.WishlistService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;
import java.util.Objects;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final nhom5.demo.repository.ProductBatchRepository batchRepository;
    private final nhom5.demo.repository.ReviewRepository reviewRepository;
    private final nhom5.demo.repository.FlashSaleItemRepository flashSaleItemRepository;

    @Override
    @Transactional
    public void addToWishlist(String username, Long productId) {
        User user = findUserByUsername(Objects.requireNonNull(username));
        Product product = findProductById(Objects.requireNonNull(productId));

        Long userId = Objects.requireNonNull(user.getId());
        if (!wishlistItemRepository.existsByUserIdAndProductId(userId, productId)) {
            WishlistItem item = WishlistItem.builder()
                    .user(user)
                    .product(product)
                    .build();
            wishlistItemRepository.save(Objects.requireNonNull(item));
        }
    }

    @Override
    @Transactional
    public void removeFromWishlist(String username, Long productId) {
        User user = findUserByUsername(Objects.requireNonNull(username));
        Long userId = Objects.requireNonNull(user.getId());
        wishlistItemRepository.findByUserIdAndProductId(userId, productId)
                .ifPresent(wishlistItemRepository::delete);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getMyWishlist(String username) {
        User user = findUserByUsername(Objects.requireNonNull(username));
        Long userId = Objects.requireNonNull(user.getId());
        return wishlistItemRepository.findByUserId(userId).stream()
                .map(item -> toProductResponse(Objects.requireNonNull(item.getProduct())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isInWishlist(String username, Long productId) {
        User user = findUserByUsername(Objects.requireNonNull(username));
        Long userId = Objects.requireNonNull(user.getId());
        return wishlistItemRepository.existsByUserIdAndProductId(userId, productId);
    }

    @Override
    @Transactional(readOnly = true)
    public long getWishlistCount(String username) {
        User user = findUserByUsername(Objects.requireNonNull(username));
        Long userId = Objects.requireNonNull(user.getId());
        return wishlistItemRepository.countByUserId(userId);
    }

    private User findUserByUsername(@NonNull String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    private Product findProductById(@NonNull Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    private ProductResponse toProductResponse(@NonNull Product product) {
        Long productId = Objects.requireNonNull(product.getId());
        Long totalStock = batchRepository.sumRemainingQuantityByProductId(productId, LocalDate.now());
        Double avgRating = reviewRepository.findAverageRatingByProductId(productId);

        // Check Flash Sale for price display
        BigDecimal fsPrice = null;
        LocalDateTime fsEndDate = null;
        java.util.Optional<nhom5.demo.entity.FlashSaleItem> fsItemOpt = flashSaleItemRepository.findActiveByProductId(productId, LocalDateTime.now());
        
        if (fsItemOpt.isPresent()) {
            nhom5.demo.entity.FlashSaleItem fsItem = fsItemOpt.get();
            if (fsItem.getSoldQuantity() < fsItem.getQuantityLimit()) {
                fsPrice = fsItem.getFlashSalePrice();
                fsEndDate = Objects.requireNonNull(fsItem.getFlashSale()).getEndTime();
            }
        }

        return ProductResponse.builder()
                .id(productId)
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .imageUrl(product.getImageUrl())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .farmName(product.getFarm() != null ? product.getFarm().getName() : null)
                .farmProvince(product.getFarm() != null ? product.getFarm().getProvince() : null)
                .isActive(product.getIsActive())
                .isNew(product.getIsNew())
                .totalStock(totalStock != null ? totalStock.intValue() : 0)
                .averageRating(avgRating != null ? avgRating : 0.0)
                .unit(product.getUnit())
                .flashSalePrice(fsPrice)
                .flashSaleEndDate(fsEndDate)
                .build();
    }
}

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

    @Override
    @Transactional
    public void addToWishlist(String username, Long productId) {
        User user = findUserByUsername(username);
        Product product = findProductById(productId);

        if (!wishlistItemRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            WishlistItem item = WishlistItem.builder()
                    .user(user)
                    .product(product)
                    .build();
            wishlistItemRepository.save(item);
        }
    }

    @Override
    @Transactional
    public void removeFromWishlist(String username, Long productId) {
        User user = findUserByUsername(username);
        wishlistItemRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getMyWishlist(String username) {
        User user = findUserByUsername(username);
        return wishlistItemRepository.findByUserId(user.getId()).stream()
                .map(item -> toProductResponse(item.getProduct()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isInWishlist(String username, Long productId) {
        User user = findUserByUsername(username);
        return wishlistItemRepository.existsByUserIdAndProductId(user.getId(), productId);
    }

    @Override
    @Transactional(readOnly = true)
    public long getWishlistCount(String username) {
        User user = findUserByUsername(username);
        return wishlistItemRepository.countByUserId(user.getId());
    }

    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    private Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    private ProductResponse toProductResponse(Product product) {
        Long totalStock = batchRepository.sumRemainingQuantityByProductId(product.getId());
        Double avgRating = reviewRepository.findAverageRatingByProductId(product.getId());

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .farmName(product.getFarm() != null ? product.getFarm().getName() : null)
                .farmProvince(product.getFarm() != null ? product.getFarm().getProvince() : null)
                .totalStock(totalStock != null ? totalStock.intValue() : 0)
                .averageRating(avgRating != null ? avgRating : 0.0)
                .unit(product.getUnit())
                .build();
    }
}

package nhom5.demo.service;

import nhom5.demo.dto.response.ProductResponse;
import java.util.List;

public interface WishlistService {
    void addToWishlist(String username, Long productId);
    void removeFromWishlist(String username, Long productId);
    List<ProductResponse> getMyWishlist(String username);
    boolean isInWishlist(String username, Long productId);
    long getWishlistCount(String username);
}

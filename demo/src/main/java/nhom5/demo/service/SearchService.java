package nhom5.demo.service;

import nhom5.demo.dto.response.ProductResponse;
import java.util.List;

public interface SearchService {
    void indexProduct(ProductResponse product);
    void deleteProduct(Long id);
    List<Long> searchProductIds(String query);
    void clearAll();
}

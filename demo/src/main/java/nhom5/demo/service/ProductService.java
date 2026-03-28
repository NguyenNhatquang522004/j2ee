package nhom5.demo.service;

import nhom5.demo.dto.request.ProductRequest;
import nhom5.demo.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

    ProductResponse getProductById(Long id);

    Page<ProductResponse> searchProducts(String name, Long categoryId, Long farmId, Boolean isActive, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice, Boolean isNew, Boolean isSale, Pageable pageable);

    Page<ProductResponse> getTopSellingProducts(Pageable pageable);
    void toggleProductStatus(Long id);
}

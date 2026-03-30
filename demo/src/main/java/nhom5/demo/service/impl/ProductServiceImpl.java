package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import nhom5.demo.dto.request.ProductRequest;
import nhom5.demo.dto.response.ProductResponse;
import nhom5.demo.entity.Category;
import nhom5.demo.entity.Farm;
import nhom5.demo.entity.Product;
import nhom5.demo.exception.ResourceNotFoundException;
import nhom5.demo.repository.CategoryRepository;
import nhom5.demo.repository.FarmRepository;
import nhom5.demo.repository.ProductRepository;
import nhom5.demo.security.SecurityUtils;
import nhom5.demo.service.AuditService;
import nhom5.demo.service.ProductService;
import nhom5.demo.service.SearchService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FarmRepository farmRepository;
    private final AuditService auditService;
    private final SearchService searchService;

    @Override
    @Transactional
    @CacheEvict(value = {"products", "product_detail"}, allEntries = true)
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        Farm farm = farmRepository.findById(request.getFarmId())
                .orElseThrow(() -> new ResourceNotFoundException("Farm", "id", request.getFarmId()));

        Product product = Product.builder()
                .name(SecurityUtils.sanitize(request.getName()))
                .description(SecurityUtils.sanitize(request.getDescription()))
                .price(request.getPrice())
                .unit(request.getUnit())
                .imageUrl(request.getImageUrl())
                .category(category)
                .farm(farm)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isNew(request.getIsNew() != null ? request.getIsNew() : true)
                .originalPrice(request.getOriginalPrice())
                .build();

        Product savedProduct = productRepository.save(product);
        ProductResponse response = toResponse(savedProduct);
        
        // Sync index to Meilisearch
        searchService.indexProduct(response);
        
        auditService.log(SecurityUtils.getCurrentUsername(), "CREATE", "Product", savedProduct.getId().toString(), "Created product: " + savedProduct.getName());
        return response;
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "product_detail"}, allEntries = true)
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findById(id);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        Farm farm = farmRepository.findById(request.getFarmId())
                .orElseThrow(() -> new ResourceNotFoundException("Farm", "id", request.getFarmId()));

        product.setName(SecurityUtils.sanitize(request.getName()));
        product.setDescription(SecurityUtils.sanitize(request.getDescription()));
        product.setPrice(request.getPrice());
        product.setUnit(request.getUnit());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);
        product.setFarm(farm);
        if (request.getIsActive() != null)
            product.setIsActive(request.getIsActive());
        if (request.getIsNew() != null)
            product.setIsNew(request.getIsNew());
        product.setOriginalPrice(request.getOriginalPrice());

        Product savedProduct = productRepository.save(product);
        ProductResponse response = toResponse(savedProduct);

        // Sync to Meilisearch
        searchService.indexProduct(response);
        
        auditService.log(SecurityUtils.getCurrentUsername(), "UPDATE", "Product", savedProduct.getId().toString(), "Updated product: " + savedProduct.getName());
        return response;
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "product_detail"}, allEntries = true)
    public void deleteProduct(Long id) {
        Product product = findById(id);
        product.setIsActive(false);
        productRepository.save(product);
        
        // Sync to Meilisearch
        searchService.deleteProduct(id);
        
        auditService.log(SecurityUtils.getCurrentUsername(), "SOFT_DELETE", "Product", id.toString(), "Soft-deleted product (isActive=false): " + product.getName());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "product_detail", key = "#id")
    public ProductResponse getProductById(Long id) {
        Product product = findById(id);
        
        if (!product.getIsActive()) {
            boolean isAdmin = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication() != null &&
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isAdmin) {
                throw new ResourceNotFoundException("Product", "id", id);
            }
        }
        
        return toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    // @Cacheable(value = "products", key = "{#name, #categoryId, #farmId, #isActive, #minPrice, #maxPrice, #isNew, #isSale, #pageable.pageNumber, #pageable.pageSize}")
    public Page<ProductResponse> searchProducts(String name, Long categoryId, Long farmId, Boolean isActive, BigDecimal minPrice, BigDecimal maxPrice, Boolean isNew, Boolean isSale, Pageable pageable) {
        if (name != null && !name.isBlank()) {
            List<Long> ids = searchService.searchProductIds(name);
            if (ids.isEmpty()) {
                return Page.empty(pageable);
            }
            return productRepository.searchProductsByIds(ids, categoryId, farmId, isActive, minPrice, maxPrice, isNew, isSale, pageable)
                    .map(this::toResponse);
        }
        return productRepository.searchProducts(name, categoryId, farmId, isActive, minPrice, maxPrice, isNew, isSale, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getTopSellingProducts(Pageable pageable) {
        return productRepository.findTopSellingProducts(pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "product_detail"}, allEntries = true)
    public void toggleProductStatus(Long id) {
        Product product = findById(id);
        product.setIsActive(!product.getIsActive());
        productRepository.save(product);

        if (product.getIsActive()) {
            searchService.indexProduct(toResponse(product));
        } else {
            searchService.deleteProduct(id);
        }
        
        auditService.log(SecurityUtils.getCurrentUsername(), "TOGGLE_STATUS", "Product", id.toString(), 
                "Toggled product status for ID: " + id + " to " + product.getIsActive());
    }

    private Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    /**
     * Chuyển đổi từ Entity sang DTO.
     * Tính toán tổng tồn kho thực tế và điểm đánh giá trung bình.
     */
    private ProductResponse toResponse(Product product) {
        int totalStock = product.getBatches().stream()
                .filter(b -> b.getExpiryDate().isAfter(java.time.LocalDate.now()))
                .mapToInt(nhom5.demo.entity.ProductBatch::getRemainingQuantity)
                .sum();

        double avgRating = product.getReviews().stream()
                .mapToInt(nhom5.demo.entity.Review::getRating)
                .average()
                .orElse(0.0);

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .unit(product.getUnit())
                .imageUrl(product.getImageUrl())
                .isActive(product.getIsActive())
                .isNew(product.getIsNew())
                .originalPrice(product.getOriginalPrice())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : "N/A")
                .farmName(product.getFarm() != null ? product.getFarm().getName() : "N/A")
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .farmId(product.getFarm() != null ? product.getFarm().getId() : null)
                .totalStock(totalStock)
                .averageRating(avgRating)
                .reviewCount(product.getReviews().size())
                .build();
    }
}

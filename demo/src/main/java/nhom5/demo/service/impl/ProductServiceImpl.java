package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.request.ProductRequest;
import nhom5.demo.dto.response.ProductResponse;
import nhom5.demo.entity.Category;
import nhom5.demo.entity.Farm;
import nhom5.demo.entity.Product;
import nhom5.demo.exception.ResourceNotFoundException;
import nhom5.demo.repository.CategoryRepository;
import nhom5.demo.repository.FarmRepository;
import nhom5.demo.repository.ProductBatchRepository;
import nhom5.demo.repository.ProductRepository;
import nhom5.demo.repository.ReviewRepository;
import nhom5.demo.security.SecurityUtils;
import nhom5.demo.service.AuditService;
import nhom5.demo.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FarmRepository farmRepository;
    private final ProductBatchRepository batchRepository;
    private final ReviewRepository reviewRepository;
    private final AuditService auditService;

    @Override
    @Transactional
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
        auditService.log(SecurityUtils.getCurrentUsername(), "CREATE", "Product", savedProduct.getId().toString(), "Created product: " + savedProduct.getName());
        return toResponse(savedProduct);
    }

    @Override
    @Transactional
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
        auditService.log(SecurityUtils.getCurrentUsername(), "UPDATE", "Product", savedProduct.getId().toString(), "Updated product: " + savedProduct.getName());
        return toResponse(savedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product", "id", id);
        }
        productRepository.deleteById(id);
        auditService.log(SecurityUtils.getCurrentUsername(), "DELETE", "Product", id.toString(), "Deleted product with ID: " + id);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = findById(id);
        
        // Nếu sản phẩm đã ẩn, chỉ cho phép ADMIN xem
        if (!product.getIsActive()) {
            boolean isAdmin = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication() != null &&
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isAdmin) {
                throw new nhom5.demo.exception.ResourceNotFoundException("Product", "id", id);
            }
        }
        
        return toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String name, Long categoryId, Long farmId, Boolean isActive, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice, Boolean isNew, Boolean isSale, Pageable pageable) {
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
    public void toggleProductStatus(Long id) {
        Product product = findById(id);
        product.setIsActive(!product.getIsActive());
        productRepository.save(product);
        auditService.log(SecurityUtils.getCurrentUsername(), "TOGGLE_STATUS", "Product", id.toString(), 
                "Toggled product status for ID: " + id + " to " + product.getIsActive());
    }

    private Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    private ProductResponse toResponse(Product product) {
        Long totalStock = batchRepository.sumRemainingQuantityByProductId(product.getId());
        Double avgRating = reviewRepository.findAverageRatingByProductId(product.getId());

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
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .farmId(product.getFarm() != null ? product.getFarm().getId() : null)
                .farmName(product.getFarm() != null ? product.getFarm().getName() : null)
                .farmAddress(product.getFarm() != null ? product.getFarm().getAddress() : null)
                .farmProvince(product.getFarm() != null ? product.getFarm().getProvince() : null)
                .certification(product.getFarm() != null && product.getFarm().getCertification() != null
                        ? product.getFarm().getCertification().name()
                        : null)
                .certificationDescription(product.getFarm() != null && product.getFarm().getCertification() != null
                        ? product.getFarm().getCertification().getDescription()
                        : null)
                .totalStock(totalStock != null ? totalStock.intValue() : 0)
                .averageRating(avgRating != null ? avgRating : 0.0)
                .build();
    }
}

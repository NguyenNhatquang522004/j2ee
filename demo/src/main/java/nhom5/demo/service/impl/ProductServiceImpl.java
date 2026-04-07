package nhom5.demo.service.impl;

import java.util.List;
import java.util.Map;
import nhom5.demo.dto.request.ProductRequest;
import nhom5.demo.dto.response.ProductResponse;
import nhom5.demo.entity.Category;
import nhom5.demo.entity.Farm;
import nhom5.demo.entity.Product;
import nhom5.demo.exception.ResourceNotFoundException;
import nhom5.demo.repository.CategoryRepository;
import nhom5.demo.repository.FarmRepository;
import nhom5.demo.repository.ProductRepository;
import nhom5.demo.repository.ProductBatchRepository;
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
import org.springframework.lang.NonNull;
import java.util.Objects;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FarmRepository farmRepository;
    private final AuditService auditService;
    private final ProductBatchRepository batchRepository;
    private final SearchService searchService;
    private final nhom5.demo.repository.FlashSaleItemRepository flashSaleItemRepository;

    public ProductServiceImpl(ProductRepository productRepository,
                             CategoryRepository categoryRepository,
                             FarmRepository farmRepository,
                             AuditService auditService,
                             ProductBatchRepository batchRepository,
                             SearchService searchService,
                             nhom5.demo.repository.FlashSaleItemRepository flashSaleItemRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.farmRepository = farmRepository;
        this.auditService = auditService;
        this.batchRepository = batchRepository;
        this.searchService = searchService;
        this.flashSaleItemRepository = flashSaleItemRepository;
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "product_detail"}, allEntries = true)
    public ProductResponse createProduct(ProductRequest request) {
        Long catId = request.getCategoryId();
        Long farmId = request.getFarmId();

        if (catId == null) throw new nhom5.demo.exception.BusinessException("Danh mục không được để trống");
        if (farmId == null) throw new nhom5.demo.exception.BusinessException("Trang trại không được để trống");

        Category category = categoryRepository.findById(catId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", catId));
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm", "id", farmId));

        if (request.getPrice() != null && request.getPrice().compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new nhom5.demo.exception.BusinessException("Giá sản phẩm không được âm");
        }
        if (request.getOriginalPrice() != null && request.getPrice() != null && request.getOriginalPrice().compareTo(request.getPrice()) < 0) {
            throw new nhom5.demo.exception.BusinessException("Giá gốc phải lớn hơn hoặc bằng giá hiện tại");
        }

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

        Product savedProduct = productRepository.save(Objects.requireNonNull(product));
        ProductResponse response = toResponse(savedProduct);
        
        try {
            // Sync index to Meilisearch ONLY if active
            if (savedProduct.getIsActive()) {
                searchService.indexProduct(response);
            }
        } catch (Exception e) {
            log.error("Failed to sync new product {} to Meilisearch: {}", savedProduct.getId(), e.getMessage());
        }
        
        auditService.log(SecurityUtils.getCurrentUsername(), "CREATE", "Product", savedProduct.getId().toString(), "Created product: " + savedProduct.getName());
        return response;
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "product_detail"}, allEntries = true)
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findById(id);

        Long catId = request.getCategoryId();
        Long farmId = request.getFarmId();

        if (catId == null) throw new nhom5.demo.exception.BusinessException("Danh mục không được để trống");
        if (farmId == null) throw new nhom5.demo.exception.BusinessException("Trang trại không được để trống");

        Category category = categoryRepository.findById(catId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", catId));
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm", "id", farmId));

        if (request.getPrice() != null && request.getPrice().compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new nhom5.demo.exception.BusinessException("Giá sản phẩm không được âm");
        }
        if (request.getOriginalPrice() != null && request.getPrice() != null && request.getOriginalPrice().compareTo(request.getPrice()) < 0) {
            throw new nhom5.demo.exception.BusinessException("Giá gốc phải lớn hơn hoặc bằng giá hiện tại");
        }

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

        try {
            // Sync to Meilisearch - delete if inactive, index if active
            if (savedProduct.getIsActive()) {
                searchService.indexProduct(response);
            } else {
                searchService.deleteProduct(id);
            }
        } catch (Exception e) {
            log.error("Failed to sync updated product {} to Meilisearch: {}", savedProduct.getId(), e.getMessage());
        }
        
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
        
        try {
            // Sync to Meilisearch
            searchService.deleteProduct(id);
        } catch (Exception e) {
            log.error("Failed to delete product {} from Meilisearch index: {}", id, e.getMessage());
        }
        
        auditService.log(SecurityUtils.getCurrentUsername(), "SOFT_DELETE", "Product", id.toString(), "Soft-deleted product (isActive=false): " + product.getName());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "product_detail", key = "#id")
    public ProductResponse getProductById(Long id) {
        Product product = findById(id);
        
        if (!product.getIsActive()) {
            boolean isStaffOrAdmin = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication() != null &&
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || 
                                          a.getAuthority().equals("view:products") || 
                                          a.getAuthority().equals("manage:products"));
            if (!isStaffOrAdmin) {
                throw new ResourceNotFoundException("Product", "id", id);
            }
        }
        
        return toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "product_detail", key = "#slug")
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));

        if (!product.getIsActive()) {
            boolean isStaffOrAdmin = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication() != null &&
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || 
                                          a.getAuthority().equals("view:products") || 
                                          a.getAuthority().equals("manage:products"));
            if (!isStaffOrAdmin) {
                throw new ResourceNotFoundException("Product", "slug", slug);
            }
        }

        return toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String name, Long categoryId, Long farmId, Boolean isActive, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice, Boolean isNew, Boolean isSale, @NonNull Pageable pageable) {
        if (name != null && !name.isBlank()) {
            List<Long> ids = searchService.searchProductIds(name);
            if (ids.isEmpty()) {
                return Page.empty(pageable);
            }
            
            Map<Long, Integer> stockMap = new java.util.HashMap<>();
            java.time.LocalDate searchDay = java.time.LocalDate.now();
            List<Object[]> stockResults = batchRepository.sumAvailableQuantitiesByProductIds(ids, searchDay);
            for (Object[] stockRow : stockResults) {
                if (stockRow[0] != null && stockRow[1] != null) {
                    stockMap.put((Long) stockRow[0], ((Number) stockRow[1]).intValue());
                }
            }

            return productRepository.searchProducts(ids, null, categoryId, farmId, isActive, minPrice, maxPrice, isNew, isSale, pageable)
                    .map(p -> {
                        ProductResponse res = toResponse(p);
                        res.setTotalStock(stockMap.getOrDefault(p.getId(), 0));
                        return res;
                    });
        }
        return productRepository.searchProducts(null, name, categoryId, farmId, isActive, minPrice, maxPrice, isNew, isSale, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getTopSellingProducts(@NonNull Pageable pageable) {
        return productRepository.findTopSellingProducts(Objects.requireNonNull(pageable)).map(this::toResponse);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "product_detail"}, allEntries = true)
    public void toggleProductStatus(Long id) {
        Product product = findById(id);
        product.setIsActive(!product.getIsActive());
        productRepository.save(product);

        try {
            if (product.getIsActive()) {
                searchService.indexProduct(toResponse(product));
            } else {
                searchService.deleteProduct(id);
            }
        } catch (Exception e) {
            log.error("Failed to sync status toggle for product {} to Meilisearch: {}", id, e.getMessage());
        }
        
        auditService.log(SecurityUtils.getCurrentUsername(), "TOGGLE_STATUS", "Product", id.toString(), 
                "Toggled product status for ID: " + id + " to " + product.getIsActive());
    }

    private Product findById(Long id) {
        return productRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    /**
     * Chuyển đổi từ Entity sang DTO.
     * Tính toán tổng tồn kho thực tế và điểm đánh giá trung bình.
     */
    public ProductResponse toResponse(Product product) {
        if (product == null) return null;

        int totalStock = 0;
        try {
            if (product.getBatches() != null) {
                totalStock = product.getBatches().stream()
                        .filter(b -> b != null && b.getRemainingQuantity() != null && b.getRemainingQuantity() > 0 && 
                                    b.getExpiryDate() != null && !b.getExpiryDate().isBefore(java.time.LocalDate.now()) &&
                                    (b.getStatus() == nhom5.demo.enums.BatchStatusEnum.ACTIVE || 
                                     b.getStatus() == nhom5.demo.enums.BatchStatusEnum.DISCOUNT))
                        .mapToInt(nhom5.demo.entity.ProductBatch::getRemainingQuantity)
                        .sum();
            }
        } catch (Exception e) {
            log.warn("Lỗi tính toán tồn kho cho SP {}: {}", product.getId(), e.getMessage());
        }

        double avgRating = 0.0;
        try {
            if (product.getReviews() != null && !product.getReviews().isEmpty()) {
                avgRating = product.getReviews().stream()
                        .filter(r -> r != null && r.getRating() != null)
                        .mapToInt(nhom5.demo.entity.Review::getRating)
                        .average()
                        .orElse(0.0);
            }
        } catch (Exception e) {
            log.warn("Lỗi tính toán đánh giá cho SP {}: {}", product.getId(), e.getMessage());
        }

        ProductResponse.ProductResponseBuilder responseBuilder = ProductResponse.builder();
        
        responseBuilder
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .price(product.getPrice())
                .unit(product.getUnit())
                .imageUrl(product.getImageUrl())
                .isActive(product.getIsActive() != null ? product.getIsActive() : true)
                .isNew(product.getIsNew() != null ? product.getIsNew() : true)
                .originalPrice(product.getOriginalPrice())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : "N/A")
                .farmName(product.getFarm() != null ? product.getFarm().getName() : "N/A")
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .farmId(product.getFarm() != null ? product.getFarm().getId() : null)
                .totalStock(totalStock)
                .averageRating(avgRating)
                .reviewCount(product.getReviews() != null ? product.getReviews().size() : 0);

        // Populate active Flash Sale info if exists
        try {
            flashSaleItemRepository.findActiveByProductId(product.getId(), java.time.LocalDateTime.now())
                .ifPresent(item -> {
                    responseBuilder.flashSalePrice(item.getFlashSalePrice());
                    if (item.getFlashSale() != null) {
                        responseBuilder.flashSaleEndDate(item.getFlashSale().getEndTime());
                    }
                });
        } catch (Exception e) {
            log.warn("Lỗi truy vấn Flash Sale cho SP {}: {}", product.getId(), e.getMessage());
        }

        return responseBuilder.build();
    }
}
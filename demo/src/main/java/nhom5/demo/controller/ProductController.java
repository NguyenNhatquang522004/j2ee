package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nhom5.demo.constant.AppConstants;
import nhom5.demo.dto.request.ProductRequest;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.dto.response.ProductResponse;
import nhom5.demo.dto.response.PageResponse;
import nhom5.demo.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

/**
 * REST CONTROLLER: ProductController
 * ---------------------------------------------------------
 * Manages the full lifecycle of FreshFood products.
 * Handles search, public catalog viewing (by ID or Slug), and administrative CRUD operations.
 */
@Tag(name = "Products", description = "Quản lý sản phẩm thực phẩm sạch")
@RestController
@RequestMapping(AppConstants.PRODUCT_PATH)
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @Operation(summary = "Tìm kiếm & lọc sản phẩm (public/Admin)")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> searchProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long farmId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) Boolean isNew,
            @RequestParam(required = false) Boolean isSale,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Boolean finalIsActive = isActive;
        if (isActive == null) {
            boolean isStaffOrAdmin = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication() != null &&
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || 
                                          a.getAuthority().equals("view:products") || 
                                          a.getAuthority().equals("manage:products"));
            if (!isStaffOrAdmin) {
                finalIsActive = true;
            }
        }

        Sort sort;
        if (sortBy.equals("id") || sortBy.equals("createdAt")) {
            sort = Sort.by(Sort.Order.desc("isNew"), Sort.Order.desc(sortBy));
        } else {
            sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ProductResponse> data = productService.searchProducts(name, categoryId, farmId, finalIsActive, minPrice, maxPrice, isNew, isSale, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(data)));
    }

    @Operation(summary = "Top sản phẩm bán chạy (public)")
    @GetMapping("/top-selling")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getTopSelling(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> data = productService.getTopSellingProducts(pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(data)));
    }

    /**
     * getProduct: Unified entry point for finding products by ID OR Slug.
     * Disambiguates based on numeric vs. alpha-numeric format.
     */
    @Operation(summary = "Chi tiết sản phẩm (theo ID hoặc Slug)")
    @GetMapping("/{identifier}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProduct(@PathVariable String identifier) {
        if (identifier.matches("\\d+")) {
            return ResponseEntity.ok(ApiResponse.success(productService.getProductById(Long.parseLong(identifier))));
        } else {
            return ResponseEntity.ok(ApiResponse.success(productService.getProductBySlug(identifier)));
        }
    }

    @Operation(summary = "Tạo sản phẩm mới (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'manage:products')")
    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> create(
            @Valid @RequestBody ProductRequest request) {
        ProductResponse data = productService.createProduct(Objects.requireNonNull(request));
        return ResponseEntity.status(201).body(ApiResponse.created(data));
    }

    @Operation(summary = "Cập nhật sản phẩm (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'manage:products')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(productService.updateProduct(Objects.requireNonNull(id), Objects.requireNonNull(request))));
    }

    @Operation(summary = "Xoá sản phẩm (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'manage:products')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.deleteProduct(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.success("Xoá sản phẩm thành công", null));
    }

    @Operation(summary = "Bật/tắt trạng thái sản phẩm (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'manage:products')")
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable Long id) {
        productService.toggleProductStatus(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật trạng thái sản phẩm", null));
    }
}

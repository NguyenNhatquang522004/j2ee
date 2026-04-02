package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nhom5.demo.constant.AppConstants;
import nhom5.demo.dto.request.CategoryRequest;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.dto.response.CategoryResponse;
import nhom5.demo.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Objects;

/**
 * REST CONTROLLER: CategoryController
 * ---------------------------------------------------------
 * Manages the product collection hierarchy.
 * Categories act as the primary grouping mechanism for fresh food items.
 * 
 * Visibility:
 * - Public: Only active categories are shown in the shop navigation.
 * - Admin: Full access to hidden and archived categories.
 */
@Tag(name = "Categories", description = "Quản lý danh mục sản phẩm")
@RestController
@RequestMapping(AppConstants.CATEGORY_PATH)
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * getAllActive: Returns categories ready for public display.
     */
    @Operation(summary = "Danh mục đang hoạt động (public)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getActiveCategories()));
    }

    /**
     * getAllForAdmin: Comprehensive list including hidden/maintenance categories.
     */
    @Operation(summary = "Tất cả danh mục (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllForAdmin() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllCategories()));
    }

    /**
     * toggleStatus: Enables or disables an entire product group.
     */
    @Operation(summary = "Bật/tắt trạng thái danh mục (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable @NonNull Long id) {
        categoryService.toggleCategoryStatus(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật trạng thái danh mục", null));
    }

    /**
     * getById: Retrieves details of a specific grouping.
     */
    @Operation(summary = "Chi tiết danh mục (public)")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryById(Objects.requireNonNull(id))));
    }

    /**
     * create: Registers a new category in the system.
     */
    @Operation(summary = "Tạo danh mục mới (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> create(
            @Valid @RequestBody @NonNull CategoryRequest request) {
        CategoryResponse data = categoryService.createCategory(Objects.requireNonNull(request));
        return ResponseEntity.status(201).body(ApiResponse.created(data));
    }

    /**
     * update: Updates metadata (Name, Slug, Description) for a category.
     */
    @Operation(summary = "Cập nhật danh mục (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(
            @PathVariable @NonNull Long id,
            @Valid @RequestBody @NonNull CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.updateCategory(Objects.requireNonNull(id), Objects.requireNonNull(request))));
    }

    /**
     * delete: Permanently archives or removes a category.
     */
    @Operation(summary = "Xoá danh mục (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable @NonNull Long id) {
        categoryService.deleteCategory(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.success("Xoá danh mục thành công", null));
    }
}

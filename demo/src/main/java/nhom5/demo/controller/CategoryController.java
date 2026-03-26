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

import java.util.List;

@Tag(name = "Categories", description = "Quản lý danh mục sản phẩm")
@RestController
@RequestMapping(AppConstants.CATEGORY_PATH)
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "Danh mục đang hoạt động (public)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getActiveCategories()));
    }

    @Operation(summary = "Tất cả danh mục (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllForAdmin() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllCategories()));
    }

    @Operation(summary = "Bật/tắt trạng thái danh mục (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable Long id) {
        categoryService.toggleCategoryStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật trạng thái danh mục", null));
    }

    @Operation(summary = "Chi tiết danh mục (public)")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryById(id)));
    }

    @Operation(summary = "Tạo danh mục mới (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> create(
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse data = categoryService.createCategory(request);
        return ResponseEntity.status(201).body(ApiResponse.created(data));
    }

    @Operation(summary = "Cập nhật danh mục (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.updateCategory(id, request)));
    }

    @Operation(summary = "Xoá danh mục (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Xoá danh mục thành công", null));
    }
}

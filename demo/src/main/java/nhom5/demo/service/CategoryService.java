package nhom5.demo.service;

import nhom5.demo.dto.request.CategoryRequest;
import nhom5.demo.dto.response.CategoryResponse;
import org.springframework.lang.NonNull;

import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(@NonNull CategoryRequest request);

    CategoryResponse updateCategory(@NonNull Long id, @NonNull CategoryRequest request);

    void deleteCategory(@NonNull Long id);

    CategoryResponse getCategoryById(@NonNull Long id);

    List<CategoryResponse> getActiveCategories();
    List<CategoryResponse> getAllCategories();
    void toggleCategoryStatus(@NonNull Long id);
}

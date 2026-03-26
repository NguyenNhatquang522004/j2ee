package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.request.CategoryRequest;
import nhom5.demo.dto.response.CategoryResponse;
import nhom5.demo.entity.Category;
import nhom5.demo.exception.BusinessException;
import nhom5.demo.exception.ResourceNotFoundException;
import nhom5.demo.repository.CategoryRepository;
import nhom5.demo.repository.ProductRepository;
import nhom5.demo.service.CategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new BusinessException("Danh mục '" + request.getName() + "' đã tồn tại");
        }
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findById(id);
        if (!category.getName().equals(request.getName()) &&
                categoryRepository.existsByName(request.getName())) {
            throw new BusinessException("Danh mục '" + request.getName() + "' đã tồn tại");
        }
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        if (request.getIsActive() != null)
            category.setIsActive(request.getIsActive());
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = findById(id);
        // "Sản phẩm ở trong danh mục đó phải còn" - Set category to null for orphaned products
        for (nhom5.demo.entity.Product product : category.getProducts()) {
            product.setCategory(null);
        }
        categoryRepository.delete(category);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByIsActiveTrue().stream()
                .map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public void toggleCategoryStatus(Long id) {
        Category category = findById(id);
        category.setIsActive(!category.getIsActive());
        categoryRepository.save(category);
    }

    private Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    private CategoryResponse toResponse(Category category) {
        long productCount = productRepository.countByCategoryId(category.getId());
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .isActive(category.getIsActive())
                .productCount((int) productCount)
                .build();
    }
}

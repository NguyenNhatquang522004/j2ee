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
import org.springframework.lang.NonNull;
import java.util.Objects;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"products", "product_detail"}, allEntries = true)
    public CategoryResponse createCategory(@NonNull CategoryRequest request) {
        String name = Objects.requireNonNull(request.getName());
        if (categoryRepository.existsByName(name)) {
            throw new BusinessException("Danh mục '" + name + "' đã tồn tại");
        }
        Category category = Category.builder()
                .name(name)
                .description(request.getDescription())
                .slug(request.getSlug())
                .imageUrl(request.getImageUrl())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        return toResponse(categoryRepository.save(Objects.requireNonNull(category)));
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"products", "product_detail"}, allEntries = true)
    public CategoryResponse updateCategory(@NonNull Long id, @NonNull CategoryRequest request) {
        Category category = findById(id);
        String name = Objects.requireNonNull(request.getName());
        if (!Objects.requireNonNull(category.getName()).equals(name) &&
                categoryRepository.existsByName(name)) {
            throw new BusinessException("Danh mục '" + name + "' đã tồn tại");
        }
        category.setName(name);
        category.setDescription(request.getDescription());
        category.setSlug(request.getSlug());
        category.setImageUrl(request.getImageUrl());
        if (request.getIsActive() != null)
            category.setIsActive(request.getIsActive());
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"products", "product_detail"}, allEntries = true)
    public void deleteCategory(@NonNull Long id) {
        Category category = findById(id);
        category.setIsActive(false);
        categoryRepository.save(category);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(@NonNull Long id) {
        return toResponse(Objects.requireNonNull(findById(id)));
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
    @org.springframework.cache.annotation.CacheEvict(value = {"products", "product_detail"}, allEntries = true)
    public void toggleCategoryStatus(@NonNull Long id) {
        Category category = findById(id);
        category.setIsActive(!Boolean.TRUE.equals(category.getIsActive()));
        categoryRepository.save(category);
    }

    private Category findById(@NonNull Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    private CategoryResponse toResponse(@NonNull Category category) {
        Long catId = Objects.requireNonNull(category.getId());
        long productCount = productRepository.countByCategoryId(catId);
        return CategoryResponse.builder()
                .id(catId)
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .isActive(category.getIsActive())
                .productCount((int) productCount)
                .slug(category.getSlug())
                .createdAt(category.getCreatedAt())
                .build();
    }
}

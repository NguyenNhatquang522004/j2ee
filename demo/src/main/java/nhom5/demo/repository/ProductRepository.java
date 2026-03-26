package nhom5.demo.repository;

import nhom5.demo.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByName(String name);
    
    Page<Product> findByIsActiveTrue(Pageable pageable);

    Page<Product> findByNameContainingIgnoreCaseAndIsActiveTrue(String name, Pageable pageable);

    Page<Product> findByCategoryIdAndIsActiveTrue(Long categoryId, Pageable pageable);

    Page<Product> findByFarmIdAndIsActiveTrue(Long farmId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE (:isActive IS NULL OR p.isActive = :isActive) " +
            "AND (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
            "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
            "AND (:farmId IS NULL OR p.farm.id = :farmId)")
    Page<Product> searchProducts(
            @Param("name") String name,
            @Param("categoryId") Long categoryId,
            @Param("farmId") Long farmId,
            @Param("isActive") Boolean isActive,
            Pageable pageable);

    List<Product> findByIsActiveTrue();

    long countByCategoryId(Long categoryId);

    long countByFarmId(Long farmId);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.id IN " +
            "(SELECT oi.product.id FROM OrderItem oi GROUP BY oi.product.id ORDER BY SUM(oi.quantity) DESC)")
    Page<Product> findTopSellingProducts(Pageable pageable);
}

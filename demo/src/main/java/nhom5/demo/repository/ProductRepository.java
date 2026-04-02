package nhom5.demo.repository;

import nhom5.demo.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Cung cấp các phương thức truy vấn sản phẩm nâng cao.
 * Sử dụng JPQL để thực hiện tìm kiếm đa điều kiện và thống kê bán chạy.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByName(String name);
    java.util.Optional<Product> findBySlug(String slug);
    
    Page<Product> findByIsActiveTrue(Pageable pageable);

    /**
     * Tìm kiếm sản phẩm linh hoạt (Null-safe Filtering).
     * Chỉ áp dụng điều kiện lọc cho các tham số khác NULL.
     */
    @Query("SELECT p FROM Product p WHERE (:ids IS NULL OR p.id IN :ids) AND " +
            "(:isActive IS NULL OR p.isActive = :isActive) " +
            "AND (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
            "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
            "AND (:farmId IS NULL OR p.farm.id = :farmId) " +
            "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
            "AND (:isNew IS NULL OR p.isNew = :isNew) " +
            "AND (:isSale IS NULL OR (:isSale = true AND p.originalPrice > p.price))")
    Page<Product> searchProducts(
            @Param("ids") List<Long> ids,
            @Param("name") String name,
            @Param("categoryId") Long categoryId,
            @Param("farmId") Long farmId,
            @Param("isActive") Boolean isActive,
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice,
            @Param("isNew") Boolean isNew,
            @Param("isSale") Boolean isSale,
            Pageable pageable);

    List<Product> findByIsActiveTrue();

    long countByCategoryId(Long categoryId);

    long countByFarmId(Long farmId);

    /**
     * Xếp hạng sản phẩm bán chạy nhất dựa trên tổng số lượng trong các đơn hàng đã thanh toán.
     */
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.id IN " +
            "(SELECT oi.product.id FROM OrderItem oi " +
            "WHERE oi.order.isPaid = true AND oi.order.status != nhom5.demo.enums.OrderStatusEnum.CANCELLED " +
            "GROUP BY oi.product.id ORDER BY SUM(oi.quantity) DESC)")
    Page<Product> findTopSellingProducts(Pageable pageable);

}

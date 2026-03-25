package nhom5.demo.repository;

import nhom5.demo.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi.product.id, SUM(oi.quantity) as totalSold FROM OrderItem oi " +
            "GROUP BY oi.product.id ORDER BY totalSold DESC")
    List<Object[]> findTopSellingProductIds(org.springframework.data.domain.Pageable pageable);

    @Query(value = "SELECT oi.product_id, p.name, p.image_url, " +
            "SUM(oi.quantity) AS sold_quantity, SUM(oi.subtotal) AS total_revenue " +
            "FROM order_items oi " +
            "JOIN products p ON oi.product_id = p.id " +
            "GROUP BY oi.product_id, p.name, p.image_url " +
            "ORDER BY sold_quantity DESC LIMIT 5", nativeQuery = true)
    List<Object[]> findTopSellingProductsWithStats();

    boolean existsByOrderUserIdAndProductId(Long userId, Long productId);
}

package nhom5.demo.repository;

import nhom5.demo.entity.Order;
import nhom5.demo.enums.OrderStatusEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository quản lý dữ liệu Đơn hàng.
 * Cung cấp các công cụ tìm kiếm đơn hàng linh hoạt và thống kê doanh thu đa chiều.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findFirstByUserIdOrderByCreatedAtDesc(Long userId);

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatusEnum status, Pageable pageable);

    Optional<Order> findByOrderCode(String orderCode);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Thống kê tổng doanh thu thực tế trong một khoảng thời gian.
     * Chỉ tính các đơn ĐÃ THANH TOÁN và KHÔNG bị HỦY/HOÀN TRẢ.
     */
    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o " +
            "WHERE (o.isPaid = true AND o.status NOT IN (nhom5.demo.enums.OrderStatusEnum.CANCELLED, nhom5.demo.enums.OrderStatusEnum.RETURNED)) " +
            "AND (COALESCE(o.paidAt, o.createdAt) BETWEEN :startDate AND :endDate)")
    BigDecimal sumRevenueByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o " +
            "WHERE (o.isPaid = true AND o.status NOT IN (nhom5.demo.enums.OrderStatusEnum.CANCELLED, nhom5.demo.enums.OrderStatusEnum.RETURNED))")
    BigDecimal sumTotalRevenue();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    long countOrdersByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    List<Order> findByUserIdAndStatus(Long userId, OrderStatusEnum status);

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countGroupByStatus();

    @Query("SELECT o FROM Order o WHERE " +
           "(:query IS NULL OR o.orderCode LIKE %:query% OR o.user.username LIKE %:query% OR o.phone LIKE %:query%) AND " +
           "(:status IS NULL OR o.status = :status)")
    Page<Order> searchOrders(@Param("query") String query, @Param("status") OrderStatusEnum status, Pageable pageable);

    /**
     * Tìm kiếm các đơn hàng đang có yêu cầu xử lý tài chính (Hoàn tiền/Trả hàng).
     * Bao gồm: Đơn đang yêu cầu trả hàng, Đơn đã hoàn trả, và Đơn đã thanh toán nhưng bị hủy chưa hoàn tiền.
     */
    @Query("SELECT o FROM Order o WHERE " +
           "(:query IS NULL OR " +
           "LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(o.user.username) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(o.phone) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(o.status = nhom5.demo.enums.OrderStatusEnum.RETURN_REQUESTED OR " +
           "o.status = nhom5.demo.enums.OrderStatusEnum.RETURNED OR " +
           "o.status = nhom5.demo.enums.OrderStatusEnum.RETURN_REJECTED OR " +
           "(o.status = nhom5.demo.enums.OrderStatusEnum.CANCELLED AND o.isPaid = true AND o.isRefunded = false))")
    Page<Order> searchRefundRequests(@Param("query") String query, Pageable pageable);

    List<Order> findByStatusAndCreatedAtBefore(OrderStatusEnum status, LocalDateTime dateTime);
}

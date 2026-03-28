package nhom5.demo.repository;

import nhom5.demo.entity.ProductBatch;
import nhom5.demo.enums.BatchStatusEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductBatchRepository extends JpaRepository<ProductBatch, Long> {

    List<ProductBatch> findByProductId(Long productId);

    Page<ProductBatch> findByProductId(Long productId, Pageable pageable);

    boolean existsByBatchCode(String batchCode);

    /**
     * FEFO: lấy các lô hàng còn hạn sắp hết hạn trước.
     * Sử dụng PESSIMISTIC_WRITE để đảm bảo không có race condition khi trừ kho.
     */
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM ProductBatch b WHERE b.product.id = :productId " +
            "AND b.expiryDate > :today " +
            "AND b.remainingQuantity > 0 " +
            "AND b.status IN (nhom5.demo.enums.BatchStatusEnum.ACTIVE, nhom5.demo.enums.BatchStatusEnum.DISCOUNT) " +
            "ORDER BY b.expiryDate ASC")
    List<ProductBatch> findAvailableBatchesFEFO(
            @Param("productId") Long productId,
            @Param("today") LocalDate today);

    /**
     * Tổng tồn kho còn hạn của sản phẩm.
     */
    @Query("SELECT COALESCE(SUM(b.remainingQuantity), 0) FROM ProductBatch b " +
            "WHERE b.product.id = :productId " +
            "AND b.expiryDate > CURRENT_DATE " +
            "AND b.status IN (nhom5.demo.enums.BatchStatusEnum.ACTIVE, nhom5.demo.enums.BatchStatusEnum.DISCOUNT)")
    Long sumRemainingQuantityByProductId(@Param("productId") Long productId);

    /**
     * Các lô sắp hết hạn trong khoảng today → warningDate.
     */
    @Query("SELECT b FROM ProductBatch b WHERE b.expiryDate > :today " +
            "AND b.expiryDate <= :warningDate " +
            "AND b.remainingQuantity > 0 " +
            "AND b.status = nhom5.demo.enums.BatchStatusEnum.ACTIVE")
    List<ProductBatch> findBatchesNearExpiry(
            @Param("today") LocalDate today,
            @Param("warningDate") LocalDate warningDate);

    /**
     * Các lô đã hết hạn.
     */
    @Query("SELECT b FROM ProductBatch b WHERE b.expiryDate <= :today " +
            "AND b.status NOT IN (nhom5.demo.enums.BatchStatusEnum.EXPIRED, nhom5.demo.enums.BatchStatusEnum.DISCONTINUED)")
    List<ProductBatch> findExpiredBatches(@Param("today") LocalDate today);

    Optional<ProductBatch> findByBatchCode(String batchCode);

    List<ProductBatch> findByStatus(BatchStatusEnum status);

    @Query("SELECT b FROM ProductBatch b WHERE b.product.id = :productId ORDER BY b.expiryDate ASC")
    List<ProductBatch> findByProductIdOrderByExpiryDateAsc(@Param("productId") Long productId);
}

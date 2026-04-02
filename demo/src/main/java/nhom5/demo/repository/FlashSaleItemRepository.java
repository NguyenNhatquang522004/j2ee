package nhom5.demo.repository;

import nhom5.demo.entity.FlashSaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

@Repository
public interface FlashSaleItemRepository extends JpaRepository<FlashSaleItem, Long> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM FlashSaleItem i WHERE i.id = :id")
    Optional<FlashSaleItem> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT i FROM FlashSaleItem i WHERE i.product.id = :productId AND i.product.isActive = true AND i.flashSale.isActive = true AND i.flashSale.startTime <= :now AND i.flashSale.endTime >= :now")
    Optional<FlashSaleItem> findActiveByProductId(@Param("productId") Long productId, @Param("now") LocalDateTime now);

    @Query("SELECT i FROM FlashSaleItem i WHERE i.product.id IN :productIds AND i.product.isActive = true AND i.flashSale.isActive = true AND i.flashSale.startTime <= :now AND i.flashSale.endTime >= :now")
    List<FlashSaleItem> findActiveByProductIds(@Param("productIds") List<Long> productIds, @Param("now") LocalDateTime now);
}

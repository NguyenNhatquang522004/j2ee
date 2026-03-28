package nhom5.demo.repository;

import nhom5.demo.entity.FlashSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlashSaleRepository extends JpaRepository<FlashSale, Long> {
    
    @Query("SELECT f FROM FlashSale f WHERE f.isActive = true AND f.startTime <= :now AND f.endTime >= :now")
    Optional<FlashSale> findActiveFlashSale(@Param("now") LocalDateTime now);

    @Query("SELECT f FROM FlashSale f WHERE f.startTime > :now AND f.isActive = true ORDER BY f.startTime ASC")
    List<FlashSale> findUpcomingFlashSales(@Param("now") LocalDateTime now);
}

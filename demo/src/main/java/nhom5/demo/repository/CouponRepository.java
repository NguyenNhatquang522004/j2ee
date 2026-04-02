package nhom5.demo.repository;

import nhom5.demo.entity.Coupon;
import nhom5.demo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCode(String code);
    
    Optional<Coupon> findByCodeAndIsActiveTrue(String code);
    
    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Coupon c WHERE c.code = :code AND c.isActive = true")
    Optional<Coupon> findByCodeAndIsActiveTrueWithLock(@Param("code") String code);

    Page<Coupon> findByIsPrivateFalse(Pageable pageable);
    List<Coupon> findByIsPrivateFalse();

    List<Coupon> findByAssignedUsersContaining(User user);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Coupon c SET c.isActive = false WHERE c.expiryDate < :now AND c.isActive = true")
    int deactivateExpiredCoupons(@org.springframework.data.repository.query.Param("now") java.time.LocalDate now);
}

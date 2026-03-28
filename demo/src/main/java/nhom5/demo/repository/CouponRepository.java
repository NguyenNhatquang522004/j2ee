package nhom5.demo.repository;

import nhom5.demo.entity.Coupon;
import nhom5.demo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCode(String code);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Coupon> findByCodeAndIsActiveTrue(String code);

    Page<Coupon> findByIsPrivateFalse(Pageable pageable);
    List<Coupon> findByIsPrivateFalse();

    List<Coupon> findByAssignedUsersContaining(User user);
}

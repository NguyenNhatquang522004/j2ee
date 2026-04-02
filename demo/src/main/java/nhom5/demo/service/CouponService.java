package nhom5.demo.service;

import nhom5.demo.entity.Coupon;
import org.springframework.lang.NonNull;
import java.util.List;

public interface CouponService {
    List<Coupon> getAllCoupons();
    Coupon getCouponById(@NonNull Long id);
    Coupon getCouponByCode(@NonNull String code);
    Coupon createCoupon(@NonNull Coupon coupon);
    Coupon updateCoupon(@NonNull Long id, @NonNull Coupon coupon);
    void deleteCoupon(@NonNull Long id);
    Coupon validateCoupon(@NonNull String code, @NonNull java.math.BigDecimal orderAmount);
    void giftCoupon(@NonNull String email, @NonNull Coupon coupon);
    List<Coupon> getMyCoupons();
    void deactivateExpiredCoupons();
}

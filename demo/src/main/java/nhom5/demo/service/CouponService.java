package nhom5.demo.service;

import nhom5.demo.entity.Coupon;
import java.util.List;

public interface CouponService {
    List<Coupon> getAllCoupons();
    Coupon getCouponById(Long id);
    Coupon getCouponByCode(String code);
    Coupon createCoupon(Coupon coupon);
    Coupon updateCoupon(Long id, Coupon coupon);
    void deleteCoupon(Long id);
    Coupon validateCoupon(String code, Double orderAmount);
    void giftCoupon(String email, Coupon coupon);
    List<Coupon> getMyCoupons();
}

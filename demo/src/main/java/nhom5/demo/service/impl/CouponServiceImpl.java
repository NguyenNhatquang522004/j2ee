package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.entity.Coupon;
import nhom5.demo.exception.BusinessException;
import nhom5.demo.exception.ResourceNotFoundException;
import nhom5.demo.repository.CouponRepository;
import nhom5.demo.service.CouponService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Coupon getCouponById(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
    }

    @Override
    @Transactional(readOnly = true)
    public Coupon getCouponByCode(String code) {
        return couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "code", code));
    }

    @Override
    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        if (couponRepository.findByCode(coupon.getCode()).isPresent()) {
            throw new BusinessException("Mã giảm giá '" + coupon.getCode() + "' đã tồn tại");
        }
        return couponRepository.save(coupon);
    }

    @Override
    @Transactional
    public Coupon updateCoupon(Long id, Coupon couponDetails) {
        Coupon coupon = getCouponById(id);
        
        // Don't update code if it's already used in orders? 
        // For simplicity, just update all fields
        coupon.setDescription(couponDetails.getDescription());
        coupon.setDiscountPercent(couponDetails.getDiscountPercent());
        coupon.setMaxDiscountAmount(couponDetails.getMaxDiscountAmount());
        coupon.setMinOrderAmount(couponDetails.getMinOrderAmount());
        coupon.setExpiryDate(couponDetails.getExpiryDate());
        coupon.setUsageLimit(couponDetails.getUsageLimit());
        coupon.setIsActive(couponDetails.getIsActive());
        
        return couponRepository.save(coupon);
    }

    @Override
    @Transactional
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Coupon", "id", id);
        }
        couponRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Coupon validateCoupon(String code, Double orderAmount) {
        Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(code)
                .orElseThrow(() -> new BusinessException("Mã giảm giá không hợp lệ hoặc đã hết hạn"));

        if (coupon.getExpiryDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Mã giảm giá đã hết hạn");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BusinessException("Mã giảm giá đã hết lượt sử dụng");
        }

        if (coupon.getMinOrderAmount() != null && BigDecimal.valueOf(orderAmount).compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BusinessException("Đơn hàng tối thiểu " + coupon.getMinOrderAmount() + "đ để dùng mã này");
        }

        return coupon;
    }
}

package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.entity.Coupon;
import nhom5.demo.entity.User;
import nhom5.demo.exception.BusinessException;
import nhom5.demo.exception.ResourceNotFoundException;
import nhom5.demo.repository.CouponRepository;
import nhom5.demo.repository.UserRepository;
import nhom5.demo.security.SecurityUtils;
import nhom5.demo.service.AuditService;
import nhom5.demo.service.CouponService;
import nhom5.demo.service.MailService;
import nhom5.demo.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final UserRepository userRepository;
    private final MailService mailService;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Override
    @Transactional(readOnly = true)
    public List<Coupon> getAllCoupons() {
        String username = SecurityUtils.getCurrentUsername();
        if (username != null) {
            User user = userRepository.findByUsername(username).orElse(null);
            // Nếu là Admin, trả về toàn bộ mã để quản lý
            if (user != null && user.getRole() != null && "ROLE_ADMIN".equals(user.getRole().name())) {
                return couponRepository.findAll();
            }
        }
        // Khách hàng hoặc người dùng thường chỉ thấy mã công khai
        return couponRepository.findByIsPrivateFalse();
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
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Ngày hết hạn không được ở trong quá khứ");
        }
        Coupon saved = couponRepository.save(coupon);
        auditService.log(SecurityUtils.getCurrentUsername(), "CREATE", "COUPON", saved.getId().toString(), "Created: " + saved.getCode());
        return saved;
    }

    @Override
    @Transactional
    public Coupon updateCoupon(Long id, Coupon couponDetails) {
        Coupon coupon = getCouponById(id);
        
        if (couponDetails.getExpiryDate() != null && couponDetails.getExpiryDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Ngày hết hạn không được ở trong quá khứ");
        }

        coupon.setDescription(couponDetails.getDescription());
        coupon.setDiscountPercent(couponDetails.getDiscountPercent());
        coupon.setMaxDiscountAmount(couponDetails.getMaxDiscountAmount());
        coupon.setMinOrderAmount(couponDetails.getMinOrderAmount());
        coupon.setExpiryDate(couponDetails.getExpiryDate());
        coupon.setUsageLimit(couponDetails.getUsageLimit());
        coupon.setIsActive(couponDetails.getIsActive());
        coupon.setIsPrivate(couponDetails.getIsPrivate() != null ? couponDetails.getIsPrivate() : false);
        
        Coupon updated = couponRepository.save(coupon);
        auditService.log(SecurityUtils.getCurrentUsername(), "UPDATE", "COUPON", updated.getId().toString(), "Modified: " + updated.getCode());
        return updated;
    }

    @Override
    @Transactional
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Coupon", "id", id);
        }
        auditService.log(SecurityUtils.getCurrentUsername(), "DELETE", "COUPON", id.toString(), "Deleted coupon");
        couponRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Coupon validateCoupon(String code, Double orderAmount) {
        Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(code)
                .orElseThrow(() -> new BusinessException("Mã giảm giá không hợp lệ hoặc đã hết hạn"));

        // Kiểm tra quyền sử dụng nếu là voucher riêng tư
        if (Boolean.TRUE.equals(coupon.getIsPrivate())) {
            String currentUsername = SecurityUtils.getCurrentUsername();
            if (currentUsername == null || "anonymousUser".equals(currentUsername)) {
                throw new BusinessException("Vui lòng đăng nhập để sử dụng mã này");
            }
            
            User currentUser = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new BusinessException("User không tồn tại"));

            if (!coupon.getAssignedUsers().contains(currentUser)) {
                throw new BusinessException("Mã giảm giá này dành riêng cho tài khoản khác");
            }
        }

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

    @Override
    @Transactional
    public void giftCoupon(String email, Coupon couponDetails) {
        if (couponDetails == null || couponDetails.getCode() == null) {
            throw new BusinessException("Thông tin voucher không hợp lệ");
        }
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Không tìm thấy người dùng với email: " + email));

        // Kiểm tra xem đã có voucher này chưa
        java.util.Optional<Coupon> existingOpt = couponRepository.findByCode(couponDetails.getCode());
        
        Coupon targetCoupon;
        if (existingOpt.isPresent()) {
            targetCoupon = existingOpt.get();
            // Nếu là voucher riêng tư, chỉ cần gán user vào danh sách được phép dùng
            if (Boolean.TRUE.equals(targetCoupon.getIsPrivate())) {
                targetCoupon.getAssignedUsers().add(user);
                couponRepository.save(targetCoupon);
            }
            // Nếu là voucher công khai, không tạo bản sao nữa để tránh trùng lặp nội dung,
            // chỉ tiếp tục để gửi Email & Thông báo cho người dùng là xong.
        } else {
            // Nếu voucher chưa tồn tại, tạo mới hoàn toàn là voucher riêng tư đã gán user
            targetCoupon = createPersonalCopy(user, couponDetails);
            targetCoupon.setIsPrivate(true);
            couponRepository.save(targetCoupon);
        }

        auditService.log(SecurityUtils.getCurrentUsername(), "GIFT", "COUPON", targetCoupon.getId().toString(), "Gifted: " + targetCoupon.getCode() + " to " + email);

        // Notify user
        mailService.sendCouponNotification(user.getEmail(), targetCoupon.getCode(), targetCoupon.getDescription());
        notificationService.createNotification(
                user,
                "Bạn vừa nhận được một mã giảm giá cá nhân: " + targetCoupon.getCode(),
                "COUPON",
                "/coupons"
        );
    }

    private Coupon createPersonalCopy(User user, Coupon template) {
        String personalCode = template.getCode();
        // Nếu code đã tồn tại và không phải cái ta đang muốn gán, thêm hậu tố ngẫu nhiên
        if (couponRepository.findByCode(personalCode).isPresent()) {
            personalCode += "-" + java.util.UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        }

        Coupon copy = Coupon.builder()
                .code(personalCode)
                .description(template.getDescription())
                .discountPercent(template.getDiscountPercent() != null ? template.getDiscountPercent() : 0)
                .maxDiscountAmount(template.getMaxDiscountAmount())
                .minOrderAmount(template.getMinOrderAmount() != null ? template.getMinOrderAmount() : BigDecimal.ZERO)
                .expiryDate(template.getExpiryDate())
                .usageLimit(template.getUsageLimit() != null ? template.getUsageLimit() : 1)
                .usedCount(0)
                .isActive(true)
                .isPrivate(true)
                .build();
        
        copy.getAssignedUsers().add(user);
        return couponRepository.save(copy);
    }

    @Override
    public List<Coupon> getMyCoupons() {
        String username = SecurityUtils.getCurrentUsername();
        if (username == null || "anonymousUser".equals(username)) {
            throw new BusinessException("Vui lòng đăng nhập để xem voucher của bạn");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User không tồn tại"));
        return couponRepository.findByAssignedUsersContaining(user);
    }
}

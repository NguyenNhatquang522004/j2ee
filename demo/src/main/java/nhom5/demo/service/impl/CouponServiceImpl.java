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
import org.springframework.lang.NonNull;
import java.util.Objects;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@lombok.extern.slf4j.Slf4j
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
                return couponRepository.findAllWithUsers();
            }
        }
        // Khách hàng hoặc người dùng thường chỉ thấy mã công khai
        return couponRepository.findByIsPrivateFalse();
    }

    @Override
    @Transactional(readOnly = true)
    public Coupon getCouponById(@NonNull Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
    }

    @Override
    @Transactional(readOnly = true)
    public Coupon getCouponByCode(@NonNull String code) {
        return couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "code", code));
    }

    @Override
    @Transactional
    public Coupon createCoupon(@NonNull Coupon couponRequest) {
        String code = Objects.requireNonNull(couponRequest.getCode()).trim().toUpperCase();
        
        // 1. Uniqueness check
        if (couponRepository.findByCode(code).isPresent()) {
            throw new BusinessException("Mã giảm giá '" + code + "' đã tồn tại");
        }

        // 2. Build a fresh Clean entity to avoid frontend data noise
        Coupon coupon = Coupon.builder()
                .code(code)
                .description(couponRequest.getDescription())
                .discountPercent(couponRequest.getDiscountPercent() != null ? couponRequest.getDiscountPercent() : 0)
                .maxDiscountAmount(couponRequest.getMaxDiscountAmount())
                .minOrderAmount(couponRequest.getMinOrderAmount() != null ? couponRequest.getMinOrderAmount() : BigDecimal.ZERO)
                .usageLimit(couponRequest.getUsageLimit())
                .usedCount(0)
                .isActive(Boolean.TRUE.equals(couponRequest.getIsActive()))
                .isPrivate(Boolean.TRUE.equals(couponRequest.getIsPrivate()))
                .build();

        // 3. Date validation
        if (couponRequest.getExpiryDate() != null) {
            if (couponRequest.getExpiryDate().getYear() > 2099) {
                throw new BusinessException("Năm hết hạn không hợp lệ (tối đa 2099)");
            }
            if (couponRequest.getExpiryDate().isBefore(LocalDate.now())) {
                throw new BusinessException("Ngày hết hạn không được ở trong quá khứ");
            }
            coupon.setExpiryDate(couponRequest.getExpiryDate());
        } else {
            // Default expiry to 30 days if blank
            coupon.setExpiryDate(LocalDate.now().plusDays(30));
        }

        // 4. Save and audit
        Coupon saved = couponRepository.save(coupon);
        Long savedId = Objects.requireNonNull(saved.getId());
        auditService.log(SecurityUtils.getCurrentUsername(), "CREATE", "COUPON", savedId.toString(), "Created: " + saved.getCode());
        return saved;
    }

    @Override
    @Transactional
    public Coupon updateCoupon(@NonNull Long id, @NonNull Coupon couponDetails) {
        Coupon coupon = getCouponById(id);
        
        // 1. Update Code with uniqueness check
        if (couponDetails.getCode() != null && !couponDetails.getCode().isBlank()) {
            String newCode = couponDetails.getCode().trim().toUpperCase();
            if (!coupon.getCode().equals(newCode) && 
                couponRepository.findByCode(newCode).isPresent()) {
                throw new BusinessException("Mã giảm giá '" + newCode + "' đã tồn tại");
            }
            coupon.setCode(newCode);
        }
        
        // 2. Update basic info
        if (couponDetails.getDescription() != null) {
            coupon.setDescription(couponDetails.getDescription());
        }
        
        if (couponDetails.getDiscountPercent() != null) {
            int pct = couponDetails.getDiscountPercent();
            if (pct < 0 || pct > 100) throw new BusinessException("Phần trăm giảm giá từ 0-100");
            coupon.setDiscountPercent(pct);
        }
        
        coupon.setMaxDiscountAmount(couponDetails.getMaxDiscountAmount());
        
        if (couponDetails.getMinOrderAmount() != null) {
            coupon.setMinOrderAmount(couponDetails.getMinOrderAmount());
        }
        
        // 3. Update date with validation
        if (couponDetails.getExpiryDate() != null) {
            if (couponDetails.getExpiryDate().isBefore(LocalDate.now())) {
                throw new BusinessException("Ngày hết hạn không được ở trong quá khứ");
            }
            coupon.setExpiryDate(couponDetails.getExpiryDate());
        }
        
        coupon.setUsageLimit(couponDetails.getUsageLimit());
        
        // 4. Update status flags (only if explicitly provided)
        if (couponDetails.getIsActive() != null) {
            coupon.setIsActive(couponDetails.getIsActive());
        }
        
        if (couponDetails.getIsPrivate() != null) {
            coupon.setIsPrivate(couponDetails.getIsPrivate());
        }
        
        // IMPORTANT: We do NOT update assignedUsers here to avoid Hibernate conflicts and accidental data loss.
        // Users should be managed via giftCoupon API.
        
        Coupon updated = couponRepository.save(coupon);
        String currentUsername = SecurityUtils.getCurrentUsername();
        String finalUser = (currentUsername != null && !currentUsername.isBlank()) ? currentUsername : "anonymous";
        auditService.log(finalUser, "UPDATE", "COUPON", updated.getId().toString(), "Modified: " + updated.getCode());
        return updated;
    }

    @Override
    @Transactional
    public void deleteCoupon(@NonNull Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Coupon", "id", id);
        }
        auditService.log(SecurityUtils.getCurrentUsername(), "DELETE", "COUPON", id.toString(), "Deleted coupon");
        couponRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Coupon validateCoupon(@NonNull String code, @NonNull java.math.BigDecimal orderAmount) {
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

        LocalDate expiryDate = coupon.getExpiryDate();
        if (expiryDate != null && expiryDate.isBefore(LocalDate.now())) {
            throw new BusinessException("Mã giảm giá đã hết hạn");
        }

        if (coupon.getUsageLimit() != null && (coupon.getUsedCount() != null && coupon.getUsedCount() >= coupon.getUsageLimit())) {
            throw new BusinessException("Mã giảm giá đã hết lượt sử dụng");
        }

        if (coupon.getMinOrderAmount() != null && orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BusinessException("Đơn hàng tối thiểu " + coupon.getMinOrderAmount() + "đ để dùng mã này");
        }

        return coupon;
    }

    @Override
    @Transactional
    public void giftCoupon(@NonNull String email, @NonNull Coupon couponDetails) {
        String code = Objects.requireNonNull(couponDetails.getCode());
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Không tìm thấy người dùng với email: " + email));

        // Kiểm tra xem đã có voucher này chưa
        java.util.Optional<Coupon> existingOpt = couponRepository.findByCode(code);
        
        Coupon targetCoupon;
        if (existingOpt.isPresent()) {
            targetCoupon = existingOpt.get();
            // Nếu là voucher riêng tư, chỉ cần gán user vào danh sách được phép dùng
            if (Boolean.TRUE.equals(targetCoupon.getIsPrivate())) {
                targetCoupon.getAssignedUsers().add(user);
                couponRepository.save(targetCoupon);
            }
        } else {
            // Nếu voucher chưa tồn tại, tạo mới hoàn toàn là voucher riêng tư đã gán user
            targetCoupon = createPersonalCopy(user, couponDetails);
            targetCoupon.setIsPrivate(true);
            couponRepository.save(targetCoupon);
        }

        Long targetId = Objects.requireNonNull(targetCoupon.getId());
        auditService.log(SecurityUtils.getCurrentUsername(), "GIFT", "COUPON", targetId.toString(), "Gifted: " + targetCoupon.getCode() + " to " + email);

        // Notify user
        mailService.sendCouponNotification(Objects.requireNonNull(user.getEmail()), targetCoupon.getCode(), targetCoupon.getDescription());
        notificationService.createNotification(
                user,
                "Bạn vừa nhận được một mã giảm giá cá nhân: " + targetCoupon.getCode(),
                "COUPON",
                "/coupons"
        );
    }

    private Coupon createPersonalCopy(User user, Coupon template) {
        String personalCode = Objects.requireNonNull(template.getCode());
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

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deactivateExpiredCoupons() {
        int count = couponRepository.deactivateExpiredCoupons(java.time.LocalDate.now());
        if (count > 0) {
            log.info("Đã tự động vô hiệu hóa {} mã giảm giá hết hạn", count);
        }
    }
}

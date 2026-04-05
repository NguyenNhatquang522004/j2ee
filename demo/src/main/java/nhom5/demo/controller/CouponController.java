package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nhom5.demo.constant.AppConstants;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.entity.Coupon;
import nhom5.demo.service.CouponService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.lang.NonNull;
import java.util.Objects;
import java.util.Map;

import java.util.List;

/**
 * REST CONTROLLER: CouponController
 * ---------------------------------------------------------
 * Manages promotional vouchers and customer discounts.
 * Supports public validation, user-specific inventory, and administrative issuance.
 */
@Tag(name = "Coupons", description = "Quản lý mã giảm giá / vouchers")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping(AppConstants.COUPON_PATH)
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    /**
     * getAllCoupons: Returns all vouchers available in the system catalog.
     */
    @Operation(summary = "Tất cả mã giảm giá")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Coupon>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.success(couponService.getAllCoupons()));
    }

    /**
     * getCoupon: Detailed metadata for a specific voucher (Admin specific).
     */
    @Operation(summary = "Chi tiết mã giảm giá (Admin)")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'view:coupons', 'manage:coupons')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Coupon>> getCoupon(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(ApiResponse.success(couponService.getCouponById(Objects.requireNonNull(id))));
    }

    /**
     * createCoupon: Administrative creation of new marketing codes.
     */
    @Operation(summary = "Tạo mã giảm giá mới (Admin)")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'manage:coupons')")
    @PostMapping
    public ResponseEntity<ApiResponse<Coupon>> createCoupon(@Valid @RequestBody @NonNull Coupon coupon) {
        return ResponseEntity.status(201).body(ApiResponse.created(couponService.createCoupon(Objects.requireNonNull(coupon))));
    }

    /**
     * updateCoupon: Modifies specific parameters like usage limits or discount value.
     */
    @Operation(summary = "Cập nhật mã giảm giá (Admin)")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'manage:coupons')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Coupon>> updateCoupon(@PathVariable @NonNull Long id, @Valid @RequestBody @NonNull Coupon coupon) {
        return ResponseEntity.ok(ApiResponse.success(couponService.updateCoupon(Objects.requireNonNull(id), Objects.requireNonNull(coupon))));
    }

    /**
     * deleteCoupon: Permanent removal of a promotional code.
     */
    @Operation(summary = "Xóa mã giảm giá (Admin)")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'manage:coupons')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable @NonNull Long id) {
        couponService.deleteCoupon(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.success("Xóa thành công", null));
    }

    /**
     * giftCoupon: Special API to manually assign a coupon to a specific user's email.
     * Uses internal ObjectMapper to deserialize complex gift structures.
     */
    @Operation(summary = "Tặng mã giảm giá cho người dùng (Admin)")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'manage:coupons')")
    @PostMapping("/send-personal-gift")
    public ResponseEntity<ApiResponse<Void>> giftCoupon(@RequestBody @NonNull Map<String, Object> body) {
        String email = Objects.requireNonNull((String) body.get("email"));
        Coupon couponDetails = Objects.requireNonNull(new ObjectMapper()
                .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
                .convertValue(body.get("coupon"), Coupon.class));
        couponService.giftCoupon(email, couponDetails);
        return ResponseEntity.ok(ApiResponse.success("Đã tặng mã giảm giá thành công", null));
    }

    /**
     * getMyCoupons: Lists vouchers specifically assigned to the authenticated user.
     */
    @Operation(summary = "Lấy voucher cá nhân của tôi")
    @GetMapping("/my-vouchers")
    public ResponseEntity<ApiResponse<List<Coupon>>> getMyCoupons() {
        return ResponseEntity.ok(ApiResponse.success(couponService.getMyCoupons()));
    }

    /**
     * validateCoupon: Real-time verification of a code against a specific purchase total.
     */
    @Operation(summary = "Kiểm tra mã giảm giá (Public/Authenticated)")
    @GetMapping("/validate/{code}")
    public ResponseEntity<ApiResponse<Coupon>> validateCoupon(
            @PathVariable @NonNull String code,
            @RequestParam @NonNull java.math.BigDecimal amount) {
        return ResponseEntity.ok(ApiResponse.success(couponService.validateCoupon(Objects.requireNonNull(code), Objects.requireNonNull(amount))));
    }
}

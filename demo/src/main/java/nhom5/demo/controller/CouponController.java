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

import java.util.List;

@Tag(name = "Coupons", description = "Quản lý mã giảm giá / vouchers")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping(AppConstants.COUPON_PATH)
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @Operation(summary = "Tất cả mã giảm giá")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Coupon>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.success(couponService.getAllCoupons()));
    }

    @Operation(summary = "Chi tiết mã giảm giá (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Coupon>> getCoupon(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(couponService.getCouponById(id)));
    }

    @Operation(summary = "Tạo mã giảm giá mới (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<Coupon>> createCoupon(@Valid @RequestBody Coupon coupon) {
        return ResponseEntity.status(201).body(ApiResponse.created(couponService.createCoupon(coupon)));
    }

    @Operation(summary = "Cập nhật mã giảm giá (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Coupon>> updateCoupon(@PathVariable Long id, @Valid @RequestBody Coupon coupon) {
        return ResponseEntity.ok(ApiResponse.success(couponService.updateCoupon(id, coupon)));
    }

    @Operation(summary = "Xóa mã giảm giá (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa thành công", null));
    }

    @Operation(summary = "Tặng mã giảm giá cho người dùng (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/send-personal-gift")
    public ResponseEntity<ApiResponse<Void>> giftCoupon(@RequestBody java.util.Map<String, Object> body) {
        String email = (String) body.get("email");
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        Coupon couponDetails = mapper.convertValue(body.get("coupon"), Coupon.class);
        couponService.giftCoupon(email, couponDetails);
        return ResponseEntity.ok(ApiResponse.success("Đã tặng mã giảm giá thành công", null));
    }

    @Operation(summary = "Lấy voucher cá nhân của tôi")
    @GetMapping("/my-vouchers")
    public ResponseEntity<ApiResponse<List<Coupon>>> getMyCoupons() {
        return ResponseEntity.ok(ApiResponse.success(couponService.getMyCoupons()));
    }

    @Operation(summary = "Kiểm tra mã giảm giá (Public/Authenticated)")
    @GetMapping("/validate/{code}")
    public ResponseEntity<ApiResponse<Coupon>> validateCoupon(
            @PathVariable String code,
            @RequestParam Double amount) {
        return ResponseEntity.ok(ApiResponse.success(couponService.validateCoupon(code, amount)));
    }
}

package nhom5.demo.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.service.CouponService;
import nhom5.demo.service.FlashSaleService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler tự động kiểm tra và vô hiệu hóa các chương trình khuyến mãi hết hạn:
 * - Coupon/Voucher quá ngày expiryDate
 * - Flash Sale quá ngày endTime
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PromotionScheduler {

    private final CouponService couponService;
    private final FlashSaleService flashSaleService;

    /**
     * Chạy lúc 00:01 mỗi ngày.
     */
    @Scheduled(cron = "0 1 0 * * *")
    public void processPromotionExpiry() {
        log.info("=== Promotion Expiry Scheduler: Bắt đầu kiểm tra ===");

        try {
            couponService.deactivateExpiredCoupons();
        } catch (Exception e) {
            log.error("Lỗi khi vô hiệu hóa Coupon hết hạn: {}", e.getMessage());
        }

        try {
            flashSaleService.deactivateExpiredFlashSales();
        } catch (Exception e) {
            log.error("Lỗi khi vô hiệu hóa Flash Sale hết hạn: {}", e.getMessage());
        }

        log.info("=== Promotion Expiry Scheduler: Hoàn thành ===");
    }
}

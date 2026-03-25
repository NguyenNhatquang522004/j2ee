package nhom5.demo.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.service.BatchService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler tự động xử lý trạng thái lô hàng mỗi ngày:
 * - Đánh dấu EXPIRED cho lô đã quá hạn
 * - Đánh dấu DISCOUNT cho lô sắp hết hạn (trong ngưỡng cảnh báo)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BatchExpiryScheduler {

    private final BatchService batchService;

    @Value("${app.batch.expiry-warning-days:3}")
    private int expiryWarningDays;

    /**
     * Chạy lúc 00:05 mỗi ngày.
     */
    @Scheduled(cron = "0 5 0 * * *")
    public void processBatchExpiry() {
        log.info("=== Batch Expiry Scheduler: Bắt đầu kiểm tra lô hàng ===");

        try {
            batchService.updateExpiredBatches();
            log.info("Đã cập nhật trạng thái EXPIRED cho các lô quá hạn");
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật lô hàng EXPIRED: {}", e.getMessage(), e);
        }

        try {
            batchService.discountNearExpiryBatches(expiryWarningDays);
            log.info("Đã cập nhật trạng thái DISCOUNT cho lô sắp hết hạn trong {} ngày", expiryWarningDays);
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật lô hàng DISCOUNT: {}", e.getMessage(), e);
        }

        log.info("=== Batch Expiry Scheduler: Hoàn thành ===");
    }
}

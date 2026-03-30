package nhom5.demo.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.entity.Order;
import nhom5.demo.enums.OrderStatusEnum;
import nhom5.demo.repository.OrderRepository;
import nhom5.demo.service.OrderService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryScheduler {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    /**
     * Tự động hủy các đơn hàng PENDING quá hạn thanh toán (15 phút).
     * Chạy mỗi 5 phút một lần.
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void cleanupExpiredOrders() {
        log.info("Running scheduled cleanup for expired pending orders...");
        
        LocalDateTime expiryTime = LocalDateTime.now().minusMinutes(15);
        List<Order> expiredOrders = orderRepository.findByStatusAndCreatedAtBefore(OrderStatusEnum.PENDING, expiryTime);

        if (expiredOrders.isEmpty()) {
            log.info("No expired pending orders found.");
            return;
        }

        log.info("Found {} expired pending orders to cancel.", expiredOrders.size());

        for (Order order : expiredOrders) {
            try {
                // Hủy đơn hàng sẽ tự động giải phóng kho (trong logic của OrderService.updateOrderStatus)
                orderService.updateOrderStatus(order.getId(), OrderStatusEnum.CANCELLED);
                log.info("Auto-cancelled expired order #{}", order.getOrderCode());
            } catch (Exception e) {
                log.error("Failed to auto-cancel order #{}: {}", order.getOrderCode(), e.getMessage());
            }
        }
    }
}

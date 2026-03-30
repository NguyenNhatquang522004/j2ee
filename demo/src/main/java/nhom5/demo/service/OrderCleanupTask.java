package nhom5.demo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.entity.Order;
import nhom5.demo.enums.OrderStatusEnum;
import nhom5.demo.repository.OrderRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderCleanupTask {

    private final OrderRepository orderRepository;
    private final org.springframework.context.ApplicationContext applicationContext;

    /**
     * Tự động hoàn lại tồn kho cho các đơn hàng PENDING quá 15 phút
     * Chạy mỗi 5 phút một lần
     */
    @Scheduled(fixedRate = 300000) // 5 mins
    @Transactional
    public void cleanupExpiredOrders() {
        LocalDateTime expiryTime = LocalDateTime.now().minusMinutes(15);
        List<Order> expiredOrders = orderRepository.findByStatusAndCreatedAtBefore(OrderStatusEnum.PENDING, expiryTime);

        if (expiredOrders.isEmpty()) return;

        log.info("Found {} expired pending orders to clean up", expiredOrders.size());
        
        // We fetch OrderService lazily from context to prevent circular dependency
        OrderService orderService = applicationContext.getBean(OrderService.class);

        for (Order order : expiredOrders) {
            log.info("Cleaning up order: {}. Reverting stock.", order.getOrderCode());
            
            order.setNote("Tự động huỷ đơn do hết hạn thanh toán (15 phút)");
            orderRepository.save(order);
            
            // Delegate complex rollback to OrderService
            try {
                orderService.updateOrderStatus(order.getId(), OrderStatusEnum.CANCELLED);
            } catch (Exception e) {
                log.error("Failed to cancel order {} during cleanup", order.getOrderCode(), e);
            }
        }
    }
}

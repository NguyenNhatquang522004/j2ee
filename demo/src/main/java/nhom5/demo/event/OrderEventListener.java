package nhom5.demo.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.entity.Order;
import nhom5.demo.entity.User;
import nhom5.demo.enums.OrderStatusEnum;
import nhom5.demo.service.MailService;
import nhom5.demo.service.NotificationService;
import nhom5.demo.service.LoyaltyService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventListener {

    private final MailService mailService;
    private final NotificationService notificationService;
    private final LoyaltyService loyaltyService;
    private final ApplicationEventPublisher eventPublisher;

    @Async
    @EventListener
    public void handleOrderEvent(OrderEvent event) {
        Order order = event.getOrder();
        User user = order.getUser();
        String type = event.getType();
        OrderStatusEnum status = event.getStatus();

        log.info("Processing OrderEvent for Order #{}: Type={}", order.getOrderCode(), type);

        try {
            switch (type) {
                case "CREATED" -> {
                    mailService.sendOrderConfirmation(order);
                    notificationService.createNotification(user,
                            "Đơn hàng #" + order.getOrderCode() + " của bạn đã được tạo thành công!",
                            "SUCCESS",
                            "/orders/" + order.getId());
                    
                    publishAuditLog("SYSTEM", "ORDER_CREATE", "Order", order.getId().toString(), 
                            "Order created: " + order.getOrderCode());
                }
                case "STATUS_UPDATED" -> {
                    notificationService.createNotification(user,
                            "Đơn hàng #" + order.getOrderCode() + " đã chuyển sang trạng thái: " + status.getDisplayName(),
                            status == OrderStatusEnum.CANCELLED ? "WARNING" : "INFO",
                            "/orders/" + order.getId());

                    publishAuditLog("SYSTEM", "STATUS_UPDATE", "Order", order.getId().toString(), 
                            "Updated order " + order.getOrderCode() + " status to " + status);
                    
                    if (status == OrderStatusEnum.DELIVERED) {
                        loyaltyService.awardPoints(user, order.getFinalAmount().longValue(), order.getOrderCode());
                    }
                }
                case "CANCELLED" -> {
                    notificationService.createNotification(user,
                            "Bạn đã hủy thành công đơn hàng #" + order.getOrderCode(),
                            "WARNING",
                            "/orders/" + order.getId());

                    publishAuditLog("SYSTEM", "CANCEL", "Order", order.getId().toString(), 
                            "Cancelled order " + order.getOrderCode());
                }
            }
        } catch (Exception e) {
            log.error("Error processing OrderEvent for Order #{}", order.getOrderCode(), e);
        }
    }

    private void publishAuditLog(String username, String action, String resourceType, String resourceId, String details) {
        eventPublisher.publishEvent(AuditLogEvent.builder()
                .username(username != null ? username : "SYSTEM")
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .details(details)
                .build());
    }
}

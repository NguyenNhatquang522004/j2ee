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
import org.springframework.lang.NonNull;
import java.util.Objects;

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
    public void handleOrderEvent(@NonNull OrderEvent event) {
        Order order = Objects.requireNonNull(event.getOrder());
        User user = Objects.requireNonNull(order.getUser());
        String type = Objects.requireNonNull(event.getType());
        OrderStatusEnum status = event.getStatus();

        log.info("Processing OrderEvent for Order #{}: Type={} by {}", order.getOrderCode(), type, event.getUsername());

        try {
            String actor = event.getUsername() != null ? event.getUsername() : "SYSTEM";
            switch (type) {
                case "CREATED" -> {
                    mailService.sendOrderConfirmation(order);
                    notificationService.createNotification(user,
                            "Đơn hàng #" + order.getOrderCode() + " của bạn đã được tạo thành công!",
                            "SUCCESS",
                            "/orders/" + order.getOrderCode());
                    
                    publishAuditLog(actor, "ORDER_CREATE", "Order", order.getOrderCode(), 
                            "Order created: " + order.getOrderCode());
                }
                case "STATUS_UPDATED" -> {
                    if (status != null) {
                        notificationService.createNotification(user,
                                "Đơn hàng #" + order.getOrderCode() + " đã chuyển sang trạng thái: " + status.getDisplayName(),
                                status == OrderStatusEnum.CANCELLED ? "WARNING" : "INFO",
                                "/orders/" + order.getOrderCode());

                        // Send Email for important status changes
                        if (status != OrderStatusEnum.PENDING) {
                            mailService.sendOrderStatusUpdate(order);
                        }

                        publishAuditLog(actor, "STATUS_UPDATE", "Order", order.getOrderCode(), 
                                "Updated order " + order.getOrderCode() + " status to " + status);
                        
                        if (status == OrderStatusEnum.DELIVERED) {
                            loyaltyService.awardPoints(user, Objects.requireNonNull(order.getFinalAmount()).longValue(), Objects.requireNonNull(order.getOrderCode()));
                        }
                    }
                }
                case "CANCELLED" -> {
                    notificationService.createNotification(user,
                            "Bạn đã hủy thành công đơn hàng #" + order.getOrderCode(),
                            "WARNING",
                            "/orders/" + order.getOrderCode());

                    publishAuditLog(actor, "CANCEL", "Order", order.getOrderCode(), 
                            "Cancelled order " + order.getOrderCode());
                }
            }
        } catch (Exception e) {
            log.error("Error processing OrderEvent for Order #{}", order.getOrderCode(), e);
        }
    }

    private void publishAuditLog(String username, @NonNull String action, String resourceType, String resourceId, String details) {
        AuditLogEvent auditEvent = AuditLogEvent.builder()
                .username(username != null ? username : "SYSTEM")
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .details(details)
                .build();
        eventPublisher.publishEvent(Objects.requireNonNull(auditEvent));
    }
}

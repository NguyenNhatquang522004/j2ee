package nhom5.demo.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.entity.User;
import nhom5.demo.service.MailService;
import nhom5.demo.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventListener {

    private final MailService mailService;
    private final NotificationService notificationService;

    @Async
    @EventListener
    public void handleUserEvent(UserEvent event) {
        User user = event.getUser();
        String type = event.getType();

        log.info("Processing UserEvent for User {}: Type={}", user.getUsername(), type);

        try {
            switch (type) {
                case "TIER_UPGRADED" -> {
                    String oldTier = event.getOldTier();
                    String newTier = event.getNewTier();
                    
                    // 1. Gửi thông báo WebSocket thời gian thực
                    notificationService.createNotification(user,
                            "Chúc mừng! Bạn đã thăng hạng từ khách hàng " + oldTier.toUpperCase() + 
                            " lên khách hàng " + newTier.toUpperCase() + "!",
                            "SUCCESS",
                            "/profile");

                    // 2. Gửi Email chúc mừng
                    mailService.sendTierUpgradeNotification(user.getEmail(), user.getFullName(), newTier);
                    
                    log.info("Tier upgrade notification sent for user {}", user.getUsername());
                }
                case "POINTS_EARNED" -> {
                    Long points = event.getPoints();
                    notificationService.createNotification(user,
                            "Bạn vừa tích lũy thêm " + points + " điểm thưởng!",
                            "INFO",
                            "/profile");
                }
            }
        } catch (Exception e) {
            log.error("Error processing UserEvent for user {}", user.getUsername(), e);
        }
    }
}

package nhom5.demo.service;

import nhom5.demo.entity.Notification;
import nhom5.demo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {
    void createNotification(User user, String message, String type, String link);
    Page<Notification> getMyNotifications(Pageable pageable);
    List<Notification> getUnreadNotifications();
    long getUnreadCount();
    void markAsRead(Long id);
    void markAllAsRead();
    void delete(Long id);
    void deleteAll();
    void broadcastFlashSaleUpdate(Long productId, int soldQuantity, int quantityLimit);
    void broadcastFlashSaleRefresh();
}

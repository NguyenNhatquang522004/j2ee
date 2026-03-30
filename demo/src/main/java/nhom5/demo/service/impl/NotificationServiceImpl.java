package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.entity.Notification;
import nhom5.demo.entity.User;
import nhom5.demo.repository.NotificationRepository;
import nhom5.demo.repository.UserRepository;
import nhom5.demo.security.SecurityUtils;
import nhom5.demo.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ChannelTopic notificationTopic;

    @Override
    @Transactional
    public void createNotification(User user, String message, String type, String link) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .link(link)
                .isRead(false)
                .build();
        Notification saved = notificationRepository.save(notification);

        // Publish to Redis for real-time broadcast
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", saved.getId());
        payload.put("userId", user.getId());
        payload.put("username", user.getUsername());
        payload.put("message", message);
        payload.put("type", type);
        payload.put("link", link);
        payload.put("createdAt", saved.getCreatedAt().toString());

        redisTemplate.convertAndSend(notificationTopic.getTopic(), payload);
    }

    @Override
    public Page<Notification> getMyNotifications(Pageable pageable) {
        User user = getCurrentUser();
        return notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }

    @Override
    public List<Notification> getUnreadNotifications() {
        User user = getCurrentUser();
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    @Override
    public long getUnreadCount() {
        User user = getCurrentUser();
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        // Ensure user owns this notification
        if (!notification.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        User user = getCurrentUser();
        notificationRepository.markAllAsReadByUserId(user.getId());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        // Ensure user owns this notification
        if (!notification.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        notificationRepository.delete(notification);
    }

    @Override
    @Transactional
    public void deleteAll() {
        User user = getCurrentUser();
        notificationRepository.deleteAllByUserId(user.getId());
    }

    private User getCurrentUser() {
        String username = SecurityUtils.getCurrentUsername();
        if (username == null || "anonymousUser".equals(username)) {
            throw new RuntimeException("Access denied: User not authenticated");
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }
}

package nhom5.demo.service;

import nhom5.demo.entity.Order;

public interface MailService {
    void sendOrderConfirmation(Order order);

    void sendCouponNotification(String toEmail, String couponCode, String description);
    void sendResetPasswordEmail(String toEmail, String token);
    void sendNewsletterWelcome(String toEmail);
    void sendLoginAlert(String toEmail, String ipAddress, String deviceInfo);
    void sendGenericEmail(String toEmail, String subject, String content);
    void send2faEmail(String toEmail, String code);
    void sendTierUpgradeNotification(String toEmail, String fullName, String newTier);
    void sendWelcomeEmail(String toEmail, String fullName);
    void sendOrderStatusUpdate(Order order);
    void sendSecurityAlert(String toEmail, String fullName, String action);
}

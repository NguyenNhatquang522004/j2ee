package nhom5.demo.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.entity.Order;
import nhom5.demo.service.MailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.springframework.lang.NonNull;
import java.util.Objects;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final nhom5.demo.repository.SystemSettingRepository systemSettingRepository;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.mail.from-name:FreshFood}")
    private String fromName;

    @Value("${app.mail.from-address:noreply@freshFood.com}")
    private String fromAddress;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrlConfig;

    private Context createEmailContext() {
        Context context = new Context();
        // Priority: DB Setting > Application Property > Default
        String frontendUrl = systemSettingRepository.findBySettingKey("FRONTEND_URL")
                .map(s -> s.getSettingValue())
                .orElse(frontendUrlConfig);
        context.setVariable("frontendUrl", frontendUrl);
        return context;
    }

    @Override
    @Async
    public void sendOrderConfirmation(Order order) {
        try {
            Context context = createEmailContext();
            context.setVariable("orderCode", order.getOrderCode());
            context.setVariable("customerName", Objects.requireNonNull(order.getUser()).getFullName());
            context.setVariable("shippingAddress", order.getShippingAddress());
            context.setVariable("items", order.getOrderItems());
            context.setVariable("totalAmount", order.getTotalAmount());
            context.setVariable("discountAmount", order.getDiscountAmount());
            context.setVariable("finalAmount", order.getFinalAmount());
            context.setVariable("paymentMethod", Objects.requireNonNull(order.getPaymentMethod()).name());
            context.setVariable("status", Objects.requireNonNull(order.getStatus()).name());
            context.setVariable("template", "email-order-confirmation");

            String html = templateEngine.process("email-layout", context);
            sendHtmlEmail(Objects.requireNonNull(order.getUser().getEmail()),
                    Objects.requireNonNull("Xác nhận đơn hàng #" + order.getOrderCode()), Objects.requireNonNull(html));
        } catch (Exception e) {
            log.error("Failed to send order confirmation email for order {}: {}",
                    order.getOrderCode(), e.getMessage());
        }
    }

    @Override
    @Async
    public void sendCouponNotification(String toEmail, String couponCode, String description) {
        try {
            Context context = createEmailContext();
            context.setVariable("couponCode", couponCode);
            context.setVariable("description", description);
            context.setVariable("template", "email-coupon-notification");

            String html = templateEngine.process("email-layout", context);
            sendHtmlEmail(Objects.requireNonNull(toEmail), Objects.requireNonNull("Mã giảm giá đặc biệt dành cho bạn!"), Objects.requireNonNull(html));
        } catch (Exception e) {
            log.error("Failed to send coupon notification email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendResetPasswordEmail(String toEmail, String token) {
        try {
            Context context = createEmailContext();
            String frontendUrl = (String) context.getVariable("frontendUrl");
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            context.setVariable("resetLink", resetLink);
            context.setVariable("template", "email-reset-password");

            String html = templateEngine.process("email-layout", context);
            sendHtmlEmail(Objects.requireNonNull(toEmail), Objects.requireNonNull("Khôi phục mật khẩu"), Objects.requireNonNull(html));
        } catch (Exception e) {
            log.error("Failed to send reset password email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendNewsletterWelcome(String toEmail) {
        try {
            Context context = createEmailContext();
            context.setVariable("template", "email-newsletter-welcome");
            String html = templateEngine.process("email-layout", context);
            sendHtmlEmail(Objects.requireNonNull(toEmail), Objects.requireNonNull("Chào mừng bạn đến với Bản tin FreshFood!"), Objects.requireNonNull(html));
        } catch (Exception e) {
            log.error("Failed to send newsletter welcome email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendLoginAlert(String toEmail, String ipAddress, String deviceInfo) {
        try {
            Context context = createEmailContext();
            context.setVariable("ipAddress", ipAddress);
            context.setVariable("deviceInfo", deviceInfo);
            context.setVariable("time", LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss dd-MM-yyyy")));
            context.setVariable("template", "email-login-alert");

            String html = templateEngine.process("email-layout", context);
            sendHtmlEmail(Objects.requireNonNull(toEmail), Objects.requireNonNull("Cảnh báo bảo mật: Tài khoản của bạn vừa đăng nhập"), Objects.requireNonNull(html));
        } catch (Exception e) {
            log.error("Failed to send login alert email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendGenericEmail(String toEmail, String subject, String content) {
        try {
            log.info("Preparing to send newsletter to: {}", toEmail);
            Context context = createEmailContext();
            context.setVariable("subject", subject);
            context.setVariable("content", content); // Already HTML string from Admin
            context.setVariable("template", "email-newsletter"); // Specify fragment

            String html = templateEngine.process("email-layout", context);
            sendHtmlEmail(Objects.requireNonNull(toEmail), Objects.requireNonNull(subject), Objects.requireNonNull(html));
            log.info("Newsletter sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send generic email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Override
    @Async
    public void send2faEmail(String toEmail, String code) {
        try {
            log.info("Sending 2FA code to: {}", toEmail);
            Context context = createEmailContext();
            context.setVariable("code", code);
            context.setVariable("template", "email-2fa-code");

            String html = templateEngine.process("email-layout", context);
            sendHtmlEmail(Objects.requireNonNull(toEmail), Objects.requireNonNull("Xác nhận đổi phần quà"), Objects.requireNonNull(html));
        } catch (Exception e) {
            log.error("Failed to send 2FA email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendTierUpgradeNotification(String toEmail, String fullName, String newTier) {
        try {
            Context context = createEmailContext();
            context.setVariable("fullName", fullName);
            context.setVariable("newTier", newTier.toUpperCase());
            context.setVariable("template", "email-tier-upgrade");

            String html = templateEngine.process("email-layout", context);
            sendHtmlEmail(Objects.requireNonNull(toEmail), Objects.requireNonNull("Chúc mừng! Bạn đã thăng hạng lên thành viên " + newTier.toUpperCase()), Objects.requireNonNull(html));
        } catch (Exception e) {
            log.error("Failed to send tier upgrade email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendWelcomeEmail(String toEmail, String fullName) {
        try {
            Context context = createEmailContext();
            context.setVariable("fullName", fullName);
            context.setVariable("template", "email-welcome");
            String html = templateEngine.process("email-layout", context);
            sendHtmlEmail(Objects.requireNonNull(toEmail), Objects.requireNonNull("Chào mừng bạn gia nhập cộng đồng FreshFood!"), Objects.requireNonNull(html));
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendOrderStatusUpdate(Order order) {
        try {
            Context context = createEmailContext();
            context.setVariable("orderCode", order.getOrderCode());
            context.setVariable("customerName", Objects.requireNonNull(order.getUser()).getFullName());
            context.setVariable("status", Objects.requireNonNull(order.getStatus()).getDisplayName());
            context.setVariable("template", "email-order-status-update");

            String html = templateEngine.process("email-layout", context);
            sendHtmlEmail(Objects.requireNonNull(order.getUser().getEmail()),
                    Objects.requireNonNull("Cập nhật trạng thái đơn hàng #" + order.getOrderCode() + ": " + order.getStatus().getDisplayName()), Objects.requireNonNull(html));
        } catch (Exception e) {
            log.error("Failed to send order status update email for order {}: {}", order.getOrderCode(), e.getMessage());
        }
    }

    @Override
    @Async
    public void sendSecurityAlert(String toEmail, String fullName, String action) {
        try {
            Context context = createEmailContext();
            context.setVariable("fullName", fullName);
            context.setVariable("action", action);
            context.setVariable("time", LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss dd-MM-yyyy")));
            context.setVariable("template", "email-security-alert");

            String html = templateEngine.process("email-layout", context);
            sendHtmlEmail(Objects.requireNonNull(toEmail), Objects.requireNonNull("Cảnh báo bảo mật: " + action), Objects.requireNonNull(html));
        } catch (Exception e) {
            log.error("Failed to send security alert email to {}: {}", toEmail, e.getMessage());
        }
    }

    private void sendHtmlEmail(@NonNull String to, @NonNull String subject, @NonNull String html) throws MessagingException, java.io.UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        // Gmail fallback: if using Gmail SMTP, the 'from' should ideally match authorized address
        String effectiveFrom = fromAddress != null ? fromAddress : "noreply@freshfood.com";
        if (fromEmail != null && fromEmail.contains("@gmail.com") && !fromEmail.equals(fromAddress)) {
            effectiveFrom = fromEmail;
            log.warn("Detected Gmail server, overriding 'From' address to authenticated user: {}", effectiveFrom);
        }
        
        helper.setFrom(effectiveFrom, fromName != null ? fromName : "FreshFood");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(message);
    }
}

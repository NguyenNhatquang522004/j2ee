package nhom5.demo.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.entity.Order;
import nhom5.demo.entity.OrderItem;
import nhom5.demo.service.MailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    @Async
    public void sendOrderConfirmation(Order order) {
        try {
            Context context = new Context();
            context.setVariable("orderCode", order.getOrderCode());
            context.setVariable("customerName", order.getUser().getFullName());
            context.setVariable("shippingAddress", order.getShippingAddress());
            context.setVariable("items", order.getOrderItems());
            context.setVariable("totalAmount", order.getTotalAmount());
            context.setVariable("discountAmount", order.getDiscountAmount());
            context.setVariable("finalAmount", order.getFinalAmount());
            context.setVariable("paymentMethod", order.getPaymentMethod().name());
            context.setVariable("status", order.getStatus().name());

            String html = templateEngine.process("email-order-confirmation", context);
            sendHtmlEmail(order.getUser().getEmail(),
                    "Xác nhận đơn hàng #" + order.getOrderCode(), html);
        } catch (Exception e) {
            log.error("Failed to send order confirmation email for order {}: {}",
                    order.getOrderCode(), e.getMessage());
        }
    }

    @Override
    @Async
    public void sendCouponNotification(String toEmail, String couponCode, String description) {
        try {
            Context context = new Context();
            context.setVariable("couponCode", couponCode);
            context.setVariable("description", description);

            String html = templateEngine.process("email-coupon-notification", context);
            sendHtmlEmail(toEmail, "Mã giảm giá đặc biệt dành cho bạn!", html);
        } catch (Exception e) {
            log.error("Failed to send coupon notification email to {}: {}", toEmail, e.getMessage());
        }
    }

    private void sendHtmlEmail(String to, String subject, String html) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(message);
    }
}

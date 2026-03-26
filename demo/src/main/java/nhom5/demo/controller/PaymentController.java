package nhom5.demo.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.dto.request.SepayWebhookRequest;
import nhom5.demo.entity.Order;
import nhom5.demo.enums.OrderStatusEnum;
import nhom5.demo.repository.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final OrderRepository orderRepository;

    @PostMapping("/sepay-webhook")
    public ResponseEntity<?> sepayWebhook(@RequestBody SepayWebhookRequest request) {
        log.info("Incoming SePay Webhook - ID: {}, Content: {}, Amount In: {}", 
                request.getId(), request.getContent(), request.getAmount_in());

        String content = request.getContent();
        if (content == null || content.isBlank()) {
            return ResponseEntity.ok("Empty content");
        }

        // Parse Order ID from content (Expected format: FF{orderId} or similar)
        // We use Case Insensitive matching for flexibility
        Pattern pattern = Pattern.compile("FF(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(content);
        
        if (matcher.find()) {
            try {
                Long orderId = Long.parseLong(matcher.group(1));
                log.info("Detected Order ID: {}", orderId);

                orderRepository.findById(orderId).ifPresent(order -> {
                    // Verification: If amount in >= final amount, mark as PAID
                    if (request.getAmount_in() != null && 
                        request.getAmount_in().compareTo(order.getFinalAmount()) >= 0) {
                        
                        order.setIsPaid(true);
                        // If it's PENDING, move to CONFIRMED automatically
                        if (order.getStatus() == OrderStatusEnum.PENDING) {
                            order.setStatus(OrderStatusEnum.CONFIRMED);
                            order.setConfirmedAt(LocalDateTime.now());
                        }
                        
                        orderRepository.save(order);
                        log.info("Order ID {} has been marked as PAID and CONFIRMED via SePay Webhook.", orderId);
                    } else {
                        log.warn("Payment amount mismatch for Order ID {}. Expected: {}, Received: {}", 
                                orderId, order.getFinalAmount(), request.getAmount_in());
                    }
                });
            } catch (NumberFormatException e) {
                log.error("Failed to parse Order ID from content: {}", content);
            }
        } else {
            log.warn("No Order ID found in SePay content: {}", content);
        }

        // SePay expects a 200 OK response to stop retrying
        return ResponseEntity.ok("Webhook processed");
    }
}

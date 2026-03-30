package nhom5.demo.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.config.VnPayConfig;
import nhom5.demo.entity.Order;
import nhom5.demo.enums.OrderStatusEnum;
import nhom5.demo.repository.OrderRepository;
import nhom5.demo.service.OrderService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Controller xử lý các giao dịch thanh toán trực tuyến.
 * Hỗ trợ SePay (VietQR Webhook) và VnPay (Redirect + Callback).
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/payment")
public class PaymentController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final VnPayConfig vnPayConfig;

    @Value("${app.sepay.token:SECRET_TOKEN}")
    private String sepayToken;

    public PaymentController(OrderService orderService, OrderRepository orderRepository, VnPayConfig vnPayConfig) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.vnPayConfig = vnPayConfig;
    }

    /**
     * Tiếp nhận Webhook từ SePay khi có biến động số dư.
     * Tự động quét nội dung chuyển khoản để khớp mã đơn hàng (FF{id}).
     */
    @PostMapping("/sepay-webhook")
    public ResponseEntity<?> sepayWebhook(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody nhom5.demo.dto.request.SepayWebhookRequest request) {

        log.info("Received SePay Webhook for content: {}", request.getContent());
        
        if (authHeader == null || !authHeader.contains(sepayToken)) {
            log.warn("Unauthorized SePay Webhook attempt. Header: {}", authHeader);
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String content = request.getContent();
        if (content == null || content.isBlank()) {
            return ResponseEntity.ok("Empty content");
        }

        // Regex tìm kiếm mã đơn hàng có dạng FF + ID (ví dụ: FF123)
        Pattern pattern = Pattern.compile("FF(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(content);

        if (matcher.find()) {
            try {
                Long orderId = Long.parseLong(matcher.group(1));
                Order order = orderRepository.findById(orderId).orElse(null);

                if (order != null && request.getAmount_in() != null) {
                    // Trường hợp đơn hàng đã bị hủy nhưng khách vẫn chuyển khoản
                    if (order.getStatus() == OrderStatusEnum.CANCELLED) {
                        log.error("CRITICAL: Payment received for CANCELLED order {}. REQUIRE MANUAL REFUND", orderId);
                        String existingNote = order.getNote() != null ? order.getNote() : "";
                        order.setNote(existingNote + " | [CẢNH BÁO] Khách đã chuyển khoản NHƯNG ĐƠN ĐÃ HỦY. Cần hoàn tiền!");
                        orderRepository.save(order);
                        return ResponseEntity.ok("Handled cancelled order");
                    }

                    // Nếu số tiền khớp hoặc thừa, xác nhận đơn hàng
                    if (request.getAmount_in().compareTo(order.getFinalAmount()) >= 0) {
                        orderService.updateOrderStatus(orderId, OrderStatusEnum.CONFIRMED);
                        log.info("Order ID {} confirmed via SePay Webhook.", orderId);
                    }
                }
            } catch (Exception e) {
                log.error("Error processing SePay Webhook: {}", e.getMessage());
            }
        }

        return ResponseEntity.ok("Webhook processed");
    }

    /**
     * Tạo URL thanh toán VnPay.
     * Chỉ chủ đơn hàng hoặc Admin mới có quyền thực hiện.
     */
    @PostMapping("/vnpay/{orderId}")
    public ResponseEntity<?> createVnPayPayment(@PathVariable Long orderId, HttpServletRequest req)
            throws UnsupportedEncodingException {
        log.info("User requesting VnPay URL for order ID: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElse(null);
        if (order == null)
            return ResponseEntity.badRequest().body("Order not found");

        // Kiểm tra quyền sở hữu
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !order.getUser().getUsername().equals(currentUsername)) {
            return ResponseEntity.status(403).body("Unauthorized access to this order");
        }
        
        // Luồng tạo Hash và URL theo chuẩn VnPay 2.1.0
        long amount = order.getFinalAmount().longValue() * 100;
        String vnp_TxnRef = order.getOrderCode();
        String vnp_TmnCode = vnPayConfig.getVnp_TmnCode();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnPayConfig.getVnp_Version());
        vnp_Params.put("vnp_Command", vnPayConfig.getVnp_Command());
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnp_Returnurl());
        vnp_Params.put("vnp_IpAddr", vnPayConfig.getIpAddress(req));

        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", now.format(formatter));
        vnp_Params.put("vnp_ExpireDate", now.plusMinutes(15).format(formatter));

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = vnPayConfig.hmacSHA512(vnPayConfig.getVnp_HashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnPayConfig.getVnp_PayUrl() + "?" + queryUrl;

        Map<String, String> result = new HashMap<>();
        result.put("url", paymentUrl);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/vnpay-callback")
    public ResponseEntity<?> vnpayCallback(
            @RequestParam Map<String, String> allParams) {

        String vnp_SecureHash = allParams.get("vnp_SecureHash");
        if (allParams.containsKey("vnp_SecureHashType")) {
            allParams.remove("vnp_SecureHashType");
        }
        if (allParams.containsKey("vnp_SecureHash")) {
            allParams.remove("vnp_SecureHash");
        }

        List<String> fieldNames = new ArrayList<>(allParams.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = allParams.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                try {
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                } catch (UnsupportedEncodingException e) {
                    log.error("Encoding error", e);
                }
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        String checkHash = vnPayConfig.hmacSHA512(vnPayConfig.getVnp_HashSecret(), hashData.toString());
        if (checkHash.equalsIgnoreCase(vnp_SecureHash)) {
            String transactionStatus = allParams.get("vnp_ResponseCode");
            String orderCode = allParams.get("vnp_TxnRef");

            if ("00".equals(transactionStatus)) {
                // Success
                Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCode);
                if (orderOpt.isPresent()) {
                    Order order = orderOpt.get();
                    if (order.getStatus() != OrderStatusEnum.CONFIRMED
                            && order.getStatus() != OrderStatusEnum.CANCELLED) {
                        orderService.updateOrderStatus(order.getId(), OrderStatusEnum.CONFIRMED);
                        log.info("Order {} payment successful via VnPay", orderCode);
                    }
                }
                return ResponseEntity.status(302)
                        .header("Location", "http://localhost:5173/success?status=success&orderCode=" + orderCode)
                        .build();
            } else {
                // Failed
                log.warn("VnPay payment failed for order {}. Code: {}", orderCode, transactionStatus);
                return ResponseEntity.status(302)
                        .header("Location", "http://localhost:5173/success?status=failed&orderCode=" + orderCode)
                        .build();
            }
        } else {
            log.error("Invalid VnPay signature");
            return ResponseEntity.badRequest().body("Invalid signature");
        }
    }
}

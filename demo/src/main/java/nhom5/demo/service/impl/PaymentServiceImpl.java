package nhom5.demo.service.impl;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.config.VnPayConfig;
import nhom5.demo.dto.response.OrderResponse;
import nhom5.demo.entity.Order;
import nhom5.demo.enums.OrderStatusEnum;
import nhom5.demo.exception.BusinessException;
import nhom5.demo.exception.ResourceNotFoundException;
import nhom5.demo.repository.OrderRepository;
import nhom5.demo.service.OrderService;
import nhom5.demo.service.PaymentService;
import nhom5.demo.service.SecurityLogService;
import nhom5.demo.service.NotificationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Triển khai dịch vụ thanh toán trực tuyến.
 * Tích hợp cổng thanh toán VNPay (v2.1.0) và SePay Webhook.
 *
 * Luồng VNPay:
 * 1. Frontend gọi POST /api/v1/payment/vnpay/create?orderCode=ORD-xxx
 * 2. Backend tạo URL thanh toán VNPay có chữ ký HMAC-SHA512
 * 3. Frontend redirect user đến VNPay
 * 4. User thanh toán → VNPay callback về GET /api/v1/payment/vnpay-callback
 * 5. Backend xác minh chữ ký → cập nhật trạng thái đơn hàng
 * 6. Redirect user về frontend với kết quả
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final VnPayConfig vnPayConfig;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final SecurityLogService securityLogService;
    private final NotificationService notificationService;

    @Value("${app.sepay.token:}")
    private String sepayToken;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Tạo URL thanh toán VNPay theo chuẩn v2.1.0.
     * Tham số được sắp xếp theo alphabet và ký bằng HMAC-SHA512.
     */
    @Override
    @Transactional(readOnly = true)
    public String createVnPayPaymentUrl(String orderCode, HttpServletRequest request) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "code", orderCode));

        if (order.getStatus() != OrderStatusEnum.PENDING) {
            throw new BusinessException("Chỉ có thể thanh toán đơn hàng đang ở trạng thái CHỜ XÁC NHẬN");
        }

        if (order.getIsPaid()) {
            throw new BusinessException("Đơn hàng này đã được thanh toán");
        }

        // VNPay yêu cầu số tiền tính bằng đồng * 100
        long amount = order.getFinalAmount().multiply(new BigDecimal("100")).setScale(0, RoundingMode.HALF_UP).longValue();

        String vnp_TxnRef = order.getOrderCode();
        String vnp_IpAddr = vnPayConfig.getIpAddress(request);
        String vnp_CreateDate = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String vnp_ExpireDate = LocalDateTime.now().plusMinutes(15)
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        // Xây dựng tham số theo alphabet (yêu cầu bắt buộc của VNPay)
        Map<String, String> vnp_Params = new TreeMap<>();
        vnp_Params.put("vnp_Version", vnPayConfig.getVnp_Version());
        vnp_Params.put("vnp_Command", vnPayConfig.getVnp_Command());
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getVnp_TmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + order.getOrderCode());
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnp_Returnurl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Tạo chuỗi hash data và query string
        StringBuilder hashData = new StringBuilder();
        StringBuilder queryString = new StringBuilder();

        Iterator<Map.Entry<String, String>> itr = vnp_Params.entrySet().iterator();
        while (itr.hasNext()) {
            Map.Entry<String, String> entry = itr.next();
            String fieldName = entry.getKey();
            String fieldValue = entry.getValue();

            // Hash data (không URL encode)
            hashData.append(fieldName).append('=').append(fieldValue);

            // Query string (URL encode)
            queryString.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII))
                    .append('=')
                    .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

            if (itr.hasNext()) {
                hashData.append('&');
                queryString.append('&');
            }
        }

        // Ký bằng HMAC-SHA512
        String vnp_SecureHash = vnPayConfig.hmacSHA512(vnPayConfig.getVnp_HashSecret(), hashData.toString());
        queryString.append("&vnp_SecureHash=").append(vnp_SecureHash);

        String paymentUrl = vnPayConfig.getVnp_PayUrl() + "?" + queryString;

        log.info("Successfully generated VNPay payment URL for order: {} | Amount: {} | Ip: {}", 
            order.getOrderCode(), order.getFinalAmount(), vnp_IpAddr);
        return paymentUrl;
    }

    /**
     * Xử lý callback từ VNPay.
     * 1. Xác minh chữ ký HMAC-SHA512 để đảm bảo dữ liệu không bị giả mạo
     * 2. Kiểm tra mã phản hồi (vnp_ResponseCode = "00" = thành công)
     * 3. Cập nhật trạng thái đơn hàng
     */
    @Override
    @Transactional
    public OrderResponse processVnPayCallback(Map<String, String> params) {
        log.info("Received VNPay callback for TxnRef (OrderCode): {}", params.get("vnp_TxnRef"));
        log.debug("VNPay callback payload: {}", params);

        // 1. Tách vnp_SecureHash ra khỏi tham số để verify
        String vnp_SecureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        // 2. Sắp xếp lại tham số theo alphabet và tạo hash data
        Map<String, String> sortedParams = new TreeMap<>(params);
        StringBuilder hashData = new StringBuilder();
        Iterator<Map.Entry<String, String>> itr = sortedParams.entrySet().iterator();
        while (itr.hasNext()) {
            Map.Entry<String, String> entry = itr.next();
            hashData.append(entry.getKey()).append('=').append(entry.getValue());
            if (itr.hasNext()) hashData.append('&');
        }

        // 3. Verify chữ ký HMAC-SHA512
        String calculatedHash = vnPayConfig.hmacSHA512(vnPayConfig.getVnp_HashSecret(), hashData.toString());
        if (!calculatedHash.equalsIgnoreCase(vnp_SecureHash)) {
            log.error("VNPay callback INVALID CHECKSUM. Expected: {}, Calculated: {}", vnp_SecureHash, calculatedHash);
            securityLogService.log("VNPAY_INVALID_CHECKSUM", "CRITICAL",
                    "Invalid VNPay checksum for TxnRef: " + params.get("vnp_TxnRef"), "VNPAY_GATEWAY");
            throw new BusinessException("Chữ ký xác thực không hợp lệ");
        }

        // 4. Kiểm tra mã phản hồi
        String responseCode = params.get("vnp_ResponseCode");
        String orderCode = params.get("vnp_TxnRef");

        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "code", orderCode));

        if ("00".equals(responseCode)) {
            log.info("VNPay payment SUCCESS for order: {}. TransactionNo: {}, Amount: {}",
                    orderCode, params.get("vnp_TransactionNo"), params.get("vnp_Amount"));

            order.setIsPaid(true);
            order.setPaidAt(LocalDateTime.now());
            order.setNote((order.getNote() != null ? order.getNote() : "")
                    + " | VNPay TxnNo: " + params.get("vnp_TransactionNo"));
            orderRepository.save(order);

            return orderService.updateOrderStatus(Objects.requireNonNull(order.getId()), OrderStatusEnum.CONFIRMED);
        } else {
            log.warn("VNPay payment FAILED for order: {}. ResponseCode: {}, Message: {}", 
                orderCode, responseCode, getVnPayMessage(responseCode));

            securityLogService.log("VNPAY_PAYMENT_FAILED", "LOW",
                    "VNPay payment failed for order " + orderCode + " with code: " + responseCode, "VNPAY_GATEWAY");

            throw new BusinessException("Thanh toán VNPay thất bại: " + getVnPayMessage(responseCode));
        }
    }

    private String getVnPayMessage(String code) {
        return switch (code) {
            case "24" -> "Khách hàng hủy giao dịch";
            case "07" -> "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).";
            case "09" -> "Giao dịch không thành công: Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking";
            case "10" -> "Giao dịch không thành công: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
            case "11" -> "Giao dịch không thành công: Đã hết hạn chờ thanh toán.";
            case "12" -> "Giao dịch không thành công: Thẻ/Tài khoản của khách hàng bị khóa.";
            case "13" -> "Giao dịch không thành công: Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).";
            case "51" -> "Số dư không đủ";
            default -> "Lỗi không xác định (" + code + ")";
        };
    }

    /**
     * Xử lý webhook từ SePay (chuyển khoản ngân hàng tự động).
     * Xác minh token và khớp nội dung chuyển khoản với mã đơn hàng.
     */
    @Override
    @Transactional
    public boolean processSepayWebhook(Map<String, Object> payload, String token) {
        // 1. Xác minh token (Chặn nếu chưa cấu hình hoặc không khớp)
        if (sepayToken == null || sepayToken.trim().isEmpty()) {
            log.error("SePay webhook CRITICAL: Token is not configured in SERVER settings!");
            securityLogService.log("SEPAY_CONFIG_ERROR", "CRITICAL",
                    "Webhook received but SePay Token is NOT configured in server context", "SYSTEM");
            return false;
        }

        if (!sepayToken.equals(token)) {
            log.error("SePay webhook INVALID TOKEN: Match failed.");
            securityLogService.log("SEPAY_INVALID_TOKEN", "CRITICAL",
                    "Invalid SePay webhook token attempt", "SEPAY_GATEWAY");
            return false;
        }

        // 2. Trích xuất thông tin từ payload
        String content = String.valueOf(payload.getOrDefault("content", ""));
        Number amountNum = (Number) payload.getOrDefault("transferAmount", 0);
        long amount = amountNum.longValue();

        // 3. Tìm mã đơn hàng trong nội dung chuyển khoản (format: ORD-xxxx)
        String orderCode = extractOrderCode(content);
        if (orderCode == null) {
            log.warn("SePay webhook: Cannot extract order code from content: {}", content);
            return false;
        }

        // 4. Xử lý đơn hàng
        Optional<Order> optionalOrder = orderRepository.findByOrderCode(orderCode);
        if (optionalOrder.isEmpty()) {
            log.warn("SePay webhook: Order not found for code: {}", orderCode);
            return false;
        }

        Order order = optionalOrder.get();
        if (order.getIsPaid()) {
            log.info("SePay webhook: Order {} already paid", orderCode);
            return true;
        }

        // 5. Kiểm tra số tiền
        if (amount < order.getFinalAmount().longValue()) {
            log.warn("SePay webhook: Insufficient amount for order {}. Expected: {}, Got: {}",
                    orderCode, order.getFinalAmount(), amount);
            return false;
        }

        // 6. Cập nhật trạng thái
        order.setIsPaid(true);
        order.setPaidAt(LocalDateTime.now());
        order.setNote((order.getNote() != null ? order.getNote() : "")
                + " | SePay confirmed. Amount: " + amount);
        orderRepository.save(order);

        if (order.getStatus() == OrderStatusEnum.PENDING) {
            orderService.updateOrderStatus(Objects.requireNonNull(order.getId()), OrderStatusEnum.CONFIRMED);
        }

        // Notify user about successful payment via SePay
        try {
            notificationService.createNotification(order.getUser(), 
                "Đơn hàng #" + orderCode + " đã được thanh toán tự động qua SePay.", 
                "PAYMENT", 
                "/orders/" + orderCode);
        } catch (Exception e) {
            log.error("Failed to send SePay payment notification: {}", e.getMessage());
        }

        log.info("SePay webhook: Payment confirmed for order {}. Amount: {}", orderCode, amount);
        return true;
    }

    /**
     * Trích xuất mã đơn hàng từ nội dung chuyển khoản.
     * Tìm pattern "ORD-" trong chuỗi.
     */
    private String extractOrderCode(String content) {
        if (content == null || content.isBlank()) return null;
        String upper = content.toUpperCase().trim();
        int idx = upper.indexOf("ORD-");
        if (idx == -1) return null;
        // Lấy từ "ORD-" đến khoảng trắng hoặc hết chuỗi
        StringBuilder sb = new StringBuilder();
        for (int i = idx; i < upper.length(); i++) {
            char c = upper.charAt(i);
            if (Character.isWhitespace(c)) break;
            sb.append(c);
        }
        return sb.toString();
    }
}

package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.dto.response.OrderResponse;
import nhom5.demo.service.PaymentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * REST CONTROLLER: PaymentController
 * ---------------------------------------------------------
 * Quản lý luồng thanh toán trực tuyến qua VNPay và SePay.
 * 
 * Endpoint công khai (không cần JWT):
 * - GET  /api/v1/payment/vnpay-callback  → VNPay redirect callback
 * - POST /api/v1/payment/sepay-webhook   → SePay webhook
 * 
 * Endpoint bảo vệ (cần JWT):
 * - POST /api/v1/payment/vnpay/create    → Tạo URL thanh toán
 */
@Tag(name = "Payment", description = "Thanh toán trực tuyến (VNPay, SePay)")
@Slf4j
@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Tạo URL thanh toán VNPay cho đơn hàng.
     * Frontend sẽ redirect user đến URL này để thanh toán.
     */
    @Operation(summary = "Tạo URL thanh toán VNPay")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/vnpay/create")
    public ResponseEntity<ApiResponse<Map<String, String>>> createVnPayPayment(
            @RequestParam String orderCode,
            HttpServletRequest request) {

        String paymentUrl = paymentService.createVnPayPaymentUrl(
                Objects.requireNonNull(orderCode), request);

        Map<String, String> data = new HashMap<>();
        data.put("paymentUrl", paymentUrl);

        return ResponseEntity.ok(ApiResponse.success("Tạo URL thanh toán VNPay thành công", data));
    }

    /**
     * Callback từ VNPay sau khi khách hàng thanh toán.
     * VNPay redirect user về URL này với kết quả thanh toán.
     * Sau khi xử lý xong, redirect user về frontend.
     */
    @Operation(summary = "VNPay Callback (Tự động gọi bởi VNPay)")
    @GetMapping("/vnpay-callback")
    public void vnPayCallback(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // Thu thập tất cả tham số từ VNPay
        Map<String, String> params = new HashMap<>();
        request.getParameterMap().forEach((key, values) -> {
            if (values != null && values.length > 0) {
                params.put(key, values[0]);
            }
        });

        log.info("VNPay callback received. TxnRef: {}, ResponseCode: {}",
                params.get("vnp_TxnRef"), params.get("vnp_ResponseCode"));

        try {
            OrderResponse orderResponse = paymentService.processVnPayCallback(params);
            String code = (orderResponse != null && orderResponse.getOrderCode() != null) 
                         ? orderResponse.getOrderCode() : params.get("vnp_TxnRef");
            
            // Redirect về frontend trang "Thanh toán thành công"
            response.sendRedirect(frontendUrl + "/success?orderCode=" + code);
        } catch (Exception e) {
            log.error("VNPay callback processing failed CRITICAL: {}", e.getMessage());
            String fallbackCode = params.get("vnp_TxnRef");
            String errorMsg = java.net.URLEncoder.encode(e.getMessage(), java.nio.charset.StandardCharsets.UTF_8);
            
            // Redirect về frontend kèm lỗi và mã đơn hàng dự phòng để khách tra cứu
            response.sendRedirect(frontendUrl + "/checkout?error=" + errorMsg + (fallbackCode != null ? "&orderCode=" + fallbackCode : ""));
        }
    }

    /**
     * Webhook từ SePay (chuyển khoản ngân hàng).
     * SePay gọi endpoint này khi phát hiện giao dịch mới.
     */
    @Operation(summary = "SePay Webhook (Tự động gọi bởi SePay)")
    @PostMapping("/sepay-webhook")
    public ResponseEntity<ApiResponse<Void>> sepayWebhook(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String token = authHeader;
        if (authHeader != null) {
            if (authHeader.startsWith("Bearer ") || authHeader.startsWith("Apikey ")) {
                token = authHeader.substring(7);
            }
        }

        boolean success = paymentService.processSepayWebhook(payload, token);
        if (success) {
            return ResponseEntity.ok(ApiResponse.success("Webhook processed successfully", null));
        } else {
            return ResponseEntity.status(400).body(ApiResponse.error(400, "Webhook processing failed"));
        }
    }
}

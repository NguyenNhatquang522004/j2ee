package nhom5.demo.service;

import jakarta.servlet.http.HttpServletRequest;
import nhom5.demo.dto.response.OrderResponse;

import java.util.Map;

/**
 * Dịch vụ xử lý thanh toán trực tuyến (VNPay, SePay).
 * Tạo URL thanh toán, xác minh callback/webhook và cập nhật trạng thái đơn hàng.
 */
public interface PaymentService {

    /**
     * Tạo URL thanh toán VNPay cho đơn hàng.
     * @param orderCode Mã đơn hàng
     * @param request HttpServletRequest để lấy IP
     * @return URL chuyển hướng đến cổng thanh toán VNPay
     */
    String createVnPayPaymentUrl(String orderCode, HttpServletRequest request);

    /**
     * Xử lý callback từ VNPay sau khi khách hàng thanh toán.
     * Xác minh chữ ký HMAC-SHA512 và cập nhật trạng thái đơn hàng.
     * @param params Tham số callback từ VNPay
     * @return OrderResponse nếu thanh toán thành công
     */
    OrderResponse processVnPayCallback(Map<String, String> params);

    /**
     * Xử lý webhook từ SePay (chuyển khoản ngân hàng).
     * @param payload Body JSON từ SePay
     * @param token Token xác thực
     * @return true nếu xử lý thành công
     */
    boolean processSepayWebhook(Map<String, Object> payload, String token);
}

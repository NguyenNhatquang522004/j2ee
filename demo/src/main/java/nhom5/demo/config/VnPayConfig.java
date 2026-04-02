package nhom5.demo.config;

import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Getter
@Configuration
public class VnPayConfig {

    @Value("${app.vnpay.url}")
    private String vnp_PayUrl;

    @Value("${app.vnpay.return-url}")
    private String vnp_Returnurl;

    @Value("${app.vnpay.tmn-code}")
    private String vnp_TmnCode;

    @Value("${app.vnpay.hash-secret}")
    private String vnp_HashSecret;

    private final String vnp_Version = "2.1.0";
    private final String vnp_Command = "pay";

    // Chỉ nên dùng HMAC SHA512 cho bản VNPAY 2.1.0
    public String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) throw new NullPointerException("Key/Data null");
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            throw new RuntimeException("Lỗi tạo chữ ký số: " + ex.getMessage());
        }
    }

    public String getIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-FORWARDED-FOR");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }
        return ipAddress;
    }

    public String getRandomNumber(int len) {
        java.security.SecureRandom rnd = new java.security.SecureRandom();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }
}

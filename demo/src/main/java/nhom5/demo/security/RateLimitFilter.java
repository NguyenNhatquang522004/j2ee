package nhom5.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import nhom5.demo.service.RateLimitService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;

import java.io.IOException;

/**
 * Bộ lọc giới hạn tần suất yêu cầu (Rate Limiting).
 * Bảo vệ hệ thống khỏi tấn công DDoS, Brute-force và Spam bằng cách kiểm soát số lượng Request theo IP và URI.
 */
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;
    private final nhom5.demo.repository.IpBlocklistRepository ipBlocklistRepository;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        
        String uri = request.getRequestURI();

        // Lấy IP thực: ưu tiên X-Forwarded-For (reverse proxy) rồi mới lấy remoteAddr
        String ip = getClientIp(request);
        
        // KIỂM TRA DANH SÁCH ĐEN IP (Blocklist)
        // Nếu IP đã bị đánh dấu nguy hiểm bởi Admin, chặn truy cập ngay lập tức để tiết kiệm tài nguyên.
        if (ipBlocklistRepository.isBlocked(ip)) {
            response.setStatus(403);
            response.setContentType("application/json");
            response.getWriter().write("{\"status\": 403, \"message\": \"Access Denied. Địa chỉ IP của bạn đã bị tạm khoá bảo mật.\"}");
            return;
        }

        // THẮT CHẶT GIỚI HẠN CHO CÁC ENDPOINT NHẠY CẢM
        int limit = 100; // Mặc định 100 req/phút
        int window = 60; // Chu kỳ 60 giây
        
        // - Login/Register: 5 lần/phút để chống Brute-force.
        // - Newsletter: 3 lần/phút để chống Spam email.
        // - Payment: 5 lần/phút để chống lạm dụng thanh toán.
        // - Forgot Password: 3 lần/phút để chống email enumeration.
        if (uri.contains("/api/v1/auth/login") || uri.contains("/api/v1/auth/register")) {
            limit = 5;
            window = 60;
        } else if (uri.contains("/api/v1/newsletters/subscribe")) {
            limit = 3;
            window = 60;
        } else if (uri.contains("/api/v1/payment/vnpay/create")) {
            limit = 5;
            window = 60;
        } else if (uri.contains("/api/v1/auth/forgot-password")) {
            limit = 3;
            window = 60;
        }
        
        String key = ip + ":" + uri;
        if (!rateLimitService.isAllowed(key, limit, window)) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"status\": 429, \"message\": \"Too Many Requests. Vui lòng thử lại sau ít phút.\", \"timestamp\": \"" + java.time.LocalDateTime.now() + "\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Lấy IP thực của client, ưu tiên X-Forwarded-For (khi qua reverse proxy).
     * Thống nhất với AdminIpWhitelistFilter để tránh IP spoofing inconsistency.
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

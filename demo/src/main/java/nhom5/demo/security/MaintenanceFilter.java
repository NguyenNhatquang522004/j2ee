package nhom5.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.service.SettingService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;

import java.io.IOException;

/**
 * Bộ lọc Chế độ Bảo trì (Maintenance Mode Filter).
 * Ngăn chặn người dùng phổ thông truy cập khi hệ thống đang nâng cấp, nhưng vẫn mở cửa cho Quản trị viên và các luồng Thanh toán thiết yếu.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MaintenanceFilter extends OncePerRequestFilter {

    private final SettingService settingService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        /* 
        if (request.getRequestURI().startsWith("/ws")) {
            filterChain.doFilter(request, response);
            return;
        }
        */

        if (settingService.isMaintenanceMode()) {
            String path = request.getRequestURI();
            
            // DANH SÁCH CÁC NGOẠI LỆ TRONG KHI BẢO TRÌ:
            // 1. Luồng đăng nhập để Admin có thể vào cứu trợ.
            // 2. Luồng thanh toán để không làm gián đoạn các giao dịch đang diễn ra.
            // 3. Tài liệu API (Swagger) để lập trình viên vẫn có thể tra cứu.
            boolean isAdminPath = path.contains("/api/v1/dashboard") || path.contains("/api/v1/settings") || path.contains("/api/v1/auth/login");
            boolean isPaymentPath = path.contains("/api/v1/payment");
            boolean isStatic = path.contains("/swagger-ui") || path.contains("/v3/api-docs");
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = auth != null && auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdminPath && !isPaymentPath && !isStatic && !isAdmin) {
                log.warn("Access BLOCKED by Maintenance Mode: IP={} Path={}", request.getRemoteAddr(), path);
                response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"status\":503, \"message\":\"Hệ thống đang bảo trì, vui lòng quay lại sau.\", \"success\":false}");
                return;
            } else {
                log.info("Access ALLOWED during Maintenance: Path={} (Admin/Payment/Static bypass)", path);
            }
        }

        filterChain.doFilter(request, response);
    }
}

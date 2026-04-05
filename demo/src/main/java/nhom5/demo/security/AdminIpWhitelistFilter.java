package nhom5.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.service.SecurityLogService;
import nhom5.demo.service.SettingService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;

import java.io.IOException;
import java.util.Arrays;

/**
 * Filter kiểm tra IP Whitelist cho các truy cập Admin.
 * Bảo mật thêm một lớp ngoài mật khẩu: Chỉ IP được phép mới vào được trang quản trị.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminIpWhitelistFilter extends OncePerRequestFilter {

    private final SettingService settingService;
    private final SecurityLogService securityLogService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        
        // 1. Lấy thông tin xác thực hiện tại (Nếu filter này chạy sau JwtAuthenticationFilter)
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        
        boolean isSensitivePath = path.startsWith("/api/v1/dashboard") || 
                                 path.startsWith("/api/v1/batches") ||
                                 path.startsWith("/api/v1/settings") ||
                                 path.startsWith("/api/v1/admin/security") ||
                                 path.startsWith("/api/v1/audit") ||
                                 path.startsWith("/api/v1/newsletters") ||
                                 path.startsWith("/api/v1/users");

        // 2. Check if user has high-privilege authorities
        boolean hasAdminAccess = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || 
                              a.getAuthority().equals("manage:settings") ||
                              a.getAuthority().equals("manage:users"));

        // Only enforce IP whitelist for SENSITIVE paths AND users with ADMIN-level access
        if (hasAdminAccess && isSensitivePath) {
            String whitelist = settingService.getSettingValue("ADMIN_IP_WHITELIST", "*");
            
            if (!whitelist.equals("*")) {
                String clientIp = getClientIp(request);
                String[] allowedIps = whitelist.split(",");
                
                boolean isAllowed = Arrays.stream(allowedIps)
                        .map(String::trim)
                        .anyMatch(ip -> ip.equals(clientIp) || 
                                       ip.equals("127.0.0.1") || 
                                       ip.equals("0:0:0:0:0:0:0:1") ||
                                       clientIp.equals("localhost"));

                if (!isAllowed) {
                    log.warn("Blocked unauthorized ACCESS to Admin domain from IP: {} for user: {} for path: {}", 
                        clientIp, (auth != null ? auth.getName() : "Anonymous"), path);
                    
                    securityLogService.log("SUSPICIOUS_ADMIN_ACCESS", "CRITICAL", 
                        "Blocked access attempt by " + (auth != null ? auth.getName() : "Anonymous") + " from unauthorized IP", clientIp);
                    
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"success\": false, \"message\": \"Truy cập bị chặn: IP của bạn không nằm trong danh sách trắng dành cho Quản trị viên.\"}");
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

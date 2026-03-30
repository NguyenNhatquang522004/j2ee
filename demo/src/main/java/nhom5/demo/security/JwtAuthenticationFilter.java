package nhom5.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Bộ lọc bảo mật JWT (OncePerRequestFilter).
 * Chịu trách nhiệm trích xuất, xác thực JWT và thiết lập ngữ cảnh bảo mật cho mỗi Request.
 * Tích hợp các tính năng nâng cao: Thu hồi Token (Version Check) và Whitelist IP Admin.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;
    private final nhom5.demo.service.SettingService settingService;

    @Override
    @SuppressWarnings("NullableProblems")
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        if (request.getRequestURI().startsWith("/ws")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = extractJwtFromRequest(request);
        log.debug("Processing request for URI: {} with token: {}", request.getRequestURI(), token != null ? "PRESENT" : "MISSING");

        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            String username = jwtTokenProvider.getUsernameFromToken(token);
            Integer tokenVersion = jwtTokenProvider.getTokenVersionFromToken(token);
            
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (userDetails instanceof CustomUserDetails customUserDetails) {
                // KIỂM TRA PHIÊN BẢN TOKEN (Kill Switch)
                // Nếu tokenVersion trong JWT không khớp với DB (do đổi mật khẩu/đăng xuất toàn cầu), chặn truy cập ngay lập tức.
                if (tokenVersion == null || !tokenVersion.equals(customUserDetails.getTokenVersion())) {
                    log.warn("Invalid token version for user: {}. Token: {}, Expected: {}", 
                            username, tokenVersion, customUserDetails.getTokenVersion());
                    filterChain.doFilter(request, response);
                    return;
                }

                // KIỂM TRA IP WHITELIST DÀNH CHO QUẢN TRỊ (ADMIN/STAFF)
                // Ngăn chặn truy cập quyền cao từ các địa chỉ IP lạ ngoài cấu hình Whitelist.
                if (customUserDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"))) {
                    String whitelist = settingService.getSettingValue("ADMIN_IP_WHITELIST", "");
                    if (StringUtils.hasText(whitelist)) {
                        String currentIp = request.getRemoteAddr();
                        String[] allowedIps = whitelist.split(",");
                        boolean allowed = false;
                        for (String ip : allowedIps) {
                            if (ip.trim().equals(currentIp) || ip.trim().equals("*")) {
                                allowed = true;
                                break;
                            }
                        }
                        if (!allowed) {
                            log.warn("ADMIN ACCESS DENIED: IP {} not in whitelist for user {}", currentIp, username);
                            response.setStatus(403);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"status\": 403, \"message\": \"Access Denied. IP của bạn không được phép truy cập quyền Quản trị.\"}");
                            return;
                        }
                    }
                }

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

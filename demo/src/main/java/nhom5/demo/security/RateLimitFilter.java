package nhom5.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import nhom5.demo.service.RateLimitService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String ip = request.getRemoteAddr();
        String uri = request.getRequestURI();
        
        // Specific limits for sensitive endpoints
        int limit = 100; // default
        int window = 60; // 1 minute
        
        if (uri.contains("/api/v1/auth/login") || uri.contains("/api/v1/auth/register")) {
            limit = 5;
            window = 60;
        } else if (uri.contains("/api/v1/newsletters/subscribe")) {
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
}

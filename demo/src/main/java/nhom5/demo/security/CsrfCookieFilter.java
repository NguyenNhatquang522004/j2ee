package nhom5.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter to write the CSRF token to a cookie for the client to read and send back in headers.
 * This is the "Enterprise Target Strict Match" approach for SPAs.
 */
public class CsrfCookieFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            // Render the token and its value to a cookie named XSRF-TOKEN
            // This is accessed by the frontend to send back as X-XSRF-TOKEN header
            csrfToken.getToken(); // Forces initialization
            
            // Re-confirm if cookie was already set to prevent redundant writes
            // Actually Spring's CookieCsrfTokenRepository handles writing the token,
            // but we call getToken() to ensure it's loaded as part of the request lifecycle.
        }
        filterChain.doFilter(request, response);
    }
}

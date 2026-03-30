package nhom5.demo.config;

import lombok.RequiredArgsConstructor;
import nhom5.demo.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import nhom5.demo.security.MaintenanceFilter;
import nhom5.demo.security.RateLimitFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

/**
 * Cấu hình bảo mật hệ thống (Spring Security + JWT).
 * Đảm bảo an toàn cho các Endpoint API, phân quyền (RBAC) và tích hợp các bộ lọc (Filters) bảo vệ.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final MaintenanceFilter maintenanceFilter;
    private final RateLimitFilter rateLimitFilter;
    private final UserDetailsService userDetailsService;

    @org.springframework.beans.factory.annotation.Value("${app.security.cors.allowed-origins}")
    private String[] allowedOrigins;

    /**
     * Cấu hình bỏ qua bộ lọc cho một số API công khai đặc thù (Payment Callback từ VnPay/SePay).
     */
    @Bean
    public org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring()
                .requestMatchers("/api/v1/payment/**", "/ws/**");
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Quản lý nguồn gốc truy cập (CORS) - Lấy từ cấu hình môi trường (.env).
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(
                Arrays.asList("Authorization", "Content-Type", "X-XSRF-TOKEN", "Accept", "X-Requested-With"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "X-XSRF-TOKEN"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Thiết lập chuỗi các Filter bảo mật và quy tắc phân quyền (Authorization).
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable()) // Stateless API không cần CSRF token
                .headers(headers -> headers
                        .contentSecurityPolicy(csp -> csp.policyDirectives(
                                "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://res.cloudinary.com; connect-src 'self' http://localhost:8080; object-src 'none'; frame-ancestors 'none';"))
                        .frameOptions(
                                org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig::deny)
                        .xssProtection(xss -> xss.disable())
                        .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000))
                        .referrerPolicy(referrer -> referrer.policy(
                                org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. API Công khai (Không cần đăng nhập)
                        .requestMatchers("/api/v1/payment/**", "/error", "/ws/**", "/api/v1/auth/**", "/api/v1/ai/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/**", "/api/v1/categories/**", "/api/v1/farms/**", "/api/v1/reviews/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/newsletters/subscribe", "/api/v1/contacts").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        
                        // 2. Monitoring - Chỉ Admin
                        .requestMatchers("/actuator/**").hasAuthority("ROLE_ADMIN")
                        
                        // 3. Admin Dashboard & Reports
                        .requestMatchers("/api/v1/dashboard/**").hasAuthority("view:reports")
                        
                        // 4. Quản lý Sản phẩm, Danh mục, Trang trại (Admin/Staff)
                        .requestMatchers(HttpMethod.POST, "/api/v1/products/**", "/api/v1/categories/**", "/api/v1/farms/**", "/api/v1/coupons/**").hasAnyAuthority("ROLE_ADMIN", "manage:products", "manage:categories", "manage:farms")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/products/**", "/api/v1/categories/**", "/api/v1/farms/**", "/api/v1/coupons/**").hasAnyAuthority("ROLE_ADMIN", "manage:products", "manage:categories", "manage:farms")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/products/**", "/api/v1/categories/**", "/api/v1/farms/**", "/api/v1/coupons/**").hasAnyAuthority("ROLE_ADMIN", "manage:products", "manage:categories", "manage:farms")
                        
                        // 5. Quản lý Lô hàng & Người dùng
                        .requestMatchers("/api/v1/batches/**").hasAnyAuthority("ROLE_ADMIN", "manage:batches", "view:batches")
                        .requestMatchers("/api/v1/users/me").authenticated()
                        .requestMatchers("/api/v1/users/**").hasAuthority("manage:users")
                        
                        // 6. Tất cả các yêu cầu còn lại
                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                // Thứ tự Filter bảo vệ: Rate Limit -> JWT Auth -> Maintenance Mode
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(jwtAuthenticationFilter, RateLimitFilter.class)
                .addFilterAfter(maintenanceFilter, JwtAuthenticationFilter.class);

        return http.build();
    }
}

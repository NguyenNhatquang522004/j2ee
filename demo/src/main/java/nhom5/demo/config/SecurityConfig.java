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
import nhom5.demo.security.CsrfCookieFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final MaintenanceFilter maintenanceFilter;
    private final RateLimitFilter rateLimitFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring()
                .requestMatchers("/api/v1/payment/**");
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

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Strict match for enterprise targets: explicitly specify allowed origins
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-XSRF-TOKEN", "Accept", "X-Requested-With"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "X-XSRF-TOKEN"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                        .ignoringRequestMatchers(
                            "/api/v1/auth/**", 
                            "/api/v1/payment/callback/**", 
                            "/api/v1/newsletters/subscribe/**", 
                            "/api/v1/notifications/read-all"
                        )
                )
                .headers(headers -> headers
                        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none';"))
                        .frameOptions(org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig::deny)
                        .xssProtection(xss -> xss.disable()) 
                        .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000))
                        .referrerPolicy(referrer -> referrer.policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/v1/payment/**", "/error", "/actuator/**").permitAll()
                        // Auth & AI & Newsletter endpoints — public
                        .requestMatchers("/api/v1/auth/**", "/api/v1/ai/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/newsletters/subscribe").permitAll()
                        .requestMatchers("/api/v1/newsletters/**").hasAuthority("manage:newsletters")
                        // Swagger UI — public
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        // Public read endpoints
                        .requestMatchers(HttpMethod.GET, "/api/v1/products", "/api/v1/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories", "/api/v1/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/farms", "/api/v1/farms/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/reviews", "/api/v1/reviews/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/coupons/validate/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/coupons", "/api/v1/coupons/**").permitAll()
                        // Admin-only endpoints (protected by permissions)
                        .requestMatchers("/api/v1/dashboard/**", "/api/v1/dashboard").hasAuthority("view:reports")
                        .requestMatchers(HttpMethod.GET, "/api/v1/products", "/api/v1/products/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/products/**").hasAuthority("manage:products")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/products/**").hasAuthority("manage:products")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/products/**").hasAuthority("manage:products")
                        // Batches
                        .requestMatchers(HttpMethod.GET, "/api/v1/batches/**", "/api/v1/batches").hasAnyAuthority("view:batches", "manage:batches")
                        .requestMatchers("/api/v1/batches/**", "/api/v1/batches").hasAuthority("manage:batches")
                        .requestMatchers(HttpMethod.POST, "/api/v1/farms/**").hasAuthority("manage:farms")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/farms/**").hasAuthority("manage:farms")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/farms/**").hasAuthority("manage:farms")
                        .requestMatchers(HttpMethod.POST, "/api/v1/categories/**").hasAuthority("manage:categories")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/categories/**").hasAuthority("manage:categories")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/categories/**").hasAuthority("manage:categories")
                        // Users: /users/me accessible by any authenticated user; rest is admin-only
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/me").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/users/me").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/users/me/avatar").authenticated()
                        .requestMatchers("/api/v1/users/**", "/api/v1/users").hasAuthority("manage:users")
                        // Coupons (Management)
                        .requestMatchers(HttpMethod.POST, "/api/v1/coupons/**").hasAuthority("manage:products")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/coupons/**").hasAuthority("manage:products")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/coupons/**").hasAuthority("manage:products")
                        // All other requests require authentication
                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(maintenanceFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(rateLimitFilter, MaintenanceFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class);

        return http.build();
    }
}

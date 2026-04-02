package nhom5.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Cấu hình chung cho ứng dụng Web.
 * Bao gồm: RestTemplate cho các cuộc gọi API ngoài và cấu hình CORS (Cross-Origin Resource Sharing).
 */
@Configuration
public class AppConfig implements WebMvcConfigurer {

    @Value("${app.security.cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private String[] allowedOrigins;

    /**
     * Bean dùng để gọi các dịch vụ API bên ngoài (ví dụ: AI Prediction Service).
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * Cấu hình CORS để cho phép Frontend (Vite/React) truy cập API từ các domain khác nhau.
     * Sử dụng biến môi trường app.security.cors.allowed-origins để linh hoạt khi triển khai.
     */
    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins != null ? allowedOrigins : new String[0])
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}

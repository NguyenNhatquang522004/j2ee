package nhom5.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class MeilisearchConfig {

    @Value("${app.meili.host:http://localhost:7700}")
    private String host;

    @Value("${app.meili.apiKey:freshfood_super_secret_master_key_123}")
    private String apiKey;

    @Bean
    public RestTemplate meiliRestTemplate(RestTemplateBuilder builder) {
        return builder
                .rootUri(host)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, "application/json")
                .connectTimeout(Duration.ofSeconds(2))
                .readTimeout(Duration.ofSeconds(3))
                .build();
    }
}

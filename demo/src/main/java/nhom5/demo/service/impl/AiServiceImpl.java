package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.dto.response.AiFreshnessResponse;
import nhom5.demo.service.AiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Triển khai dịch vụ AI Phân tích độ tươi (Freshness Analysis).
 * Kết nối với một Python Flask Server chạy mô hình YOLOv8 để xử lý hình ảnh thực phẩm.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private final RestTemplate restTemplate;

    @Value("${app.ai.api.url}")
    private String aiApiUrl;

    @Override
    public AiFreshnessResponse analyzeFreshness(MultipartFile imageFile) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", new ByteArrayResource(imageFile.getBytes()) {
                @Override
                public String getFilename() {
                    return imageFile.getOriginalFilename();
                }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            log.info("Calling AI service at: {}", aiApiUrl);
            
            // Thực hiện POST hình ảnh sang Server Python AI
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    aiApiUrl,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            log.info("AI service response status: {}", response.getStatusCode());

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("AI service response body: {}", response.getBody());
                Map<String, Object> result = response.getBody();
                String label = String.valueOf(result.getOrDefault("label", "UNKNOWN"));
                double confidence = result.containsKey("confidence")
                        ? Double.parseDouble(String.valueOf(result.get("confidence")))
                        : 0.0;
                boolean isFresh = "FRESH".equalsIgnoreCase(label) || "GOOD".equalsIgnoreCase(label);

                String description = result.containsKey("description")
                        ? String.valueOf(result.get("description"))
                        : (isFresh ? "Thực phẩm có màu sắc, hình dạng bình thường, không có dấu hiệu hư hỏng."
                                : "Thực phẩm có dấu hiệu biến đổi màu sắc hoặc kết cấu bất thường.");
                String suggestion = result.containsKey("suggestion")
                        ? String.valueOf(result.get("suggestion"))
                        : (isFresh ? "Có thể sử dụng bình thường. Nên bảo quản đúng cách để giữ độ tươi."
                                : "Không nên sử dụng. Vui lòng kiểm tra lại hoặc liên hệ cửa hàng.");

                String message = result.containsKey("message")
                        ? String.valueOf(result.get("message"))
                        : (isFresh ? "Sản phẩm còn tươi và an toàn để sử dụng"
                                 : "Sản phẩm có dấu hiệu không còn tươi. Không nên sử dụng.");

                return AiFreshnessResponse.builder()
                        .result(label)
                        .label(label)
                        .freshness(label)
                        .confidence(confidence)
                        .isFresh(isFresh)
                        .description(description)
                        .suggestion(suggestion)
                        .message(message)
                        .build();
            }

            return buildErrorResponse("Không nhận được kết quả từ AI service");

        } catch (IOException e) {
            log.error("Error reading uploaded image: {}", e.getMessage());
            return buildErrorResponse("Không thể đọc file ảnh: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error calling AI freshness service: {}", e.getMessage());
            return buildErrorResponse("AI service tạm thời không khả dụng. Vui lòng thử lại sau.");
        }
    }

    private AiFreshnessResponse buildErrorResponse(String message) {
        return AiFreshnessResponse.builder()
                .result("ERROR")
                .label("UNKNOWN")
                .freshness("ERROR")
                .confidence(0.0)
                .isFresh(false)
                .message(message)
                .description("Không thể phân tích hình ảnh.")
                .suggestion("Vui lòng thử lại hoặc liên hệ hỗ trợ.")
                .build();
    }
}

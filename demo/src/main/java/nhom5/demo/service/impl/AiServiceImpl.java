package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.dto.response.AiFreshnessResponse;
import nhom5.demo.service.AiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private final RestTemplate restTemplate;

    @Value("${ai.freshness-api-url}")
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
            ResponseEntity<Map> response = restTemplate.postForEntity(aiApiUrl, requestEntity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> result = (Map<String, Object>) response.getBody();
                String label = String.valueOf(result.getOrDefault("label", "UNKNOWN"));
                double confidence = result.containsKey("confidence")
                        ? Double.parseDouble(String.valueOf(result.get("confidence")))
                        : 0.0;
                boolean isFresh = "FRESH".equalsIgnoreCase(label);

                return AiFreshnessResponse.builder()
                        .result(label)
                        .label(label)
                        .confidence(confidence)
                        .isFresh(isFresh)
                        .message(isFresh
                                ? "Sản phẩm còn tươi và an toàn để sử dụng"
                                : "Sản phẩm có dấu hiệu không còn tươi. Không nên sử dụng.")
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
                .confidence(0.0)
                .isFresh(false)
                .message(message)
                .build();
    }
}

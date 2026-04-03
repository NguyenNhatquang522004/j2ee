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

import java.util.Objects;
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
                    return imageFile.getOriginalFilename() != null ? imageFile.getOriginalFilename() : "image.jpg";
                }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            log.info("Calling AI service at: {}", aiApiUrl);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    Objects.requireNonNull(aiApiUrl),
                    Objects.requireNonNull(HttpMethod.POST),
                    requestEntity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            log.info("AI service response status: {}", response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                if (result == null) {
                    return buildErrorResponse("Dữ liệu phản hồi từ AI service bị trống");
                }
                log.info("AI service response body: {}", result);

                // Ưu tiên lấy 'freshness' key từ Python (FRESH/SPOILED/UNKNOWN)
                String freshnessKey = String.valueOf(result.getOrDefault("freshness", "UNKNOWN")).toUpperCase();
                
                // Lấy 'label' (Nhãn hiển thị tiếng Việt hoặc tên class)
                String displayLabel = String.valueOf(result.getOrDefault("label", 
                        result.getOrDefault("detectedClass", freshnessKey)));

                double confidence = 0.0;
                try {
                    Object confObj = result.get("confidence");
                    if (confObj != null) {
                        confidence = Double.parseDouble(String.valueOf(confObj));
                    }
                } catch (Exception e) {
                    log.warn("Could not parse confidence: {}", result.get("confidence"));
                }

                boolean isFresh = "FRESH".equalsIgnoreCase(freshnessKey) || (boolean) result.getOrDefault("isFresh", false);

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
                        .result(freshnessKey)
                        .label(displayLabel)
                        .freshness(freshnessKey) // Dùng key chuẩn (FRESH/SPOILED) cho frontend CSS
                        .confidence(confidence)
                        .isFresh(isFresh)
                        .description(description)
                        .suggestion(suggestion)
                        .message(message)
                        .build();
            }

            return buildErrorResponse("Không nhận được phản hồi hợp lệ từ AI service (Status: " + response.getStatusCode() + ")");

        } catch (IOException e) {
            log.error("IO error reading image file: {}", e.getMessage());
            return buildErrorResponse("Lỗi đọc tệp ảnh: " + e.getMessage());
        } catch (Exception e) {
            log.error("AI service error: {}", e.getMessage(), e);
            String errorMsg = e.getMessage();
            if (errorMsg != null && errorMsg.contains("Connection refused")) {
                errorMsg = "Không thể kết nối đến server AI (localhost:5001). Vui lòng đảm bảo Python server đang chạy.";
            }
            return buildErrorResponse(errorMsg);
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
                .description(message != null ? message : "Không thể phân tích hình ảnh.")
                .suggestion("Vui lòng thử lại hoặc đảm bảo dịch vụ AI (Port 5001) đang hoạt động.")
                .build();
    }
}

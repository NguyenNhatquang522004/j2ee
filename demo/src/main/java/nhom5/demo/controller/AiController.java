package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nhom5.demo.constant.AppConstants;
import nhom5.demo.dto.response.AiFreshnessResponse;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.service.AiService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "AI Freshness", description = "Phân tích độ tươi thực phẩm bằng AI")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping(AppConstants.AI_PATH)
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @Operation(summary = "Phân tích ảnh thực phẩm để đánh giá độ tươi")
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AiFreshnessResponse>> analyzeFreshness(
            @RequestParam("image") MultipartFile image) {
        AiFreshnessResponse data = aiService.analyzeFreshness(image);
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}

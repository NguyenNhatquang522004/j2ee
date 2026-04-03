package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.entity.SystemSetting;
import nhom5.demo.service.SettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * REST CONTROLLER: SettingController
 * ---------------------------------------------------------
 * Manages global application configurations and system preferences.
 * Provides a dynamic way to update operational parameters without redeploying code.
 * 
 * Examples: Shipping rates, currency formats, maintenance status, and SEO metadata.
 */
@Tag(name = "Settings", description = "Quản lý thiết lập hệ thống")
@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SettingController {

    private final SettingService settingService;

    /**
     * getPublic: Retrieves non-sensitive configurations for frontend display (e.g., Shop Name).
     */
    @Operation(summary = "Lấy các cài đặt công khai")
    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<SystemSetting>>> getPublic() {
        return ResponseEntity.ok(ApiResponse.success(settingService.getPublicSettings()));
    }

    /**
     * getAll: Lists all system settings, including internal operational flags for Admin review.
     */
    @Operation(summary = "Lấy tất cả cài đặt hệ thống (Admin)")
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'view:settings', 'manage:settings')")
    public ResponseEntity<ApiResponse<List<SystemSetting>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(settingService.getAllSettings()));
    }

    /**
     * update: Modifies a single system setting by its unique key.
     */
    @Operation(summary = "Cập nhật một cài đặt")
    @PutMapping("/{key}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'manage:settings')")
    public ResponseEntity<ApiResponse<Void>> update(@PathVariable String key, @RequestBody Map<String, String> body) {
        settingService.updateSetting(Objects.requireNonNull(key), Objects.requireNonNull(body.get("value")));
        return ResponseEntity.ok(ApiResponse.success("Cập nhật cài đặt thành công", null));
    }

    /**
     * updateBatch: Applies multiple configuration changes in a single transaction.
     * Efficient for initialization or major system reconfigurations.
     */
    @Operation(summary = "Cập nhật nhiều cài đặt cùng lúc")
    @PutMapping("/batch")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'manage:settings')")
    public ResponseEntity<ApiResponse<Void>> updateBatch(@RequestBody Map<String, String> settings) {
        settingService.updateSettings(Objects.requireNonNull(settings));
        return ResponseEntity.ok(ApiResponse.success("Cập nhật các cài đặt thành công", null));
    }
}

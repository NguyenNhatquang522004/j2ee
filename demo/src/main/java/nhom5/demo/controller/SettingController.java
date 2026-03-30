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

@Tag(name = "Settings", description = "Quản lý thiết lập hệ thống")
@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SettingController {

    private final SettingService settingService;

    @Operation(summary = "Lấy các cài đặt công khai")
    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<SystemSetting>>> getPublic() {
        return ResponseEntity.ok(ApiResponse.success(settingService.getPublicSettings()));
    }

    @Operation(summary = "Lấy tất cả cài đặt hệ thống (Admin)")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SystemSetting>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(settingService.getAllSettings()));
    }

    @Operation(summary = "Cập nhật một cài đặt")
    @PutMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> update(@PathVariable String key, @RequestBody Map<String, String> body) {
        settingService.updateSetting(key, body.get("value"));
        return ResponseEntity.ok(ApiResponse.success("Cập nhật cài đặt thành công", null));
    }

    @Operation(summary = "Cập nhật nhiều cài đặt cùng lúc")
    @PutMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateBatch(@RequestBody Map<String, String> settings) {
        settingService.updateSettings(settings);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật các cài đặt thành công", null));
    }
}

package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nhom5.demo.entity.SecurityLog;
import nhom5.demo.service.SecurityLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * Controller dành cho Quản trị viên truy xuất Nhật ký Bảo mật.
 * Cho phép giám sát các sự kiện như đăng nhập thất bại, IP bị chặn, v.v.
 */
@RestController
@RequestMapping("/api/admin/security/logs")
@RequiredArgsConstructor
@Tag(name = "Security Audit", description = "Endpoints for monitoring security events and logs.")
@PreAuthorize("hasRole('ADMIN')")
public class SecurityLogController {

    private final SecurityLogService securityLogService;

    @GetMapping
    @Operation(summary = "Lấy danh sách nhật ký bảo mật (Phân trang)")
    public ResponseEntity<Page<SecurityLog>> getAllLogs(
            @PageableDefault(size = 20, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(securityLogService.getAllLogs(pageable));
    }

    @GetMapping("/ip/{ip}")
    @Operation(summary = "Lấy nhật ký bảo mật theo địa chỉ IP")
    public ResponseEntity<Page<SecurityLog>> getLogsByIp(
            @PathVariable String ip,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(securityLogService.getLogsByIp(ip, pageable));
    }

    @DeleteMapping("/cleanup")
    @Operation(summary = "Xóa nhật ký cũ (Mặc định trước 30 ngày)")
    public ResponseEntity<Void> cleanupLogs(@RequestParam(required = false) Integer days) {
        int daysToKeep = (days != null) ? days : 30;
        securityLogService.cleanupOldLogs(LocalDateTime.now().minusDays(daysToKeep));
        return ResponseEntity.noContent().build();
    }
}

package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.entity.AdminAuditLog;
import nhom5.demo.service.AuditService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller quản lý Nhật ký hệ thống (Audit Logs).
 * Cho phép Admin theo dõi mọi hoạt động nhạy cảm trên hệ thống để phục vụ giám sát và bảo soát bảo mật.
 */
@Tag(name = "Audit", description = "Nhật ký hệ thống")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @Operation(summary = "Xem nhật ký hệ thống (Admin)")
    @PreAuthorize("hasAuthority('view:reports')")
    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<Page<AdminAuditLog>>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(auditService.getLogs(pageable)));
    }

    @Operation(summary = "Xoá nhật ký theo username (Admin)")
    @PreAuthorize("hasAuthority('manage:users')")
    @DeleteMapping("/logs/user/{username}")
    public ResponseEntity<ApiResponse<Void>> deleteLogsByUsername(@PathVariable String username) {
        auditService.deleteLogsByUsername(username);
        return ResponseEntity.ok(ApiResponse.<Void>success("Đã xoá nhật ký của " + username, null));
    }

    @Operation(summary = "Xoá một dòng nhật ký (Admin)")
    @PreAuthorize("hasAuthority('manage:users')")
    @DeleteMapping("/logs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLog(@PathVariable Long id) {
        auditService.deleteLog(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Đã xoá dòng nhật ký", null));
    }

    @Operation(summary = "Dọn sạch nhật ký (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/logs/clear")
    public ResponseEntity<ApiResponse<Void>> clearAllLogs() {
        auditService.clearAllLogs();
        return ResponseEntity.ok(ApiResponse.<Void>success("Đã dọn sạch nhật ký hệ thống", null));
    }
}

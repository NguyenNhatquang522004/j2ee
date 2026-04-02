package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.entity.Notification;
import nhom5.demo.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

/**
 * REST CONTROLLER: NotificationController
 * ---------------------------------------------------------
 * Handles user-centric alerts and system communications.
 * Integrates with the real-time notification engine to keep users updated on order status and promotions.
 * 
 * Visibility: Every action is scoped to the context of the currently authenticated user.
 */
@Tag(name = "Notifications", description = "Quản lý thông báo người dùng")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * getMyNotifications: Retrieves a paginated history of all alerts sent to the authenticated user.
     */
    @Operation(summary = "Lấy danh sách thông báo của tôi (có phân trang)")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Notification>>> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getMyNotifications(PageRequest.of(page, size))));
    }

    /**
     * getUnread: Focuses on actionable items the user has not yet acknowledged.
     */
    @Operation(summary = "Lấy danh sách thông báo chưa đọc")
    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> getUnread() {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnreadNotifications()));
    }

    /**
     * getUnreadCount: Returns a numeric indicator for use in UI badges.
     */
    @Operation(summary = "Lấy số lượng thông báo chưa đọc")
    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnreadCount()));
    }

    /**
     * markAsRead: Silences a specific notification by updating its read status.
     */
    @Operation(summary = "Đánh dấu một thông báo là đã đọc")
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu là đã đọc", null));
    }

    /**
     * markAllAsRead: Bulk update to clear all unread indicators for the current user.
     */
    @Operation(summary = "Đánh dấu tất cả thông báo là đã đọc")
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu tất cả là đã đọc", null));
    }

    /**
     * delete: Permanent removal of a single notification record.
     */
    @Operation(summary = "Xóa một thông báo")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        notificationService.delete(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.success("Đã xóa thông báo", null));
    }

    /**
     * deleteAll: Complete cleanup of the user's notification box.
     */
    @Operation(summary = "Xóa tất cả thông báo của tôi")
    @DeleteMapping("/delete-all")
    public ResponseEntity<ApiResponse<Void>> deleteAll() {
        notificationService.deleteAll();
        return ResponseEntity.ok(ApiResponse.success("Đã xóa tất cả thông báo", null));
    }
}

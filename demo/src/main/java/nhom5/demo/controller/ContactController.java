package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.request.ContactRequest;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.entity.ContactMessage;
import nhom5.demo.service.ContactMessageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;
import java.util.Objects;

/**
 * REST CONTROLLER: ContactController
 * ---------------------------------------------------------
 * Manages direct communication between customers and the FreshFood support team.
 * Handles the intake of public inquiries and provides administrative tools for resolution tracking.
 * 
 * Flow:
 * - Public: Submit a message/inquiry.
 * - Admin: Read, Manage, and monitor response metrics (Unread count).
 */
@Tag(name = "Contact", description = "Quản lý liên hệ")
@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class ContactController {

    private final ContactMessageService contactService;

    /**
     * sendContact: Public gateway for users/guests to send support requests or feedback.
     * Enforces the initial 'unread' status to ensure visibility in the Admin dashboard.
     */
    @Operation(summary = "Gửi lời nhắn (Public)")
    @PostMapping
    public ResponseEntity<ApiResponse<ContactMessage>> sendContact(@Valid @RequestBody @NonNull ContactRequest request) {
        log.info("Incoming contact message from: {}", request.getEmail());
        ContactMessage message = ContactMessage.builder()
                .name(Objects.requireNonNull(request.getName()))
                .email(Objects.requireNonNull(request.getEmail()))
                .subject(request.getSubject())
                .content(Objects.requireNonNull(request.getContent()))
                .isRead(false)
                .build();
        return ResponseEntity.ok(ApiResponse.success("Đã gửi tin nhắn thành công", contactService.save(Objects.requireNonNull(message))));
    }

    /**
     * getAll: Retrieves a chronological stream of customer inquiries for Admin review.
     */
    @Operation(summary = "Danh sách lời nhắn (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ContactMessage>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(contactService.findAll(pageable)));
    }

    /**
     * markAsRead: Signals that a support representative has acknowledged a specific message.
     */
    @Operation(summary = "Đánh dấu đã xem (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable @NonNull Long id) {
        contactService.markAsRead(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu đã đọc", null));
    }

    /**
     * delete: Permanent removal of a contact record from the archival database.
     */
    @Operation(summary = "Xoá lời nhắn (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable @NonNull Long id) {
        contactService.delete(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.success("Đã xoá tin nhắn", null));
    }

    /**
     * getUnreadCount: Returns a numeric indicator for use in Admin sidebar notifications.
     */
    @Operation(summary = "Số lượng tin nhắn chưa đọc (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        return ResponseEntity.ok(ApiResponse.success(contactService.countUnread()));
    }
}

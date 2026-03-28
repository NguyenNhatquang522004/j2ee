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

@Tag(name = "Contact", description = "Quản lý liên hệ")
@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class ContactController {

    private final ContactMessageService contactService;

    @Operation(summary = "Gửi lời nhắn (Public)")
    @PostMapping
    public ResponseEntity<ApiResponse<ContactMessage>> sendContact(@Valid @RequestBody ContactRequest request) {
        log.info("Incoming contact message from: {}", request.getEmail());
        ContactMessage message = ContactMessage.builder()
                .name(request.getName())
                .email(request.getEmail())
                .subject(request.getSubject())
                .content(request.getContent())
                .isRead(false)
                .build();
        return ResponseEntity.ok(ApiResponse.success("Đã gửi tin nhắn thành công", contactService.save(message)));
    }

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

    @Operation(summary = "Đánh dấu đã xem (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        contactService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu đã đọc", null));
    }

    @Operation(summary = "Xoá lời nhắn (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        contactService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xoá tin nhắn", null));
    }

    @Operation(summary = "Số lượng tin nhắn chưa đọc (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        return ResponseEntity.ok(ApiResponse.success(contactService.countUnread()));
    }
}

package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nhom5.demo.constant.AppConstants;
import nhom5.demo.dto.request.NewsletterRequest;
import nhom5.demo.dto.request.SendNewsletterRequest;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.service.NewsletterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;
import java.util.Objects;
import java.util.List;
import nhom5.demo.entity.NewsletterSubscriber;
import org.springframework.security.access.prepost.PreAuthorize;

/**
 * REST CONTROLLER: NewsletterController
 * ---------------------------------------------------------
 * Facilitates community engagement through periodic email updates.
 * Manages the subscriber registry and provides administrative tools for mass communication.
 * 
 * Visibility: 
 * - Public: Subscription gateway.
 * - Admin: List management and campaign triggering ('manage:newsletters' authority).
 */
@Tag(name = "Newsletter", description = "Đăng ký nhận bản tin")
@RestController
@RequestMapping(AppConstants.NEWSLETTER_PATH)
@RequiredArgsConstructor
public class NewsletterController {

    private final NewsletterService newsletterService;

    /**
     * subscribe: Enrolls a new email address into the system's marketing database.
     */
    @Operation(summary = "Đăng ký nhận bản tin qua email")
    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse<Void>> subscribe(
            @Valid @RequestBody @NonNull NewsletterRequest request) {
        newsletterService.subscribe(Objects.requireNonNull(request.getEmail()));
        return ResponseEntity.ok(ApiResponse.success("Đăng ký nhận bản tin thành công!", null));
    }

    /**
     * getAllSubscribers: Lists all active members of the mailing list for Admin review.
     */
    @Operation(summary = "Lấy danh sách người đăng ký (Admin)")
    @PreAuthorize("hasAuthority('manage:newsletters')")
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<NewsletterSubscriber>>> getAllSubscribers() {
        return ResponseEntity.ok(ApiResponse.success(newsletterService.getAllSubscribers()));
    }

    /**
     * sendNewsletter: Triggers a mass-email broadcast to all registered subscribers.
     * Useful for weekly promotions or major shop announcements.
     */
    @Operation(summary = "Gửi bản tin cho tất cả người đăng ký (Admin)")
    @PreAuthorize("hasAuthority('manage:newsletters')")
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<Void>> sendNewsletter(
            @Valid @RequestBody @NonNull SendNewsletterRequest request) {
        newsletterService.sendNewsletterToAll(Objects.requireNonNull(request.getSubject()), Objects.requireNonNull(request.getContent()));
        return ResponseEntity.ok(ApiResponse.success("Bản tin đang được gửi đi!", null));
    }

    /**
     * deleteSubscriber: Manually removes an entry from the mailing list.
     */
    @Operation(summary = "Xóa người đăng ký (Admin)")
    @PreAuthorize("hasAuthority('manage:newsletters')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubscriber(@PathVariable @NonNull Long id) {
        newsletterService.deleteSubscriber(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.success("Đã xóa người đăng ký.", null));
    }
}

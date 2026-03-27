package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nhom5.demo.constant.AppConstants;
import nhom5.demo.dto.request.NewsletterRequest;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.service.NewsletterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Newsletter", description = "Đăng ký nhận bản tin")
@RestController
@RequestMapping(AppConstants.NEWSLETTER_PATH)
@RequiredArgsConstructor
public class NewsletterController {

    private final NewsletterService newsletterService;

    @Operation(summary = "Đăng ký nhận bản tin qua email")
    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse<Void>> subscribe(
            @Valid @RequestBody NewsletterRequest request) {
        newsletterService.subscribe(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Đăng ký nhận bản tin thành công!", null));
    }

    @Operation(summary = "Lấy danh sách người đăng ký (Admin)")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @org.springframework.web.bind.annotation.GetMapping("/all")
    public ResponseEntity<ApiResponse<java.util.List<nhom5.demo.entity.NewsletterSubscriber>>> getAllSubscribers() {
        return ResponseEntity.ok(ApiResponse.success(newsletterService.getAllSubscribers()));
    }

    @Operation(summary = "Gửi bản tin cho tất cả người đăng ký (Admin)")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<Void>> sendNewsletter(
            @Valid @RequestBody nhom5.demo.dto.request.SendNewsletterRequest request) {
        newsletterService.sendNewsletterToAll(request.getSubject(), request.getContent());
        return ResponseEntity.ok(ApiResponse.success("Bản tin đang được gửi đi!", null));
    }

    @Operation(summary = "Xóa người đăng ký (Admin)")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubscriber(@org.springframework.web.bind.annotation.PathVariable Long id) {
        newsletterService.deleteSubscriber(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa người đăng ký.", null));
    }
}

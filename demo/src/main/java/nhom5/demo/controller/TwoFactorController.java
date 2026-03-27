package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.entity.User;
import nhom5.demo.repository.UserRepository;
import nhom5.demo.service.TwoFactorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Two Factor Auth", description = "Quản lý xác thực 2 bước (2FA)")
@RestController
@RequestMapping("/api/v1/2fa")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class TwoFactorController {

    private final TwoFactorService twoFactorService;
    private final UserRepository userRepository;
    private final nhom5.demo.service.MailService mailService;

    @Operation(summary = "Tạo mã bí mật 2FA mới cho người dùng hiện tại")
    @PostMapping("/setup")
    public ResponseEntity<ApiResponse<Map<String, String>>> setup(@AuthenticationPrincipal UserDetails userDetails) {
        String secret = twoFactorService.generateSecret();
        String qrUrl = twoFactorService.getQrCodeUrl(secret, userDetails.getUsername());
        String qrCode = twoFactorService.getBase64QrCode(qrUrl);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "secret", secret, 
            "qrUrl", qrUrl,
            "qrCode", qrCode
        )));
    }

    @Operation(summary = "Gửi mã xác thực về Email để bắt đầu kích hoạt 2FA qua Email")
    @PostMapping("/setup-email")
    public ResponseEntity<ApiResponse<String>> setupEmail(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        String code = String.format("%06d", new java.util.Random().nextInt(1000000));
        user.setEmail2faCode(code);
        user.setEmail2faCodeExpiry(java.time.LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);
        
        mailService.send2faEmail(user.getEmail(), code);
        return ResponseEntity.ok(ApiResponse.success("Mã xác nhận đã được gửi về email của bạn", null));
    }

    @Operation(summary = "Xác nhận và kích hoạt 2FA qua Email")
    @PostMapping("/enable-email")
    public ResponseEntity<ApiResponse<Void>> enableEmail(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        String code = body.get("code");
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        
        if (user.getEmail2faCode() != null &&
                user.getEmail2faCode().equals(code) &&
                user.getEmail2faCodeExpiry() != null &&
                user.getEmail2faCodeExpiry().isAfter(java.time.LocalDateTime.now())) {
            
            user.setTwoFactorMethod("EMAIL");
            user.setIsTwoFactorEnabled(true);
            user.setEmail2faCode(null);
            user.setEmail2faCodeExpiry(null);
            userRepository.save(user);
            return ResponseEntity.ok(ApiResponse.success("Đã kích hoạt bảo vệ qua Email thành công", null));
        }
        return ResponseEntity.status(400).body(ApiResponse.error(400, "Mã xác thực không hợp lệ hoặc đã hết hạn"));
    }

    @Operation(summary = "Thay đổi phương thức 2FA")
    @PatchMapping("/method")
    public ResponseEntity<ApiResponse<Void>> changeMethod(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        String method = body.get("method"); // "TOTP" or "EMAIL"
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        user.setTwoFactorMethod(method);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Đã thay đổi sang phương thức " + method, null));
    }

    @Operation(summary = "Xác nhận và kích hoạt 2FA")
    @PostMapping("/enable")
    public ResponseEntity<ApiResponse<Void>> enable(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        String secret = body.get("secret");
        String code = body.get("code");
        
        if (twoFactorService.verifyCode(secret, code)) {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
            user.setTwoFactorSecret(secret);
            user.setIsTwoFactorEnabled(true);
            userRepository.save(user);
            return ResponseEntity.ok(ApiResponse.success("Đã kích hoạt 2FA thành công", null));
        }
        return ResponseEntity.status(400).body(ApiResponse.error(400, "Mã xác thực không hợp lệ"));
    }

    @Operation(summary = "Tắt 2FA")
    @PostMapping("/disable")
    public ResponseEntity<ApiResponse<Void>> disable(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        String code = body.get("code");
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        
        boolean verified = false;
        if ("EMAIL".equals(user.getTwoFactorMethod())) {
            if (user.getEmail2faCode() != null && user.getEmail2faCode().equals(code) && 
                user.getEmail2faCodeExpiry() != null && user.getEmail2faCodeExpiry().isAfter(java.time.LocalDateTime.now())) {
                verified = true;
            }
        } else {
            verified = twoFactorService.verifyCode(user.getTwoFactorSecret(), code);
        }

        if (verified) {
            user.setIsTwoFactorEnabled(false);
            user.setTwoFactorSecret(null);
            user.setEmail2faCode(null);
            user.setEmail2faCodeExpiry(null);
            userRepository.save(user);
            return ResponseEntity.ok(ApiResponse.success("Đã tắt 2FA thành công", null));
        }
        return ResponseEntity.status(400).body(ApiResponse.error(400, "Mã xác thực không hợp lệ"));
    }
}

package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.request.TwoFactorRequest;
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
        
        if (twoFactorService.verifyCode(user.getTwoFactorSecret(), code)) {
            user.setIsTwoFactorEnabled(false);
            user.setTwoFactorSecret(null);
            userRepository.save(user);
            return ResponseEntity.ok(ApiResponse.success("Đã tắt 2FA thành công", null));
        }
        return ResponseEntity.status(400).body(ApiResponse.error(400, "Mã xác thực không hợp lệ"));
    }
}

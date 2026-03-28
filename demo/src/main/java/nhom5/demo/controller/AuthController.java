package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nhom5.demo.constant.AppConstants;
import nhom5.demo.dto.request.ForgotPasswordRequest;
import nhom5.demo.dto.request.LoginRequest;
import nhom5.demo.dto.request.RegisterRequest;
import nhom5.demo.dto.request.ResetPasswordRequest;
import nhom5.demo.dto.request.SocialLoginRequest;
import nhom5.demo.dto.request.TwoFactorRequest;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.dto.response.AuthResponse;
import nhom5.demo.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Authentication", description = "Đăng ký, đăng nhập, quên mật khẩu")
@RestController
@RequestMapping(AppConstants.AUTH_PATH)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse auth = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(auth));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse auth = authService.register(request);
        return ResponseEntity.status(201).body(ApiResponse.created(auth));
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<ApiResponse<AuthResponse>> verify2fa(
            @Valid @RequestBody TwoFactorRequest request) {
        AuthResponse auth = authService.verifyTwoFactor(request);
        return ResponseEntity.ok(ApiResponse.success(auth));
    }

    @PostMapping("/social-login")
    public ResponseEntity<ApiResponse<AuthResponse>> socialLogin(
            @Valid @RequestBody SocialLoginRequest request) {
        AuthResponse auth = authService.socialLogin(request);
        return ResponseEntity.ok(ApiResponse.success(auth));
    }

    @Operation(summary = "Yêu cầu đặt lại mật khẩu")
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Vui lòng kiểm tra email để đặt lại mật khẩu", null));
    }

    @Operation(summary = "Đặt lại mật khẩu với token")
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Mật khẩu đã được đặt lại thành công", null));
    }
}

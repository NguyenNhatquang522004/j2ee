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

import java.util.Objects;

/**
 * REST CONTROLLER: AuthController
 * ---------------------------------------------------------
 * The central gateway for identity management.
 * Handles user onboarding (Registration), Login, Password Recovery, and 2FA Verification.
 */
@Tag(name = "Authentication", description = "Đăng ký, đăng nhập, quên mật khẩu")
@RestController
@RequestMapping(AppConstants.AUTH_PATH)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * login: Standard credential-based authentication.
     * Returns a JWT on success unless 2FA is triggered.
     */
    @Operation(summary = "Đăng nhập hệ thống")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse auth = authService.login(Objects.requireNonNull(request));
        return ResponseEntity.ok(ApiResponse.success(auth));
    }

    /**
     * register: New user account creation.
     * Automatically assigns default permissions and initializes a personal cart.
     */
    @Operation(summary = "Đăng ký tài khoản mới")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse auth = authService.register(Objects.requireNonNull(request));
        return ResponseEntity.status(201).body(ApiResponse.created(auth));
    }

    /**
     * verify2fa: Secondary verification using TOTP (Google Authenticator, etc.).
     * Triggered if the user has 2FA enabled.
     */
    @Operation(summary = "Xác nhận mã 2FA")
    @PostMapping("/verify-2fa")
    public ResponseEntity<ApiResponse<AuthResponse>> verify2fa(
            @Valid @RequestBody TwoFactorRequest request) {
        AuthResponse auth = authService.verifyTwoFactor(Objects.requireNonNull(request));
        return ResponseEntity.ok(ApiResponse.success(auth));
    }

    /**
     * socialLogin: OAuth-based login for speed and convenience (Google/Facebook, etc.).
     */
    @Operation(summary = "Đăng nhập qua mạng xã hội")
    @PostMapping("/social-login")
    public ResponseEntity<ApiResponse<AuthResponse>> socialLogin(
            @Valid @RequestBody SocialLoginRequest request) {
        AuthResponse auth = authService.socialLogin(Objects.requireNonNull(request));
        return ResponseEntity.ok(ApiResponse.success(auth));
    }

    /**
     * forgotPassword: Triggers the recovery workflow by sending a secure token via email.
     */
    @Operation(summary = "Yêu cầu đặt lại mật khẩu")
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(Objects.requireNonNull(request));
        return ResponseEntity.ok(ApiResponse.success("Vui lòng kiểm tra email để đặt lại mật khẩu", null));
    }

    /**
     * resetPassword: Finalizes the recovery by verifying the token and applying the new password.
     */
    @Operation(summary = "Đặt lại mật khẩu với token")
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(Objects.requireNonNull(request));
        return ResponseEntity.ok(ApiResponse.success("Mật khẩu đã được đặt lại thành công", null));
    }
}

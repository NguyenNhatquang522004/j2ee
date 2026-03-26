package nhom5.demo.service;

import nhom5.demo.dto.request.ForgotPasswordRequest;
import nhom5.demo.dto.request.LoginRequest;
import nhom5.demo.dto.request.RegisterRequest;
import nhom5.demo.dto.request.ResetPasswordRequest;
import nhom5.demo.dto.request.SocialLoginRequest;
import nhom5.demo.dto.request.TwoFactorRequest;
import nhom5.demo.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse socialLogin(SocialLoginRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    AuthResponse verifyTwoFactor(TwoFactorRequest request);
}

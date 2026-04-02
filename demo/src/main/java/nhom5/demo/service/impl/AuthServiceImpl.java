package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.request.ForgotPasswordRequest;
import nhom5.demo.dto.request.LoginRequest;
import nhom5.demo.dto.request.RegisterRequest;
import nhom5.demo.dto.request.ResetPasswordRequest;
import nhom5.demo.dto.request.SocialLoginRequest;
import nhom5.demo.dto.request.TwoFactorRequest;
import nhom5.demo.dto.response.AuthResponse;
import nhom5.demo.entity.Cart;
import nhom5.demo.entity.User;
import nhom5.demo.enums.RoleEnum;
import nhom5.demo.exception.BusinessException;
import nhom5.demo.repository.CartRepository;
import nhom5.demo.repository.UserRepository;
import nhom5.demo.security.JwtTokenProvider;
import nhom5.demo.service.AuthService;
import nhom5.demo.service.MailService;
import nhom5.demo.service.NotificationService;
import nhom5.demo.service.SettingService;
import nhom5.demo.service.TwoFactorService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final MailService mailService;
    private final TwoFactorService twoFactorService;
    private final SettingService settingService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Normalize Data
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhone().replaceAll("[^0-9+]", "");
        if (phone.startsWith("+84")) {
            phone = "0" + phone.substring(3);
        } else if (phone.startsWith("84")) {
            phone = "0" + phone.substring(2);
        }

        if (userRepository.existsByUsername(username)) {
            throw new BusinessException("Tên đăng nhập '" + username + "' đã tồn tại");
        }
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException("Email '" + email + "' đã được sử dụng");
        }
        if (userRepository.existsByPhone(phone)) {
            throw new BusinessException("Số điện thoại '" + phone + "' đã được sử dụng");
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phone(phone)
                .role(RoleEnum.ROLE_USER)
                .isActive(true)
                .provider("LOCAL")
                .build();

        userRepository.save(Objects.requireNonNull(user));

        // Create cart for new user
        Cart cart = Cart.builder().user(user).build();
        cartRepository.save(Objects.requireNonNull(cart));

        String token = jwtTokenProvider.generateTokenFromUsername(Objects.requireNonNull(user.getUsername()), user.getTokenVersion());
        
        // Thông báo tạo tài khoản
        notificationService.createNotification(user, "Chào mừng bạn đến với FreshFood! Tài khoản của bạn đã sẵn sàng.", "SUCCESS", "/profile");
        mailService.sendWelcomeEmail(user.getEmail(), user.getFullName());
        
        return buildAuthResponse(user, token);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("Người dùng không tồn tại"));

        if (!user.getIsActive()) {
            throw new BusinessException("Tài khoản của bạn đã bị khoá bởi Quản trị viên");
        }

        if (user.getLockoutUntil() != null && user.getLockoutUntil().isAfter(LocalDateTime.now())) {
            throw new BusinessException("Tài khoản bị tạm khoá do nhập sai quá nhiều. Hãy thử lại sau " + 
                java.time.Duration.between(LocalDateTime.now(), user.getLockoutUntil()).toMinutes() + " phút.");
        }

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
            
            // Success: Reset failed attempts
            user.setFailedLoginAttempts(0);
            user.setLockoutUntil(null);
            userRepository.save(user);

        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            // Tăng đếm lỗi đăng nhập. Nếu >= 5 lần, khóa tài khoản trong 30 phút.
            int attempts = (user.getFailedLoginAttempts() != null ? user.getFailedLoginAttempts() : 0) + 1;
            user.setFailedLoginAttempts(attempts);
            
            if (attempts >= 5) {
                user.setLockoutUntil(LocalDateTime.now().plusMinutes(30)); 
                userRepository.save(user);
                throw new BusinessException("Tài khoản đã bị khoá 30 phút do nhập sai mật khẩu 5 lần.");
            }
            
            userRepository.save(user);
            throw new BusinessException("Mật khẩu không chính xác. Bạn còn " + (5 - attempts) + " lần thử.");
        }

        // Check 2FA
        boolean enfored2FA = "true".equalsIgnoreCase(settingService.getSettingValue("2FA_ENFORCED", "false"));
        
        if (Boolean.TRUE.equals(user.getIsTwoFactorEnabled())) {
            if ("EMAIL".equals(user.getTwoFactorMethod())) {
                String code = String.format("%06d", new java.security.SecureRandom().nextInt(1000000));
                user.setEmail2faCode(code);
                user.setEmail2faCodeExpiry(LocalDateTime.now().plusMinutes(5));
                userRepository.save(user);
                mailService.send2faEmail(user.getEmail(), code);
            }
            return AuthResponse.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole())
                    .requiresTwoFactor(true)
                    .isTwoFactorEnabled(true)
                    .isTwoFactorEnforced(enfored2FA)
                    .twoFactorMethod(user.getTwoFactorMethod())
                    .build();
        }

        // We allow the login for admins even if 2FA_ENFORCED is true, but they haven't set it up.
        // This is to avoid locking them out of the setup profile page.
        // We will warn them in the UI instead.

        String token = jwtTokenProvider.generateTokenFromUsername(Objects.requireNonNull(user.getUsername()), user.getTokenVersion());
        
        // Notify login
        notificationService.createNotification(user, "Đăng nhập thành công", "LOGIN", null);
        
        return buildAuthResponse(user, token);
    }

    @Override
    public AuthResponse verifyTwoFactor(TwoFactorRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("Người dùng không tồn tại"));

        if (!user.getIsActive()) {
            throw new BusinessException("Tài khoản của bạn đã bị khoá");
        }

        boolean verified = false;
        if ("EMAIL".equals(user.getTwoFactorMethod())) {
            if (user.getEmail2faCode() != null &&
                    user.getEmail2faCode().equals(request.getCode()) &&
                    user.getEmail2faCodeExpiry() != null &&
                    user.getEmail2faCodeExpiry().isAfter(LocalDateTime.now())) {
                verified = true;
                // Clear code after use
                user.setEmail2faCode(null);
                user.setEmail2faCodeExpiry(null);
                userRepository.save(user);
            }
        } else {
            // Default to TOTP
            verified = twoFactorService.verifyCode(user.getTwoFactorSecret(), request.getCode());
        }

        if (verified) {
            String token = jwtTokenProvider.generateTokenFromUsername(Objects.requireNonNull(user.getUsername()), user.getTokenVersion());
            return buildAuthResponse(user, token);
        } else {
            throw new BusinessException("Mã xác thực không hợp lệ hoặc đã hết hạn");
        }
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null); // Silent fail to prevent email enumeration

        if (user == null) return;

        String token = java.util.UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        mailService.sendResetPasswordEmail(Objects.requireNonNull(user.getEmail()), token);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BusinessException("Mã xác nhận không hợp lệ hoặc đã hết hạn"));

        if (Objects.requireNonNull(user.getResetTokenExpiry()).isBefore(LocalDateTime.now())) {
            throw new BusinessException("Mã xác nhận đã hết hạn");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        // Tăng token version để thu hồi (invalidate) toàn bộ JWT đã cấp trước đó.
        user.setTokenVersion(user.getTokenVersion() + 1); 
        userRepository.save(user);

        // Gửi cảnh báo bảo mật: Thay đổi mật khẩu thành công
        mailService.sendSecurityAlert(user.getEmail(), user.getFullName(), "Khôi phục mật khẩu thành công");
    }

    @Override
    @Transactional
    public AuthResponse socialLogin(SocialLoginRequest request) {
        User user = userRepository.findByProviderAndProviderId(request.getProvider(), request.getProviderId())
                .orElseGet(() -> {
                    // Try to find by email
                    User existingByEmail = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                            .orElse(null);

                    if (existingByEmail != null) {
                        // Link social account to existing user
                        existingByEmail.setProvider(request.getProvider());
                        existingByEmail.setProviderId(request.getProviderId());
                        if (existingByEmail.getFullName() == null || existingByEmail.getFullName().isBlank()) {
                            existingByEmail.setFullName(request.getFullName().trim());
                        }
                        return userRepository.save(existingByEmail);
                    }

                    // Create new user
                    String email = request.getEmail().toLowerCase().trim();
                    String username = email.split("@")[0] + "_" + request.getProviderId().substring(0, 4);
                    User newUser = User.builder()
                            .username(username)
                            .email(email)
                            .fullName(request.getFullName().trim())
                            .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                            .role(RoleEnum.ROLE_USER)
                            .isActive(true)
                            .provider(request.getProvider())
                            .providerId(request.getProviderId())
                            .build();

                    User savedUser = userRepository.save(Objects.requireNonNull(newUser));
                    // Create cart
                    cartRepository.save(Objects.requireNonNull(Cart.builder().user(savedUser).build()));
                    return savedUser;
                });

        if (!user.getIsActive()) {
            throw new BusinessException("Tài khoản của bạn đã bị khoá");
        }

        String token = jwtTokenProvider.generateTokenFromUsername(Objects.requireNonNull(user.getUsername()), user.getTokenVersion());
        
        // Thông báo đăng nhập mạng xã hội
        notificationService.createNotification(user, "Bạn đã đăng nhập thành công qua " + request.getProvider(), "LOGIN", null);
        
        return buildAuthResponse(user, token);
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        LocalDateTime expiresAt = LocalDateTime.now()
                .plusSeconds(jwtTokenProvider.getExpirationMs() / 1000);

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .expiresAt(expiresAt)
                .requiresTwoFactor(false)
                .isTwoFactorEnabled(user.getIsTwoFactorEnabled())
                .isTwoFactorEnforced("true".equalsIgnoreCase(settingService.getSettingValue("2FA_ENFORCED", "false")))
                .twoFactorMethod(user.getTwoFactorMethod())
                .build();
    }
}

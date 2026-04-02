package nhom5.demo.dto.response;

import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import nhom5.demo.enums.RoleEnum;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String tokenType;
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private RoleEnum role;
    private LocalDateTime expiresAt;
    private boolean requiresTwoFactor;
    private boolean isTwoFactorEnabled;
    private boolean isTwoFactorEnforced;
    private String twoFactorMethod; // "TOTP", "EMAIL"
}

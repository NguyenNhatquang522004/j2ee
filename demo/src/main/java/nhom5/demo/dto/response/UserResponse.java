package nhom5.demo.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import nhom5.demo.enums.RoleEnum;
import java.util.Set;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private String gender;
    private String membershipTier;
    private String avatarUrl;
    private Long lifetimePoints;
    private Long availablePoints;
    private Boolean emailNotifications;
    private Boolean promoNotifications;
    private RoleEnum role;
    private Boolean isActive;
    private Boolean isTwoFactorEnabled;
    private Set<String> permissions;
    private LocalDateTime createdAt;
}

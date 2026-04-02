package nhom5.demo.dto.response;

import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import nhom5.demo.enums.RoleEnum;
import java.util.Set;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String membershipTier;
    private String avatarUrl;
    private Long lifetimePoints;
    private Long availablePoints;
    private Boolean emailNotifications;
    private Boolean promoNotifications;
    private RoleEnum role;
    @JsonProperty("isActive")
    private Boolean isActive;
    @JsonProperty("isTwoFactorEnabled")
    private Boolean isTwoFactorEnabled;
    private Set<String> permissions;
    private Set<String> customPermissions;
    private Set<String> inheritedPermissions;
    private LocalDateTime createdAt;
}

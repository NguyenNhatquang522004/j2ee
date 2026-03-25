package nhom5.demo.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import nhom5.demo.enums.RoleEnum;

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
    private RoleEnum role;
    private Boolean isActive;
    private LocalDateTime createdAt;
}

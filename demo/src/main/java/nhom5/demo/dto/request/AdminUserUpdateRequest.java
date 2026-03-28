package nhom5.demo.dto.request;

import lombok.Getter;
import lombok.Setter;
import nhom5.demo.enums.RoleEnum;
import java.util.Set;

@Getter
@Setter
public class AdminUserUpdateRequest {
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private RoleEnum role;
    private Boolean isActive;
    private Set<String> customPermissions;
}

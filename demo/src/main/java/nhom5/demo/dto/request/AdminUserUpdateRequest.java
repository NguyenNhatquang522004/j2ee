package nhom5.demo.dto.request;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import nhom5.demo.enums.RoleEnum;
import nhom5.demo.constant.RegexConstants;
import java.util.Set;

@Getter
@Setter
public class AdminUserUpdateRequest {
    @NotBlank(message = "Họ tên không được để trống")
    @Size(min = 2, max = 50, message = "Họ tên phải từ 2-50 ký tự")
    @Pattern(regexp = RegexConstants.FULL_NAME, message = "Họ tên chỉ được chứa chữ cái và khoảng trắng")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
        regexp = RegexConstants.VIETNAM_PHONE,
        message = "Số điện thoại Việt Nam không hợp lệ (phải đúng 10 số, bắt đầu bằng 03, 05, 07, 08, 09)"
    )
    private String phone;
    private RoleEnum role;
    private Boolean isActive;
    private Set<String> customPermissions;
}

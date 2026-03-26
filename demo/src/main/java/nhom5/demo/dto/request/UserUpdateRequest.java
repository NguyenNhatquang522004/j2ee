package nhom5.demo.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    private String fullName;
    private String phone;
    
    /** Mật khẩu mới (nếu muốn đổi) */
    private String password;
    
    private java.time.LocalDate dateOfBirth;
    private String gender;
    private Boolean emailNotifications;
    private Boolean promoNotifications;
}

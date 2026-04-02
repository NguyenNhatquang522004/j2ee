package nhom5.demo.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import nhom5.demo.constant.RegexConstants;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3-50 ký tự")
    private String username;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, max = 100, message = "Mật khẩu phải từ 8-100 ký tự")
    @Pattern(regexp = RegexConstants.PASSWORD, message = "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt")
    private String password;

    @NotBlank(message = "Họ tên không được để trống")
    @Size(min = 2, max = 50, message = "Họ tên phải từ 2-50 ký tự")
    @Pattern(regexp = RegexConstants.FULL_NAME, message = "Họ tên chỉ được chứa chữ cái và khoảng trắng")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
        regexp = RegexConstants.VIETNAM_PHONE,
        message = "Số điện thoại Việt Nam không hợp lệ (phải đúng 10 số, bắt đầu bằng 03, 05, 07, 08, 09)"
    )
    private String phone;
}

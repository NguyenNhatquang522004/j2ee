package nhom5.demo.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SocialLoginRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Provider không được để trống")
    private String provider; // "GOOGLE", "GITHUB"

    @NotBlank(message = "Provider ID không được để trống")
    private String providerId;

    private String fullName;
}

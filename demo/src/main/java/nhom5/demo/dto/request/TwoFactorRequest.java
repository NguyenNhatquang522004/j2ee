package nhom5.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TwoFactorRequest {
    @NotBlank
    private String username; // Or email to find user
    @NotBlank
    private String code;
}

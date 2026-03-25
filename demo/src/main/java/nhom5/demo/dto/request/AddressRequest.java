package nhom5.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressRequest {
    @NotBlank(message = "Nhãn địa chỉ không được để trống")
    private String label;
    
    private String fullName;
    private String phone;

    @NotBlank(message = "Chi tiết địa chỉ không được để trống")
    private String details;
    
    private Boolean isDefault;
}

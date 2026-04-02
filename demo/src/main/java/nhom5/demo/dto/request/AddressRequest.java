package nhom5.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressRequest {
    @NotBlank(message = "Nhãn địa chỉ không được để trống")
    private String label;
    
    @NotBlank(message = "Họ tên người nhận không được để trống")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @jakarta.validation.constraints.Pattern(
        regexp = nhom5.demo.constant.RegexConstants.VIETNAM_PHONE,
        message = "Số điện thoại Việt Nam không hợp lệ"
    )
    private String phone;

    @NotBlank(message = "Số nhà, tên đường không được để trống")
    private String addressDetail;

    @NotBlank(message = "Phường/Xã không được để trống")
    private String ward;

    @NotBlank(message = "Quận/Huyện không được để trống")
    private String district;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    private String province;

    private String details; // Unified address string if provided
    
    private Boolean isDefault;
}

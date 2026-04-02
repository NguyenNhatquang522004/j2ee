package nhom5.demo.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import nhom5.demo.enums.CertificationEnum;

import java.time.LocalDate;

@Getter
@Setter
public class FarmRequest {

    @NotBlank(message = "Tên trang trại không được để trống")
    private String name;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    private String province;

    private String description;

    @NotBlank(message = "Tên chủ trang trại không được để trống")
    private String ownerName;

    @NotBlank(message = "Số điện thoại liên hệ không được để trống")
    @jakarta.validation.constraints.Pattern(
        regexp = nhom5.demo.constant.RegexConstants.VIETNAM_PHONE,
        message = "Số điện thoại Việt Nam không hợp lệ"
    )
    private String contactPhone;

    @NotBlank(message = "Email liên hệ không được để trống")
    @Email(message = "Email không hợp lệ")
    private String contactEmail;

    @NotNull(message = "Chứng nhận không được để trống")
    private CertificationEnum certification;

    private String certificationCode;
    private LocalDate certificationExpiryDate;
    private String imageUrl;
    private Double latitude;
    private Double longitude;
    private Boolean isActive = true;
}

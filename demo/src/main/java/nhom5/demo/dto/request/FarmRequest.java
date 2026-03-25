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

    private String address;
    private String province;
    private String description;
    private String ownerName;
    private String contactPhone;

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

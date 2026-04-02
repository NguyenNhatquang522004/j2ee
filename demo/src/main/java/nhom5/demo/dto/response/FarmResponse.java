package nhom5.demo.dto.response;

import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import nhom5.demo.enums.CertificationEnum;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FarmResponse {
    private Long id;
    private String name;
    private String address;
    private String province;
    private String description;
    private String ownerName;
    private String contactPhone;
    private String contactEmail;
    private CertificationEnum certification;
    private String certificationDescription;
    private String certificationCode;
    private LocalDate certificationExpiryDate;
    private String imageUrl;
    private Double latitude;
    private Double longitude;
    private Boolean isActive;
    private int productCount;
    private LocalDateTime createdAt;
}

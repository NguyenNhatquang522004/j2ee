package nhom5.demo.dto.response;

import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Getter;

import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {
    private Long id;
    private String label;
    private String fullName;
    private String phone;
    private String addressDetail;
    private String ward;
    private String district;
    private String province;
    private String details;
    @JsonProperty("isDefault")
    private Boolean isDefault;
}

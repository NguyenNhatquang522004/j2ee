package nhom5.demo.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AddressResponse {
    private Long id;
    private String label;
    private String fullName;
    private String phone;
    private String details;
    private Boolean isDefault;
}

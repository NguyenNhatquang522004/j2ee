package nhom5.demo.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import nhom5.demo.entity.Coupon;

@Data
public class GiftCouponRequest {
    @NotBlank
    @Email
    private String email;
    
    private Coupon coupon;
}

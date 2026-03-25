package nhom5.demo.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import nhom5.demo.enums.PaymentMethodEnum;

import java.util.List;

@Getter
@Setter
public class OrderRequest {

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    private String shippingAddress;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phone;

    private String note;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethodEnum paymentMethod;

    /** Mã coupon (nếu có) */
    private String couponCode;

    /** Danh sách sản phẩm đặt hàng */
    @NotEmpty(message = "Đơn hàng phải có ít nhất một sản phẩm")
    private List<OrderItemRequest> items;

    @Getter
    @Setter
    public static class OrderItemRequest {
        @NotNull
        private Long productId;
        @NotNull
        @Min(value = 1, message = "Số lượng phải lớn hơn 0")
        private Integer quantity;
    }
}

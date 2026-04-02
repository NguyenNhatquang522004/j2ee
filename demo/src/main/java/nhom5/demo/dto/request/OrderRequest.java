package nhom5.demo.dto.request;

import jakarta.validation.Valid;
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

    @NotBlank(message = "Số nhà, tên đường không được để trống")
    private String addressDetail;

    @NotBlank(message = "Phường/Xã không được để trống")
    private String ward;

    @NotBlank(message = "Quận/Huyện không được để trống")
    private String district;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    private String province;

    @NotBlank(message = "Họ tên người nhận không được để trống")
    private String receiverName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @jakarta.validation.constraints.Pattern(
        regexp = nhom5.demo.constant.RegexConstants.VIETNAM_PHONE,
        message = "Số điện thoại Việt Nam không hợp lệ"
    )
    private String phone;

    private String note;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethodEnum paymentMethod;

    /** Mã coupon (nếu có) */
    private String couponCode;

    /** Danh sách sản phẩm đặt hàng */
    @Valid
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

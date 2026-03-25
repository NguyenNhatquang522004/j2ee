package nhom5.demo.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class BatchRequest {

    @NotBlank(message = "Mã lô hàng không được để trống")
    private String batchCode;

    @NotNull(message = "Ngày nhập kho không được để trống")
    private LocalDate importDate;

    private LocalDate productionDate;

    @NotNull(message = "Hạn sử dụng không được để trống")
    private LocalDate expiryDate;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;

    @NotNull(message = "Sản phẩm không được để trống")
    private Long productId;

    private String note;
}

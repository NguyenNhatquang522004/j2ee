package nhom5.demo.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewRequest {

    @NotNull(message = "Sản phẩm không được để trống")
    private Long productId;

    @NotNull(message = "Đánh giá không được để trống")
    @Min(value = 1, message = "Đánh giá tối thiểu là 1 sao")
    @Max(value = 5, message = "Đánh giá tối đa là 5 sao")
    private Integer rating;

    @Size(max = 1000, message = "Bình luận tối đa 1000 ký tự")
    private String comment;

    private java.util.List<Long> removeMediaIds;
}

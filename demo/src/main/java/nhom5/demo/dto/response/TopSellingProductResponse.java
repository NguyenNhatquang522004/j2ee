package nhom5.demo.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class TopSellingProductResponse {
    private Long productId;
    private String productName;
    private String imageUrl;
    private Long soldQuantity;
    private BigDecimal revenue;
}

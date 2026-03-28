package nhom5.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSaleItemResponse {
    private Long id;
    private ProductResponse product;
    private BigDecimal flashSalePrice;
    private int quantityLimit;
    private int soldQuantity;
    private int remainingQuantity;
}

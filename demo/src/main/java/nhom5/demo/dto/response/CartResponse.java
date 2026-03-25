package nhom5.demo.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
public class CartResponse {
    private Long cartId;
    private Long userId;
    private String username;
    private List<CartItemResponse> items;
    private BigDecimal totalAmount;
    private int totalItems;

    @Getter
    @Setter
    @Builder
    public static class CartItemResponse {
        private Long cartItemId;
        private Long productId;
        private String productName;
        private String productImageUrl;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal subtotal;
        private int availableStock;
    }
}

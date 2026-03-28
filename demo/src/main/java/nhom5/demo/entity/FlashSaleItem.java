package nhom5.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "flash_sale_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSaleItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flash_sale_id", nullable = false)
    private FlashSale flashSale;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal flashSalePrice;

    @Column(nullable = false)
    private int quantityLimit; // Total quantity available for flash sale

    @Builder.Default
    @Column(nullable = false)
    private int soldQuantity = 0; // Currently sold during flash sale

    public int getRemainingQuantity() {
        return quantityLimit - soldQuantity;
    }
}

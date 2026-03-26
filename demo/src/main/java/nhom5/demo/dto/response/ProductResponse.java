package nhom5.demo.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String unit;
    private String imageUrl;
    private Boolean isActive;
    private Boolean isNew;
    private BigDecimal originalPrice;
    private int totalStock;

    // Category info
    private Long categoryId;
    private String categoryName;

    // Farm & traceability info
    private Long farmId;
    private String farmName;
    private String farmAddress;
    private String farmProvince;
    private String certification;
    private String certificationDescription;

    // Rating info
    private Double averageRating;
    private long reviewCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

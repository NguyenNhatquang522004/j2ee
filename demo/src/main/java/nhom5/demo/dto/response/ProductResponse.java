package nhom5.demo.dto.response;

import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private String unit;
    private String imageUrl;
    @JsonProperty("isActive")
    private Boolean isActive;
    @JsonProperty("isNew")
    private Boolean isNew;
    private BigDecimal originalPrice;
    private BigDecimal flashSalePrice;
    private LocalDateTime flashSaleEndDate;
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

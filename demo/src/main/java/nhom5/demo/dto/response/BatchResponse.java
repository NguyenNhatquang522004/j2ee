package nhom5.demo.dto.response;

import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import nhom5.demo.enums.BatchStatusEnum;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchResponse {
    private Long id;
    private String batchCode;
    private LocalDate importDate;
    private LocalDate productionDate;
    private LocalDate expiryDate;
    private Integer quantity;
    private Integer remainingQuantity;
    private BatchStatusEnum status;
    private String statusDisplayName;
    private String note;
    private Long productId;
    private String productName;
    private int daysUntilExpiry;
    private LocalDateTime createdAt;
}

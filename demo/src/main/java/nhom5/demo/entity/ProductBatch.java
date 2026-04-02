package nhom5.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import nhom5.demo.enums.BatchStatusEnum;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity quản lý lô hàng (Batch Management) - CỐT LÕI của hệ thống.
 *
 * Mỗi lô hàng liên kết với một sản phẩm và có:
 * - Ngày sản xuất, ngày nhập kho, ngày hết hạn riêng.
 * - Số lượng ban đầu và số lượng còn lại.
 * - Trạng thái tự động cập nhật bởi
 * {@link nhom5.demo.scheduler.BatchExpiryScheduler}.
 *
 * Logic xuất kho: FEFO (First-Expired-First-Out) - lô gần hết hạn xuất trước.
 */
@Entity
@Table(name = "product_batches", indexes = {
        @Index(name = "idx_batch_product", columnList = "product_id"),
        @Index(name = "idx_batch_expiry", columnList = "expiry_date"),
        @Index(name = "idx_batch_status", columnList = "status"),
        @Index(name = "idx_batch_code", columnList = "batch_code"),
        @Index(name = "idx_batch_deleted_at", columnList = "deleted_at")
}, uniqueConstraints = {
        @UniqueConstraint(columnNames = {"batch_code"})
})
@org.hibernate.annotations.Check(constraints = "remaining_quantity <= quantity")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE product_batches SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class ProductBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "batch_code", nullable = false, unique = true, length = 50)
    private String batchCode;

    @NotNull
    @Column(name = "import_date", nullable = false)
    private LocalDate importDate;

    @Column(name = "production_date")
    private LocalDate productionDate;

    @NotNull
    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @NotNull
    @Min(0)
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @NotNull
    @Min(0)
    @Column(name = "remaining_quantity", nullable = false)
    private Integer remainingQuantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private BatchStatusEnum status = BatchStatusEnum.ACTIVE;

    @Column(name = "note", length = 500)
    private String note;

    @Version
    @Column(name = "version")
    private Long version;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // ====== Relationships ======

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @PrePersist
    @PreUpdate
    public void validateStock() {
        if (remainingQuantity != null && quantity != null && remainingQuantity > quantity) {
            remainingQuantity = quantity;
        }
    }
}

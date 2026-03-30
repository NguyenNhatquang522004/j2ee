package nhom5.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity lưu vết lịch sử tích lũy và sử dụng điểm của người dùng.
 */
@Entity
@Table(name = "point_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "points", nullable = false)
    private Long points;

    @Column(name = "type", length = 20, nullable = false)
    private String type; // "EARN" (Tích lũy), "SPEND" (Sử dụng), "REFUND" (Hoàn trả)

    @Column(name = "source", length = 50)
    private String source; // "ORDER", "PROMOTION", "SYSTEM"

    @Column(name = "source_id")
    private String sourceId; // ID của đơn hàng hoặc mã khuyến mãi

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "balance_after")
    private Long balanceAfter; // Số dư điểm khả dụng sau giao dịch

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

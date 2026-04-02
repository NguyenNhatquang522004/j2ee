package nhom5.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_audit_logs", indexes = {
        @Index(name = "idx_audit_deleted_at", columnList = "deleted_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE admin_audit_logs SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class AdminAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_username", nullable = false)
    private String adminUsername;

    @Column(name = "action", nullable = false)
    private String action; // CRUD, Order Status Change, etc.

    @Column(name = "resource_type", nullable = false)
    private String resourceType; // Product, Order, Batch, Review

    @Column(name = "resource_id")
    private String resourceId;

    @Column(name = "details", length = 1000)
    private String details;

    @Column(name = "ip_address")
    private String ipAddress;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}

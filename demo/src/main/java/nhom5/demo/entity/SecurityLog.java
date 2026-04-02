package nhom5.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity ghi nhận các sự kiện bảo mật (Security Audit).
 */
@Entity
@Table(name = "security_logs", indexes = {
    @Index(name = "idx_security_event", columnList = "event_type"),
    @Index(name = "idx_security_ip", columnList = "ip_address"),
    @Index(name = "idx_security_created", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType; // e.g., 'LOGIN_FAILED', 'UNAUTHORIZED_ACCESS', 'IP_BLOCKED'

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Column(name = "username", length = 255)
    private String username;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "severity", nullable = false, length = 20)
    private String severity; // e.g., 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

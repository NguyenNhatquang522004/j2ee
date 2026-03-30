package nhom5.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ip_blocklist", indexes = {
        @Index(name = "idx_blocked_ip", columnList = "ip_address"),
        @Index(name = "idx_blocked_until", columnList = "blocked_until")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IpBlocklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ip_address", nullable = false, unique = true, length = 45)
    private String ipAddress;

    @Column(name = "reason")
    private String reason;

    @Column(name = "is_permanent")
    @Builder.Default
    private Boolean isPermanent = false;

    @Column(name = "blocked_until")
    private LocalDateTime blockedUntil;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

package nhom5.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity thông báo cho người dùng.
 */
@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_noti_user", columnList = "user_id"),
        @Index(name = "idx_noti_created", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "message", nullable = false, length = 500)
    private String message;

    @Column(name = "type", length = 50)
    private String type; // LOGIN, INFO, SUCCESS, WARNING, COUPON

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "link", length = 255)
    private String link; // Đường dẫn khi nhấn vào thông báo

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

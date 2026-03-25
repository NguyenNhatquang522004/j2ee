package nhom5.demo.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity lưu địa chỉ của người dùng.
 * Một người dùng có thể có nhiều địa chỉ (Nhà, Công ty, v.v.).
 */
@Entity
@Table(name = "addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "label", nullable = false, length = 50)
    private String label; // VD: "Nhà", "Công ty"

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "details", nullable = false, length = 255)
    private String details;

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}

package nhom5.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import nhom5.demo.enums.CertificationEnum;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity trang trại / nhà cung cấp thực phẩm sạch.
 * Phục vụ chức năng Truy xuất nguồn gốc sản phẩm.
 */
@Entity
@Table(name = "farms", indexes = {
        @Index(name = "idx_farm_name", columnList = "name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "province", length = 100)
    private String province;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "owner_name", length = 100)
    private String ownerName;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Email
    @Column(name = "contact_email", length = 100)
    private String contactEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "certification", nullable = false)
    @Builder.Default
    private CertificationEnum certification = CertificationEnum.NONE;

    @Column(name = "certification_code", length = 100)
    private String certificationCode;

    @Column(name = "certification_expiry_date")
    private java.time.LocalDate certificationExpiryDate;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ====== Relationships ======
    @OneToMany(mappedBy = "farm", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Product> products = new ArrayList<>();
}

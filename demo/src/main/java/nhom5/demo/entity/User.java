package nhom5.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import nhom5.demo.enums.RoleEnum;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity đại diện cho người dùng trong hệ thống.
 * Hỗ trợ hai vai trò: ROLE_USER và ROLE_ADMIN.
 */
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_user_email", columnList = "email"),
        @Index(name = "idx_user_username", columnList = "username")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "username", unique = true, nullable = false, length = 50)
    private String username;

    @NotBlank
    @Email
    @Column(name = "email", unique = true, nullable = false, length = 100)
    private String email;

    @NotBlank
    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "date_of_birth")
    private java.time.LocalDate dateOfBirth;

    @Column(name = "gender", length = 10)
    private String gender; // "male", "female", "other"

    @Column(name = "membership_tier", length = 20)
    @Builder.Default
    private String membershipTier = "bronze";

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    @Column(name = "lifetime_points")
    @Builder.Default
    private Long lifetimePoints = 0L;

    @Column(name = "available_points")
    @Builder.Default
    private Long availablePoints = 0L;

    @Column(name = "tier_updated_at")
    private LocalDateTime tierUpdatedAt;

    @Column(name = "email_notifications")
    @Builder.Default
    private Boolean emailNotifications = true;

    @Column(name = "promo_notifications")
    @Builder.Default
    private Boolean promoNotifications = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private RoleEnum role;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // fields for forgot password
    @Column(name = "reset_token", length = 100)
    private String resetToken;

    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;

    // fields for social login
    @Column(name = "provider", length = 20)
    private String provider; // "LOCAL", "GOOGLE", "GITHUB"

    @Column(name = "provider_id", length = 100)
    private String providerId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "two_factor_secret", length = 32)
    private String twoFactorSecret;

    @Column(name = "is_two_factor_enabled", nullable = false)
    @Builder.Default
    private Boolean isTwoFactorEnabled = false;

    @Column(name = "two_factor_method", length = 10)
    @Builder.Default
    private String twoFactorMethod = "TOTP"; // "TOTP", "EMAIL"

    @Column(name = "email_2fa_code", length = 6)
    private String email2faCode;

    @Column(name = "email_2fa_code_expiry")
    private LocalDateTime email2faCodeExpiry;

    /**
     * Phiên bản Token (Security Stamp). 
     * Tăng giá trị này khi người dùng đổi mật khẩu hoặc đăng xuất toàn cầu để vô hiệu hóa các JWT cũ.
     */
    @Column(name = "token_version", nullable = false)
    @Builder.Default
    private Integer tokenVersion = 1;

    /**
     * Số lần đăng nhập sai liên tiếp. Dùng để khóa tài khoản tạm thời nếu vượt quá giới hạn.
     */
    @Column(name = "failed_login_attempts")
    @Builder.Default
    private Integer failedLoginAttempts = 0;

    /**
     * Thời gian khóa tài khoản đến khi nào (nếu bị khóa do Brute-force).
     */
    @Column(name = "lockout_until")
    private LocalDateTime lockoutUntil;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "user_permissions", 
            joinColumns = @JoinColumn(name = "user_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "permission"})
    )
    @Column(name = "permission")
    @Builder.Default
    private java.util.Set<String> customPermissions = new java.util.HashSet<>();

    // ====== Relationships ======
    @JsonIgnore
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Cart cart;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Order> orders = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Address> addresses = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PointTransaction> pointTransactions = new ArrayList<>();
}

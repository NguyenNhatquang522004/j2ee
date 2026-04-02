package nhom5.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import nhom5.demo.enums.OrderStatusEnum;
import nhom5.demo.enums.PaymentMethodEnum;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity đơn hàng của khách hàng.
 * Liên kết với {@link OrderItem} để lưu chi tiết từng sản phẩm trong đơn.
 * Logic xuất kho FEFO được xử lý trong OrderService khi tạo đơn hàng.
 */
@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_order_user", columnList = "user_id"),
        @Index(name = "idx_order_code", columnList = "order_code"),
        @Index(name = "idx_order_status", columnList = "status"),
        @Index(name = "idx_order_created", columnList = "created_at"),
        @Index(name = "idx_order_deleted_at", columnList = "deleted_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE orders SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "order_code", nullable = false, unique = true, length = 30)
    private String orderCode;

    @NotBlank
    @Column(name = "shipping_address", nullable = false, length = 300)
    private String shippingAddress;

    @Column(name = "address_detail", length = 300)
    private String addressDetail;

    @Column(name = "ward", length = 100)
    private String ward;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "province", length = 100)
    private String province;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "receiver_name", length = 100)
    private String receiverName;

    @Column(name = "tracking_number", length = 50)
    private String trackingNumber;

    @Column(name = "estimated_arrival")
    private LocalDateTime estimatedArrival;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "return_reason", length = 500)
    private String returnReason;

    @Column(name = "return_media", length = 500)
    private String returnMedia;

    @Column(name = "reject_reason", length = 500)
    private String rejectReason;

    @NotNull
    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "discount_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "shipping_fee", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @NotNull
    @Column(name = "final_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal finalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private OrderStatusEnum status = OrderStatusEnum.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 50)
    @Builder.Default
    private PaymentMethodEnum paymentMethod = PaymentMethodEnum.COD;

    @Column(name = "is_paid", nullable = false)
    @Builder.Default
    private Boolean isPaid = false;

    @Column(name = "is_refunded", nullable = false)
    @Builder.Default
    private Boolean isRefunded = false;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "packaging_at")
    private LocalDateTime packagingAt;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "return_requested_at")
    private LocalDateTime returnRequestedAt;

    @Column(name = "returned_at")
    private LocalDateTime returnedAt;

    // ====== Relationships ======

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    private Coupon coupon;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();
}

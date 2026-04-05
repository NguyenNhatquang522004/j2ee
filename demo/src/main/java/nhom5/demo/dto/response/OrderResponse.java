package nhom5.demo.dto.response;

import lombok.*;
import nhom5.demo.enums.OrderStatusEnum;
import nhom5.demo.enums.PaymentMethodEnum;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderCode;
    private String shippingAddress;
    private String addressDetail;
    private String ward;
    private String district;
    private String province;
    private String phone;
    private String receiverName;
    private String trackingNumber;
    private LocalDateTime estimatedArrival;
    private String note;
    private String returnReason;
    private String returnMedia;
    private String rejectReason;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;
    private BigDecimal finalAmount;
    private OrderStatusEnum status;
    private String statusDisplayName;
    private PaymentMethodEnum paymentMethod;
    @JsonProperty("isPaid")
    private Boolean isPaid;
    @JsonProperty("isNotifiedPayment")
    private Boolean notifiedPayment;
    private LocalDateTime notifiedAt;
    private String paymentProof;
    private String paymentNote;
    private Long userId;
    private String username;
    private String couponCode;
    private List<OrderItemResponse> orderItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime packagingAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime refundedAt;
    private LocalDateTime returnRequestedAt;
    private LocalDateTime returnedAt;
    private LocalDateTime paidAt;
    @JsonProperty("isRefunded")
    private Boolean isRefunded;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponse {
        private Long orderItemId;
        private Long productId;
        private String productName;
        private String productImageUrl;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }
}

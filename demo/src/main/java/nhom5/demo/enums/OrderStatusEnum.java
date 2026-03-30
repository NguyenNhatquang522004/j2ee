package nhom5.demo.enums;

/**
 * Enum trạng thái đơn hàng.
 */
public enum OrderStatusEnum {
    PENDING("Chờ xác nhận"),
    CONFIRMED("Đã xác nhận"),
    PACKAGING("Đang đóng gói"),
    SHIPPING("Đang giao hàng"),
    DELIVERED("Đã giao hàng"),
    CANCELLED("Đã hủy"),
    RETURN_REQUESTED("Yêu cầu trả hàng"),
    RETURNED("Đã trả hàng"),
    RETURN_REJECTED("Từ chối trả hàng");

    private final String displayName;

    OrderStatusEnum(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

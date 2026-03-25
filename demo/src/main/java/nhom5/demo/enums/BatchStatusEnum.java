package nhom5.demo.enums;

/**
 * Enum trạng thái của lô hàng thực phẩm.
 * - ACTIVE: Lô hàng đang trong hạn sử dụng, bán bình thường.
 * - DISCOUNT: Lô hàng gần hết hạn (trong ngưỡng cảnh báo), đang được giảm giá.
 * - EXPIRED: Lô hàng đã hết hạn sử dụng.
 * - DISCONTINUED: Lô hàng bị ngừng kinh doanh (hết hàng hoặc thu hồi).
 */
public enum BatchStatusEnum {
    ACTIVE("Đang kinh doanh"),
    DISCOUNT("Đang khuyến mãi - Gần hết hạn"),
    EXPIRED("Đã hết hạn"),
    DISCONTINUED("Ngừng kinh doanh");

    private final String displayName;

    BatchStatusEnum(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

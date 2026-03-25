package nhom5.demo.enums;

/**
 * Enum phương thức thanh toán đơn hàng.
 */
public enum PaymentMethodEnum {
    COD("Thanh toán khi nhận hàng"),
    ONLINE("Thanh toán trực tuyến (Giả lập)"),
    BANK_TRANSFER("Chuyển khoản ngân hàng"),
    MOMO("Ví MoMo"),
    VNPAY("Thanh toán qua VNPay");

    private final String displayName;

    PaymentMethodEnum(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

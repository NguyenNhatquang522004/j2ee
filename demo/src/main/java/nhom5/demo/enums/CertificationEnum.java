package nhom5.demo.enums;

/**
 * Enum chứng nhận tiêu chuẩn canh tác của trang trại.
 */
public enum CertificationEnum {
    VIETGAP("VietGAP - Thực hành nông nghiệp tốt Việt Nam"),
    ORGANIC("Organic - Nông nghiệp hữu cơ"),
    GLOBAL_GAP("GlobalGAP - Thực hành nông nghiệp tốt toàn cầu"),
    HACCP("HACCP - Kiểm soát mối nguy vệ sinh thực phẩm"),
    NONE("Chưa có chứng nhận");

    private final String description;

    CertificationEnum(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

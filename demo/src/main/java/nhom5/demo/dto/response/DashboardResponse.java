package nhom5.demo.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
public class DashboardResponse {

    // Tổng quan
    private long totalUsers;
    private long totalProducts;
    private long totalOrders;
    private long totalFarms;
    private long totalSubscribers;
    private BigDecimal revenueToday;
    private BigDecimal revenueThisMonth;

    // Thống kê đơn hàng theo trạng thái
    private Map<String, Long> ordersByStatus;

    // Sản phẩm sắp hết hạn
    private List<BatchResponse> nearExpiryBatches;

    // Sản phẩm bán chạy nhất (kèm số lượng đã bán và doanh thu)
    private List<TopSellingProductResponse> topSellingProducts;

    // Doanh thu 7 ngày gần nhất (cho biểu đồ)
    private List<RevenueChartData> revenueChart;

    @Getter
    @Setter
    @Builder
    public static class RevenueChartData {
        private String date;
        private BigDecimal revenue;
        private long orderCount;
    }
}

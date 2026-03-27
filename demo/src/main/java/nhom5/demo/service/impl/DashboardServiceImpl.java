package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.response.BatchResponse;
import nhom5.demo.dto.response.DashboardResponse;
import nhom5.demo.dto.response.TopSellingProductResponse;
import nhom5.demo.enums.RoleEnum;
import nhom5.demo.repository.*;
import nhom5.demo.service.BatchService;
import nhom5.demo.service.DashboardService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final FarmRepository farmRepository;
    private final NewsletterRepository newsletterRepository;
    private final BatchService batchService;

    @Value("${app.batch.expiry-warning-days:3}")
    private int expiryWarningDays;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboardData() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.atTime(23, 59, 59);
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();

        // Basic counts
        long totalUsers = userRepository.countByRole(RoleEnum.ROLE_USER);
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        long totalFarms = farmRepository.count();
        long totalSubscribers = newsletterRepository.count();

        // Revenue
        BigDecimal revenueToday = orderRepository.sumRevenueByDateRange(startOfToday, endOfToday);
        BigDecimal revenueThisMonth = orderRepository.sumRevenueByDateRange(startOfMonth, endOfToday);

        // Orders by status
        List<Object[]> statusCounts = orderRepository.countGroupByStatus();
        Map<String, Long> ordersByStatus = new HashMap<>();
        for (Object[] row : statusCounts) {
            ordersByStatus.put(String.valueOf(row[0]), (Long) row[1]);
        }

        // Near expiry batches
        List<BatchResponse> nearExpiryBatches = batchService.getNearExpiryBatches(expiryWarningDays);

        // Top selling products (with actual sales data)
        List<Object[]> topRows = orderItemRepository.findTopSellingProductsWithStats();
        List<TopSellingProductResponse> topSellingProducts = new ArrayList<>();
        for (Object[] row : topRows) {
            topSellingProducts.add(TopSellingProductResponse.builder()
                    .productId(((Number) row[0]).longValue())
                    .productName((String) row[1])
                    .imageUrl((String) row[2])
                    .soldQuantity(((Number) row[3]).longValue())
                    .revenue(new BigDecimal(row[4].toString()))
                    .build());
        }

        // Revenue chart for last 7 days
        List<DashboardResponse.RevenueChartData> revenueChart = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(23, 59, 59);
            BigDecimal revenue = orderRepository.sumRevenueByDateRange(start, end);
            long orderCount = orderRepository.countOrdersByDateRange(start, end);
            revenueChart.add(DashboardResponse.RevenueChartData.builder()
                    .date(date.format(fmt))
                    .revenue(revenue != null ? revenue : BigDecimal.ZERO)
                    .orderCount(orderCount)
                    .build());
        }

        return DashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .totalFarms(totalFarms)
                .totalSubscribers(totalSubscribers)
                .revenueToday(revenueToday != null ? revenueToday : BigDecimal.ZERO)
                .revenueThisMonth(revenueThisMonth != null ? revenueThisMonth : BigDecimal.ZERO)
                .ordersByStatus(ordersByStatus)
                .nearExpiryBatches(nearExpiryBatches)
                .topSellingProducts(topSellingProducts)
                .revenueChart(revenueChart)
                .build();
    }
}

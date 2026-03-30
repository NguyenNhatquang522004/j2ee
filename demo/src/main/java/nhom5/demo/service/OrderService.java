package nhom5.demo.service;

import nhom5.demo.dto.request.OrderRequest;
import nhom5.demo.dto.response.OrderResponse;
import nhom5.demo.enums.OrderStatusEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderResponse createOrder(String username, OrderRequest request);

    OrderResponse getOrderById(Long id, String username);

    Page<OrderResponse> getOrdersByUser(String username, Pageable pageable);

    Page<OrderResponse> getAllOrders(String query, OrderStatusEnum status, Pageable pageable);

    OrderResponse updateOrderStatus(Long id, OrderStatusEnum status);

    void cancelOrder(Long id, String username);

    OrderResponse markAsRefunded(Long id);
    OrderResponse requestReturn(Long id, String reason, String returnMedia, String username);
    OrderResponse confirmReturn(Long id);
    OrderResponse rejectReturn(Long id, String reason);
    Page<OrderResponse> getRefundRequests(String query, Pageable pageable);
}

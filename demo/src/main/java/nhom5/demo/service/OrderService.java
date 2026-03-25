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

    Page<OrderResponse> getAllOrders(Pageable pageable);

    OrderResponse updateOrderStatus(Long id, OrderStatusEnum status);

    void cancelOrder(Long id, String username);
}

package nhom5.demo.service;

import nhom5.demo.dto.request.OrderRequest;
import nhom5.demo.dto.response.OrderResponse;
import nhom5.demo.enums.OrderStatusEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;

public interface OrderService {
    OrderResponse createOrder(@NonNull String username, @NonNull OrderRequest request);

    OrderResponse getOrderById(@NonNull Long id, @NonNull String username);
    OrderResponse getOrderByCode(@NonNull String orderCode, @NonNull String username);

    Page<OrderResponse> getOrdersByUser(@NonNull String username, @NonNull Pageable pageable);

    Page<OrderResponse> getAllOrders(String query, OrderStatusEnum status, @NonNull Pageable pageable);

    OrderResponse updateOrderStatus(@NonNull Long id, @NonNull OrderStatusEnum status);

    void cancelOrder(@NonNull String orderCode, @NonNull String username);

    OrderResponse markAsRefunded(@NonNull Long id);
    OrderResponse requestReturn(@NonNull String orderCode, String reason, String returnMedia, @NonNull String username);
    OrderResponse confirmReturn(@NonNull Long id);
    OrderResponse rejectReturn(@NonNull Long id, String reason);
    Page<OrderResponse> getRefundRequests(String query, @NonNull Pageable pageable);
}

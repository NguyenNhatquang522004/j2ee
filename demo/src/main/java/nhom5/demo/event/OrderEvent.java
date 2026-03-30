package nhom5.demo.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import nhom5.demo.entity.Order;
import nhom5.demo.enums.OrderStatusEnum;

@Getter
@Builder
@AllArgsConstructor
public class OrderEvent {
    private final Order order;
    private final OrderStatusEnum status;
    private final String type; // e.g., "CREATED", "STATUS_UPDATED", "CANCELLED"
}

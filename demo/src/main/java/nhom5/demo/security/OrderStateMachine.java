package nhom5.demo.security;

import nhom5.demo.enums.OrderStatusEnum;
import nhom5.demo.exception.BusinessException;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Thành phần quản lý máy trạng thái đơn hàng (Order State Machine).
 * Đảm bảo các bước chuyển trạng thái tuân thủ quy trình nghiệp vụ nghiêm ngặt.
 */
@Component
public class OrderStateMachine {

    private static final Map<OrderStatusEnum, Set<OrderStatusEnum>> VALID_TRANSITIONS = Map.of(
        OrderStatusEnum.PENDING, EnumSet.of(OrderStatusEnum.CONFIRMED, OrderStatusEnum.CANCELLED),
        OrderStatusEnum.CONFIRMED, EnumSet.of(OrderStatusEnum.PACKAGING, OrderStatusEnum.SHIPPING, OrderStatusEnum.CANCELLED),
        OrderStatusEnum.PACKAGING, EnumSet.of(OrderStatusEnum.SHIPPING, OrderStatusEnum.CANCELLED),
        OrderStatusEnum.SHIPPING, EnumSet.of(OrderStatusEnum.DELIVERED, OrderStatusEnum.CANCELLED),
        OrderStatusEnum.DELIVERED, EnumSet.of(OrderStatusEnum.RETURN_REQUESTED),
        OrderStatusEnum.RETURN_REQUESTED, EnumSet.of(OrderStatusEnum.RETURNED, OrderStatusEnum.RETURN_REJECTED),
        OrderStatusEnum.CANCELLED, EnumSet.noneOf(OrderStatusEnum.class),
        OrderStatusEnum.RETURNED, EnumSet.noneOf(OrderStatusEnum.class),
        OrderStatusEnum.RETURN_REJECTED, EnumSet.noneOf(OrderStatusEnum.class)
    );

    /**
     * Xác thực việc chuyển đổi trạng thái.
     * @param current Trạng thái hiện tại
     * @param target Trạng thái mong muốn
     * @throws BusinessException nếu chuyển đổi không hợp lệ
     */
    public void validateTransition(OrderStatusEnum current, OrderStatusEnum target) {
        Set<OrderStatusEnum> allowed = VALID_TRANSITIONS.getOrDefault(current, EnumSet.noneOf(OrderStatusEnum.class));
        if (!allowed.contains(target)) {
            throw new BusinessException(String.format("Không thể chuyển đơn hàng từ trạng thái %s sang %s", 
                current.getDisplayName(), target.getDisplayName()));
        }
    }

    /**
     * Kiểm tra xem đơn hàng có thể hủy được không.
     */
    public boolean canCancel(OrderStatusEnum current) {
        return current == OrderStatusEnum.PENDING || 
               current == OrderStatusEnum.CONFIRMED || 
               current == OrderStatusEnum.PACKAGING ||
               current == OrderStatusEnum.SHIPPING; // Tùy chọn: Có cho phép hủy khi đang giao? 
    }
}

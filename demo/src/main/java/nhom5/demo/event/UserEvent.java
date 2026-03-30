package nhom5.demo.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import nhom5.demo.entity.User;

/**
 * Event đại diện cho các thay đổi liên quan đến người dùng (thăng hạng, cập nhật điểm).
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEvent {
    private User user;
    private String type; // "TIER_UPGRADED", "POINTS_EARNED"
    private String oldTier;
    private String newTier;
    private Long points;
}

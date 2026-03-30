package nhom5.demo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.entity.PointTransaction;
import nhom5.demo.entity.User;
import nhom5.demo.event.UserEvent;
import nhom5.demo.repository.PointTransactionRepository;
import nhom5.demo.repository.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoyaltyService {

    private final UserRepository userRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final ApplicationEventPublisher eventPublisher;

    private static final long SILVER_THRESHOLD = 5000;
    private static final long GOLD_THRESHOLD = 20000;
    private static final long PLATINUM_THRESHOLD = 100000;

    /**
     * Tích lũy điểm cho người dùng sau khi đơn hàng thành công.
     * Tỉ lệ mặc định: 1.000đ = 1 điểm.
     */
    @Transactional
    public void awardPoints(User user, long amount, String orderCode) {
        long pointsEarned = Math.floorDiv(amount, 1000);
        if (pointsEarned <= 0) return;

        log.info("Awarding {} points to user {} for order {}", pointsEarned, user.getUsername(), orderCode);

        // 1. Cập nhật điểm
        user.setLifetimePoints(user.getLifetimePoints() + pointsEarned);
        user.setAvailablePoints(user.getAvailablePoints() + pointsEarned);

        // 2. Kiểm tra thăng hạng
        checkAndUpgradeTier(user);

        userRepository.save(user);

        // 3. Ghi nhật ký giao dịch điểm
        PointTransaction transaction = PointTransaction.builder()
                .user(user)
                .points(pointsEarned)
                .type("EARN")
                .source("ORDER")
                .sourceId(orderCode)
                .description("Tích điểm từ đơn hàng #" + orderCode)
                .balanceAfter(user.getAvailablePoints())
                .build();
        pointTransactionRepository.save(transaction);
        
        // 4. Phát sự kiện
        eventPublisher.publishEvent(UserEvent.builder()
                .user(user)
                .type("POINTS_EARNED")
                .points(pointsEarned)
                .build());
    }

    private void checkAndUpgradeTier(User user) {
        String oldTier = user.getMembershipTier();
        long lp = user.getLifetimePoints();
        String newTier = oldTier;

        if (lp >= PLATINUM_THRESHOLD) {
            newTier = "platinum";
        } else if (lp >= GOLD_THRESHOLD) {
            newTier = "gold";
        } else if (lp >= SILVER_THRESHOLD) {
            newTier = "silver";
        } else {
            newTier = "bronze";
        }

        if (!newTier.equalsIgnoreCase(oldTier)) {
            log.info("User {} upgraded from {} to {}", user.getUsername(), oldTier, newTier);
            user.setMembershipTier(newTier);
            user.setTierUpdatedAt(LocalDateTime.now());

            eventPublisher.publishEvent(UserEvent.builder()
                    .user(user)
                    .type("TIER_UPGRADED")
                    .oldTier(oldTier)
                    .newTier(newTier)
                    .build());
        }
    }
}

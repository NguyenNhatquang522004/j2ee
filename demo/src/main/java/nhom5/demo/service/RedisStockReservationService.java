package nhom5.demo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.SessionCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisStockReservationService {

    private final StringRedisTemplate redisTemplate;
    private static final String RESERVATION_PREFIX = "stock:res:";
    private static final String TOTAL_RESERVED_PREFIX = "stock:total_reserved:";
    private static final long DEFAULT_TTL_MINUTES = 15;

    /**
     * Tạm giữ tồn kho trong Redis để chờ thanh toán (Flash Sale & Regular).
     * Sử dụng Redis Transaction (MULTI/EXEC) để đảm bảo tính nguyên tử.
     */
    public boolean reserve(@NonNull String orderCode, @NonNull Long productId, int quantity) {
        String resKey = RESERVATION_PREFIX + orderCode + ":" + productId;
        String totalKey = TOTAL_RESERVED_PREFIX + productId;

        try {
            List<Object> results = redisTemplate.execute(new SessionCallback<>() {
                @Override
                @SuppressWarnings("unchecked")
                public <K, V> List<Object> execute(@NonNull RedisOperations<K, V> operations) throws DataAccessException {
                    operations.multi();
                    operations.opsForValue().set((K) resKey, Objects.requireNonNull((V) String.valueOf(quantity)), Objects.requireNonNull(Duration.ofMinutes(DEFAULT_TTL_MINUTES)));
                    operations.opsForValue().increment((K) totalKey, quantity);
                    operations.expire((K) totalKey, Objects.requireNonNull(Duration.ofMinutes(DEFAULT_TTL_MINUTES + 1)));
                    return operations.exec();
                }
            });

            if (results != null && !results.isEmpty()) {
                log.info("Reserved {} units for product {} (Order: {}) in Redis", quantity, productId, orderCode);
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("Failed to reserve stock in Redis: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Lấy tổng lượng đang bị giữ (chưa thanh toán) của một sản phẩm
     */
    public int getTotalReserved(@NonNull Long productId) {
        String totalKey = TOTAL_RESERVED_PREFIX + productId;
        String val = redisTemplate.opsForValue().get(totalKey);
        return val != null ? Integer.parseInt(val) : 0;
    }

    /**
     * Giải phóng lượng giữ chỗ khi đơn hàng bị huỷ hoặc hết hạn thanh toán.
     * Sử dụng Redis Transaction (MULTI/EXEC) để đảm bảo tính nguyên tử.
     */
    public void release(@NonNull String orderCode, @NonNull Map<Long, Integer> items) {
        items.forEach((productId, quantity) -> {
            String resKey = RESERVATION_PREFIX + orderCode + ":" + productId;
            String totalKey = TOTAL_RESERVED_PREFIX + productId;

            if (Boolean.TRUE.equals(redisTemplate.hasKey(resKey))) {
                redisTemplate.execute(new SessionCallback<>() {
                    @Override
                    @SuppressWarnings("unchecked")
                    public <K, V> List<Object> execute(@NonNull RedisOperations<K, V> operations) throws DataAccessException {
                        operations.multi();
                        operations.delete((K) resKey);
                        operations.opsForValue().decrement((K) totalKey, quantity);
                        return operations.exec();
                    }
                });
                log.info("Released reservation for product {} (Order: {})", productId, orderCode);
            }
        });
    }

    /**
     * Xác nhận giữ chỗ đã hoàn tất (thanh toán thành công).
     * Sử dụng Redis Transaction (MULTI/EXEC) để đảm bảo tính nguyên tử.
     */
    public void commit(@NonNull String orderCode, @NonNull Map<Long, Integer> items) {
        items.forEach((productId, quantity) -> {
            String resKey = RESERVATION_PREFIX + orderCode + ":" + productId;
            String totalKey = TOTAL_RESERVED_PREFIX + productId;

            if (Boolean.TRUE.equals(redisTemplate.hasKey(resKey))) {
                redisTemplate.execute(new SessionCallback<>() {
                    @Override
                    @SuppressWarnings("unchecked")
                    public <K, V> List<Object> execute(@NonNull RedisOperations<K, V> operations) throws DataAccessException {
                        operations.multi();
                        operations.delete((K) resKey);
                        operations.opsForValue().decrement((K) totalKey, quantity);
                        return operations.exec();
                    }
                });
                log.info("Committed reservation for product {} (Order: {})", productId, orderCode);
            }
        });
    }
}

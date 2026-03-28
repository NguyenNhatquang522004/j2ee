package nhom5.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RateLimitService {

    private final StringRedisTemplate redisTemplate;

    public boolean isAllowed(String key, int limit, int windowSeconds) {
        String redisKey = "rate_limit:" + key;
        long now = System.currentTimeMillis();
        long windowStart = now - (windowSeconds * 1000L);

        // Standard Enterprise Sliding Window algorithm using Redis Sorted Sets
        // 1. Remove old requests outside the sliding window
        redisTemplate.opsForZSet().removeRangeByScore(redisKey, 0, windowStart);
        
        // 2. Count current number of requests in the window
        Long currentCount = redisTemplate.opsForZSet().zCard(redisKey);
        
        if (currentCount != null && currentCount >= limit) {
            return false;
        }

        // 3. Add new request with current timestamp
        redisTemplate.opsForZSet().add(redisKey, String.valueOf(now), now);
        
        // 4. Set expiry for the whole key to clean up dormant keys
        redisTemplate.expire(redisKey, Duration.ofSeconds(windowSeconds + 1));
        
        return true;
    }
}

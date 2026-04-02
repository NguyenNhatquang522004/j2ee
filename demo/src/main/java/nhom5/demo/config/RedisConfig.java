package nhom5.demo.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import nhom5.demo.websocket.RedisMessageSubscriber;
import java.time.Duration;
import org.springframework.lang.NonNull;
import java.util.Objects;

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(@NonNull RedisConnectionFactory connectionFactory, @NonNull ObjectMapper objectMapper) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        
        // Use a dedicated Serializer for Redis that includes type information
        template.setValueSerializer(createRedisSerializer(objectMapper));
        return template;
    }

    private @NonNull GenericJackson2JsonRedisSerializer createRedisSerializer(ObjectMapper objectMapper) {
        ObjectMapper redisMapper = objectMapper.copy();
        // Register type information so Redis knows how to deserialize back to the original class
        redisMapper.activateDefaultTyping(
                redisMapper.getPolymorphicTypeValidator(),
                ObjectMapper.DefaultTyping.NON_FINAL,
                com.fasterxml.jackson.annotation.JsonTypeInfo.As.PROPERTY
        );
        return new GenericJackson2JsonRedisSerializer(redisMapper);
    }

    @Bean
    public ChannelTopic notificationTopic() {
        return new ChannelTopic("live-notifications");
    }

    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(@NonNull RedisConnectionFactory connectionFactory, 
                                                                       @NonNull RedisMessageSubscriber subscriber) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(subscriber, Objects.requireNonNull(notificationTopic()));
        return container;
    }

    @Bean
    public RedisCacheManager cacheManager(@NonNull RedisConnectionFactory connectionFactory, @NonNull ObjectMapper objectMapper) {
        GenericJackson2JsonRedisSerializer serializer = createRedisSerializer(objectMapper);
        Duration ttl = Objects.requireNonNull(Duration.ofHours(1));
        
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(ttl)
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .build();
    }
}

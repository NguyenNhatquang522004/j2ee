package nhom5.demo.websocket;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisMessageSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void onMessage(@NonNull Message message, @Nullable byte[] pattern) {
        try {
            Map<String, Object> payload = objectMapper.readValue(message.getBody(), new TypeReference<Map<String, Object>>() {});
            String username = (String) payload.get("username");
            String type = (String) payload.get("type");
            
            if (username != null) {
                log.info("Broadcasting notification to user: {}", username);
                messagingTemplate.convertAndSendToUser(username, "/queue/notifications", payload);
            } else if ("FLASH_SALE_UPDATE".equals(type) || "FLASH_SALE_REFRESH".equals(type)) {
                log.info("Broadcasting Flash Sale update/refresh to all clients");
                messagingTemplate.convertAndSend("/topic/flash-sales", payload);
            } else {
                messagingTemplate.convertAndSend("/topic/notifications", payload);
            }
            
        } catch (Exception e) {
            log.error("Error processing Redis message", e);
        }
    }
}

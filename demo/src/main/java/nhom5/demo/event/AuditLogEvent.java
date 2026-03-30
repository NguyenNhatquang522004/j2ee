package nhom5.demo.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogEvent {
    private String username;
    private String action;
    private String resourceType;
    private String resourceId;
    private String details;
}

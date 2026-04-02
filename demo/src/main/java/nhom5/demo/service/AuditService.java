package nhom5.demo.service;

import lombok.RequiredArgsConstructor;
import nhom5.demo.entity.AdminAuditLog;
import nhom5.demo.repository.AdminAuditLogRepository;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import nhom5.demo.event.AuditLogEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AdminAuditLogRepository auditLogRepository;

    @Transactional
    public void log(String username, String action, String resourceType, String resourceId, String details) {
        // Build the log entity
        AdminAuditLog log = AdminAuditLog.builder()
                .adminUsername(username)
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .details(details)
                .build();
        auditLogRepository.save(Objects.requireNonNull(log));
    }

    @Async
    @EventListener
    @Transactional
    public void handleAuditLogEvent(@NonNull AuditLogEvent event) {
        log(event.getUsername(), event.getAction(), event.getResourceType(), event.getResourceId(), event.getDetails());
    }

    public org.springframework.data.domain.Page<AdminAuditLog> getLogs(@NonNull org.springframework.data.domain.Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional
    public void deleteLogsByUsername(@NonNull String username) {
        auditLogRepository.deleteByAdminUsername(username);
    }

    @Transactional
    public void deleteLog(@NonNull Long id) {
        auditLogRepository.deleteById(id);
    }

    @Transactional
    public void clearAllLogs() {
        auditLogRepository.deleteAll();
    }
}

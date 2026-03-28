package nhom5.demo.service;

import lombok.RequiredArgsConstructor;
import nhom5.demo.entity.AdminAuditLog;
import nhom5.demo.repository.AdminAuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AdminAuditLogRepository auditLogRepository;

    @Transactional
    public void log(String username, String action, String resourceType, String resourceId, String details) {
        AdminAuditLog log = AdminAuditLog.builder()
                .adminUsername(username)
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }

    public org.springframework.data.domain.Page<AdminAuditLog> getLogs(org.springframework.data.domain.Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}

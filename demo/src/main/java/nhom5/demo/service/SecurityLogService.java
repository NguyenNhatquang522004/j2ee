package nhom5.demo.service;

import nhom5.demo.entity.SecurityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface SecurityLogService {
    void log(String eventType, String severity, String details, String ipAddress, String username);
    void log(String eventType, String severity, String details, String ipAddress);
    
    Page<SecurityLog> getAllLogs(Pageable pageable);
    Page<SecurityLog> getLogsByIp(String ipAddress, Pageable pageable);
    void cleanupOldLogs(LocalDateTime before);
}

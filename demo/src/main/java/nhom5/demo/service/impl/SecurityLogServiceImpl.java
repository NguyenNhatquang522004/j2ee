package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.entity.SecurityLog;
import nhom5.demo.repository.SecurityLogRepository;
import nhom5.demo.service.SecurityLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Objects;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class SecurityLogServiceImpl implements SecurityLogService {

    private final SecurityLogRepository securityLogRepository;

    @Override
    @Transactional
    public void log(String eventType, String severity, String details, String ipAddress, String username) {
        log.info("Security Event: {} | Severity: {} | IP: {} | User: {} | Details: {}", 
                eventType, severity, ipAddress, username, details);
                
        SecurityLog securityLog = SecurityLog.builder()
                .eventType(eventType)
                .severity(severity)
                .details(details)
                .ipAddress(ipAddress)
                .username(username)
                .build();
        securityLogRepository.save(Objects.requireNonNull(securityLog));
    }

    @Override
    @Transactional
    public void log(String eventType, String severity, String details, String ipAddress) {
        log(eventType, severity, details, ipAddress, null);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SecurityLog> getAllLogs(Pageable pageable) {
        return securityLogRepository.findAll(Objects.requireNonNull(pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SecurityLog> getLogsByIp(String ipAddress, Pageable pageable) {
        return securityLogRepository.findByIpAddressOrderByCreatedAtDesc(ipAddress, Objects.requireNonNull(pageable));
    }
    
    @Override
    @Transactional
    public void cleanupOldLogs(LocalDateTime before) {
        log.info("Cleaning up security logs older than {}", before);
        securityLogRepository.deleteByCreatedAtBefore(Objects.requireNonNull(before));
    }
}

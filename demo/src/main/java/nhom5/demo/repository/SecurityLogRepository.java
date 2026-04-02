package nhom5.demo.repository;

import nhom5.demo.entity.SecurityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface SecurityLogRepository extends JpaRepository<SecurityLog, Long> {
    Page<SecurityLog> findByIpAddressOrderByCreatedAtDesc(String ipAddress, Pageable pageable);
    Page<SecurityLog> findByEventTypeOrderByCreatedAtDesc(String eventType, Pageable pageable);
    void deleteByCreatedAtBefore(LocalDateTime before);
}

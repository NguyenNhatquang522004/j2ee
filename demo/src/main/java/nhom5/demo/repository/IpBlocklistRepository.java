package nhom5.demo.repository;

import nhom5.demo.entity.IpBlocklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface IpBlocklistRepository extends JpaRepository<IpBlocklist, Long> {
    
    Optional<IpBlocklist> findByIpAddress(String ipAddress);

    /**
     * Kiểm tra xem một IP có bị chặn vĩnh viễn hoặc chưa hết hạn khóa hay không.
     */
    boolean existsByIpAddressAndIsPermanentTrue(String ipAddress);
    
    boolean existsByIpAddressAndBlockedUntilAfter(String ipAddress, LocalDateTime now);
    
    default boolean isBlocked(String ipAddress) {
        return existsByIpAddressAndIsPermanentTrue(ipAddress) || 
               existsByIpAddressAndBlockedUntilAfter(ipAddress, LocalDateTime.now());
    }
}

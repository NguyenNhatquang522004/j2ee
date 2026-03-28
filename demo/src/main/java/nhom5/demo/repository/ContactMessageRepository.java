package nhom5.demo.repository;

import nhom5.demo.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM ContactMessage c WHERE c.isRead = false")
    long countByIsReadFalse();
}

package nhom5.demo.service;

import lombok.RequiredArgsConstructor;
import nhom5.demo.entity.ContactMessage;
import nhom5.demo.repository.ContactMessageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContactMessageService {

    private final ContactMessageRepository repository;

    @Transactional
    public ContactMessage save(ContactMessage message) {
        return repository.save(message);
    }

    public Page<ContactMessage> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Transactional
    public void markAsRead(Long id) {
        repository.findById(id).ifPresent(msg -> {
            msg.setRead(true);
            repository.save(msg);
        });
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    public long countUnread() {
        return repository.countByIsReadFalse();
    }
}

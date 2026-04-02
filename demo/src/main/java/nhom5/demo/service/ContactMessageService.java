package nhom5.demo.service;

import lombok.RequiredArgsConstructor;
import nhom5.demo.entity.ContactMessage;
import nhom5.demo.repository.ContactMessageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

@Service
@RequiredArgsConstructor
public class ContactMessageService {

    private final ContactMessageRepository repository;

    @Transactional
    public ContactMessage save(@NonNull ContactMessage message) {
        return repository.save(message);
    }

    public Page<ContactMessage> findAll(@NonNull Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Transactional
    public void markAsRead(@NonNull Long id) {
        repository.findById(id).ifPresent(msg -> {
            msg.setRead(true);
            repository.save(msg);
        });
    }

    @Transactional
    public void delete(@NonNull Long id) {
        repository.deleteById(id);
    }

    public long countUnread() {
        return repository.countByIsReadFalse();
    }
}

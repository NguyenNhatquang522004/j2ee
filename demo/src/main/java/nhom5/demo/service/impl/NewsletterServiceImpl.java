package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.entity.NewsletterSubscriber;
import nhom5.demo.exception.BusinessException;
import nhom5.demo.repository.NewsletterRepository;
import nhom5.demo.service.MailService;
import nhom5.demo.service.NewsletterService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;
import java.util.Objects;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsletterServiceImpl implements NewsletterService {

    private final NewsletterRepository newsletterRepository;
    private final MailService mailService;

    @Override
    @Transactional
    public void subscribe(@NonNull String email) {
        String normalized = email.trim().toLowerCase();
        if (normalized.contains("mailinator.com") || normalized.contains("temp-mail.org") || 
            normalized.contains("guerrillamail.com") || normalized.contains("10minutemail.com")) {
            throw new BusinessException("Hệ thống không chấp nhận các địa chỉ email tạm thời.");
        }

        if (newsletterRepository.existsByEmail(normalized)) {
            throw new BusinessException("Email này đã đăng ký bản tin trước đó.");
        }

        NewsletterSubscriber subscriber = NewsletterSubscriber.builder()
                .email(normalized)
                .isActive(true)
                .build();
        
        newsletterRepository.save(Objects.requireNonNull(subscriber));
        
        // Send welcome email
        mailService.sendNewsletterWelcome(normalized);
    }

    @Override
    @Transactional
    public void unsubscribe(@NonNull String email) {
        String normalized = email.trim().toLowerCase();
        NewsletterSubscriber subscriber = newsletterRepository.findByEmail(normalized)
                .orElseThrow(() -> new BusinessException("Email chưa đăng ký bản tin."));
        
        subscriber.setIsActive(false);
        newsletterRepository.save(subscriber);
    }

    @Override
    public List<NewsletterSubscriber> getAllSubscribers() {
        return newsletterRepository.findAll();
    }

    @Override
    @Transactional
    public void sendNewsletterToAll(@NonNull String subject, @NonNull String content) {
        List<NewsletterSubscriber> activeSubscribers = newsletterRepository.findAll().stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
                .toList();

        log.info("Starting to process newsletter sending to {} active subscribers.", activeSubscribers.size());

        for (NewsletterSubscriber subscriber : activeSubscribers) {
            String email = Objects.requireNonNull(subscriber.getEmail());
            mailService.sendGenericEmail(email, subject, content);
        }
        
        log.info("Finished queueing {} newsletter emails.", activeSubscribers.size());
    }

    @Override
    @Transactional
    public void deleteSubscriber(@NonNull Long id) {
        if (!newsletterRepository.existsById(id)) {
            throw new BusinessException("Subscriber not found with ID: " + id);
        }
        newsletterRepository.deleteById(id);
    }
}

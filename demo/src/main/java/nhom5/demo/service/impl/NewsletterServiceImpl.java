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

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsletterServiceImpl implements NewsletterService {

    private final NewsletterRepository newsletterRepository;
    private final MailService mailService;

    @Override
    @Transactional
    public void subscribe(String email) {
        if (newsletterRepository.existsByEmail(email)) {
            throw new BusinessException("Email này đã đăng ký bản tin trước đó.");
        }

        NewsletterSubscriber subscriber = NewsletterSubscriber.builder()
                .email(email)
                .isActive(true)
                .build();
        
        newsletterRepository.save(subscriber);
        
        // Send welcome email
        mailService.sendNewsletterWelcome(email);
    }

    @Override
    @Transactional
    public void unsubscribe(String email) {
        NewsletterSubscriber subscriber = newsletterRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Email chưa đăng ký bản tin."));
        
        subscriber.setIsActive(false);
        newsletterRepository.save(subscriber);
    }

    @Override
    public java.util.List<NewsletterSubscriber> getAllSubscribers() {
        return newsletterRepository.findAll();
    }

    @Override
    @Transactional
    public void sendNewsletterToAll(String subject, String content) {
        java.util.List<NewsletterSubscriber> activeSubscribers = newsletterRepository.findAll().stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
                .toList();

        log.info("Starting to process newsletter sending to {} active subscribers.", activeSubscribers.size());

        for (NewsletterSubscriber subscriber : activeSubscribers) {
            mailService.sendGenericEmail(subscriber.getEmail(), subject, content);
        }
        
        log.info("Finished queueing {} newsletter emails.", activeSubscribers.size());
    }

    @Override
    @Transactional
    public void deleteSubscriber(Long id) {
        newsletterRepository.deleteById(id);
    }
}

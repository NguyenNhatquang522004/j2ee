package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.entity.NewsletterSubscriber;
import nhom5.demo.exception.BusinessException;
import nhom5.demo.repository.NewsletterRepository;
import nhom5.demo.service.MailService;
import nhom5.demo.service.NewsletterService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                .filter(NewsletterSubscriber::getIsActive)
                .toList();

        for (NewsletterSubscriber subscriber : activeSubscribers) {
            mailService.sendGenericEmail(subscriber.getEmail(), subject, content);
        }
    }

    @Override
    @Transactional
    public void deleteSubscriber(Long id) {
        newsletterRepository.deleteById(id);
    }
}

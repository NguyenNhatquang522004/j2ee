package nhom5.demo.service;

import org.springframework.lang.NonNull;
import java.util.List;
import nhom5.demo.entity.NewsletterSubscriber;

public interface NewsletterService {
    void subscribe(@NonNull String email);
    void unsubscribe(@NonNull String email);
    
    // Admin methods
    List<NewsletterSubscriber> getAllSubscribers();
    void sendNewsletterToAll(@NonNull String subject, @NonNull String content);
    void deleteSubscriber(@NonNull Long id);
}

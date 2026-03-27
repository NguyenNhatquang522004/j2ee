package nhom5.demo.service;

public interface NewsletterService {
    void subscribe(String email);
    void unsubscribe(String email);
    
    // Admin methods
    java.util.List<nhom5.demo.entity.NewsletterSubscriber> getAllSubscribers();
    void sendNewsletterToAll(String subject, String content);
    void deleteSubscriber(Long id);
}

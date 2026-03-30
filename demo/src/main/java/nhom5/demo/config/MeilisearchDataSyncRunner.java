package nhom5.demo.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.repository.ProductRepository;
import nhom5.demo.service.SearchService;
import nhom5.demo.service.ProductService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@Profile("!test")
public class MeilisearchDataSyncRunner implements ApplicationRunner {

    private final ProductRepository productRepository;
    private final SearchService searchService;
    private final ProductService productService;

    @Override
    public void run(ApplicationArguments args) {
        try {
            log.info("Checking Meilisearch index status...");
            // Use a simple empty search to check if index has data
            if (searchService.searchProductIds("*").isEmpty()) {
                log.info("Meilisearch index seems empty or uninitialized. Starting full synchronization...");
                productRepository.findByIsActiveTrue().forEach(product -> {
                    try {
                        searchService.indexProduct(productService.getProductById(product.getId()));
                    } catch (Exception e) {
                        log.error("Failed to index product {}: {}", product.getId(), e.getMessage());
                    }
                });
                log.info("Full synchronization to Meilisearch completed.");
            } else {
                log.info("Meilisearch index already contains data. Skipping initial sync.");
            }
        } catch (Exception e) {
            log.error("Meilisearch synchronization runner failed: {}", e.getMessage());
        }
    }
}

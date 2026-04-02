package nhom5.demo.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhom5.demo.dto.response.ProductResponse;
import nhom5.demo.service.SearchService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final RestTemplate meiliRestTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.meili.index.products:products}")
    private String productIndexName;

    @Override
    @Async
    public void indexProduct(ProductResponse product) {
        log.debug("Asynchronously indexing product {} to Meilisearch", product.getId());
        try {
            String url = "/indexes/" + productIndexName + "/documents";
            Map<String, Object> doc = new HashMap<>();
            doc.put("id", product.getId());
            doc.put("name", product.getName());
            doc.put("description", product.getDescription());
            doc.put("categoryName", product.getCategoryName());
            doc.put("farmName", product.getFarmName());
            
            meiliRestTemplate.postForObject(url, List.of(doc), String.class);
        } catch (Exception e) {
            log.error("Failed to index product to Meilisearch in background: {}", e.getMessage());
        }
    }

    @Override
    @Async
    public void deleteProduct(Long id) {
        try {
            String url = "/indexes/" + productIndexName + "/documents/" + id;
            meiliRestTemplate.delete(url);
        } catch (Exception e) {
            log.error("Failed to delete product from Meilisearch in background: {}", e.getMessage());
        }
    }

    @Override
    public List<Long> searchProductIds(String query) {
        if (query == null || query.isBlank()) {
            return new ArrayList<>();
        }
        try {
            String url = "/indexes/" + productIndexName + "/search";
            Map<String, Object> body = new HashMap<>();
            body.put("q", query);
            
            String response = meiliRestTemplate.postForObject(url, body, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode hits = root.path("hits");
            
            List<Long> ids = new ArrayList<>();
            if (hits.isArray()) {
                for (JsonNode hit : hits) {
                    ids.add(hit.path("id").asLong());
                }
            }
            return ids;
        } catch (Exception e) {
            log.error("Search failed in Meilisearch: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public void clearAll() {
        try {
            String url = "/indexes/" + productIndexName;
            meiliRestTemplate.delete(url);
            log.info("Cleared Meilisearch index {} via REST", productIndexName);
        } catch (Exception e) {
            log.error("Failed to clear Meilisearch index: {}", e.getMessage());
        }
    }
}

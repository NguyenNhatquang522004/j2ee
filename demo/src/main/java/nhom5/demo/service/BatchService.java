package nhom5.demo.service;

import nhom5.demo.dto.request.BatchRequest;
import nhom5.demo.dto.response.BatchResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BatchService {
    BatchResponse addBatch(BatchRequest request);

    BatchResponse getBatchById(Long id);

    BatchResponse updateBatch(Long id, BatchRequest request);

    void deleteBatch(Long id);

    Page<BatchResponse> getAllBatches(Pageable pageable);

    Page<BatchResponse> getBatchesByProduct(Long productId, Pageable pageable);

    List<BatchResponse> getNearExpiryBatches(int days);

    /**
     * FEFO: deduct stock across batches for a product.
     * Returns remaining quantity to deduct (0 means success).
     */
    int deductStock(Long productId, int quantity);

    void updateExpiredBatches();

    void discountNearExpiryBatches(int warningDays);

    long getTotalStock(Long productId);
}

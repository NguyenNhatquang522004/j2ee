package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.request.BatchRequest;
import nhom5.demo.dto.response.BatchResponse;
import nhom5.demo.entity.Product;
import nhom5.demo.entity.ProductBatch;
import nhom5.demo.enums.BatchStatusEnum;
import nhom5.demo.exception.BusinessException;
import nhom5.demo.exception.InsufficientStockException;
import nhom5.demo.exception.ResourceNotFoundException;
import nhom5.demo.repository.ProductBatchRepository;
import nhom5.demo.repository.ProductRepository;
import nhom5.demo.service.BatchService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BatchServiceImpl implements BatchService {

    private final ProductBatchRepository batchRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public BatchResponse addBatch(BatchRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (batchRepository.existsByBatchCode(request.getBatchCode())) {
            throw new BusinessException("Mã lô '" + request.getBatchCode() + "' đã tồn tại");
        }
        if (request.getExpiryDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Ngày hết hạn phải sau ngày hôm nay");
        }

        ProductBatch batch = ProductBatch.builder()
                .batchCode(request.getBatchCode())
                .importDate(request.getImportDate())
                .productionDate(request.getProductionDate())
                .expiryDate(request.getExpiryDate())
                .quantity(request.getQuantity())
                .remainingQuantity(request.getQuantity())
                .status(BatchStatusEnum.ACTIVE)
                .note(request.getNote())
                .product(product)
                .build();

        return toResponse(batchRepository.save(batch));
    }

    @Override
    public BatchResponse getBatchById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public Page<BatchResponse> getBatchesByProduct(Long productId, Pageable pageable) {
        return batchRepository.findByProductId(productId, pageable).map(this::toResponse);
    }

    @Override
    public List<BatchResponse> getNearExpiryBatches(int days) {
        LocalDate warningDate = LocalDate.now().plusDays(days);
        return batchRepository.findBatchesNearExpiry(LocalDate.now(), warningDate)
                .stream().map(this::toResponse).toList();
    }

    /**
     * FEFO (First Expired, First Out) stock deduction.
     * Deducts stock from the earliest-expiring batches first.
     * Returns 0 on success, remaining quantity if insufficient stock.
     */
    @Override
    @Transactional
    public int deductStock(Long productId, int quantity) {
        List<ProductBatch> batches = batchRepository.findAvailableBatchesFEFO(productId, LocalDate.now());

        long totalAvailable = batches.stream()
                .mapToLong(b -> b.getRemainingQuantity())
                .sum();

        if (totalAvailable < quantity) {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
            throw new InsufficientStockException(product.getName(), quantity, (int) totalAvailable);
        }

        int remaining = quantity;
        for (ProductBatch batch : batches) {
            if (remaining <= 0)
                break;

            int deduct = Math.min(remaining, batch.getRemainingQuantity());
            batch.setRemainingQuantity(batch.getRemainingQuantity() - deduct);
            remaining -= deduct;

            if (batch.getRemainingQuantity() == 0) {
                batch.setStatus(BatchStatusEnum.DISCONTINUED);
            }
            batchRepository.save(batch);
        }
        return remaining;
    }

    @Override
    @Transactional
    public void updateExpiredBatches() {
        List<ProductBatch> expiredBatches = batchRepository.findExpiredBatches(LocalDate.now());
        for (ProductBatch batch : expiredBatches) {
            batch.setStatus(BatchStatusEnum.EXPIRED);
            batchRepository.save(batch);
        }
    }

    @Override
    @Transactional
    public void discountNearExpiryBatches(int warningDays) {
        LocalDate warningDate = LocalDate.now().plusDays(warningDays);
        List<ProductBatch> nearExpiryBatches = batchRepository.findBatchesNearExpiry(LocalDate.now(), warningDate);
        for (ProductBatch batch : nearExpiryBatches) {
            if (batch.getStatus() == BatchStatusEnum.ACTIVE) {
                batch.setStatus(BatchStatusEnum.DISCOUNT);
                batchRepository.save(batch);
            }
        }
    }

    @Override
    public long getTotalStock(Long productId) {
        Long total = batchRepository.sumRemainingQuantityByProductId(productId);
        return total != null ? total : 0L;
    }

    private ProductBatch findById(Long id) {
        return batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductBatch", "id", id));
    }

    private BatchResponse toResponse(ProductBatch batch) {
        int daysUntilExpiry = (int) ChronoUnit.DAYS.between(LocalDate.now(), batch.getExpiryDate());
        return BatchResponse.builder()
                .id(batch.getId())
                .batchCode(batch.getBatchCode())
                .importDate(batch.getImportDate())
                .productionDate(batch.getProductionDate())
                .expiryDate(batch.getExpiryDate())
                .quantity(batch.getQuantity())
                .remainingQuantity(batch.getRemainingQuantity())
                .status(batch.getStatus())
                .statusDisplayName(batch.getStatus().getDisplayName())
                .note(batch.getNote())
                .productId(batch.getProduct().getId())
                .productName(batch.getProduct().getName())
                .daysUntilExpiry(daysUntilExpiry)
                .build();
    }
}

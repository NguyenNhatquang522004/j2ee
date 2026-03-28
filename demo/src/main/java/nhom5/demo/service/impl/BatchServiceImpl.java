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

        // Kiểm tra logic ngày tháng cho lô hàng mới
        if (request.getProductionDate() != null && request.getProductionDate().isAfter(LocalDate.now())) {
            throw new BusinessException("Ngày sản xuất không thể ở tương lai");
        }
        if (request.getProductionDate() != null && request.getImportDate().isBefore(request.getProductionDate())) {
            throw new BusinessException("Ngày nhập hàng không thể trước ngày sản xuất");
        }
        if (request.getExpiryDate().isBefore(request.getImportDate()) || request.getExpiryDate().isEqual(request.getImportDate())) {
            throw new BusinessException("Ngày hết hạn phải sau ngày nhập hàng");
        }
        if (request.getExpiryDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Lô hàng này đã hết hạn, không thể nhập kho");
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
    @Transactional
    public BatchResponse updateBatch(Long id, BatchRequest request) {
        ProductBatch batch = findById(id);

        if (!batch.getBatchCode().equals(request.getBatchCode())
                && batchRepository.existsByBatchCode(request.getBatchCode())) {
            throw new BusinessException("Mã lô '" + request.getBatchCode() + "' đã tồn tại");
        }

        // Kiểm tra logic ngày tháng khi cập nhật lô hàng
        if (request.getProductionDate() != null && request.getProductionDate().isAfter(LocalDate.now())) {
            throw new BusinessException("Ngày sản xuất không thể ở tương lai");
        }
        if (request.getProductionDate() != null && request.getImportDate().isBefore(request.getProductionDate())) {
            throw new BusinessException("Ngày nhập hàng không thể trước ngày sản xuất");
        }
        if (request.getExpiryDate().isBefore(request.getImportDate()) || request.getExpiryDate().isEqual(request.getImportDate())) {
            throw new BusinessException("Ngày hết hạn phải sau ngày nhập hàng");
        }

        int quantityDelta = request.getQuantity() - batch.getQuantity();
        batch.setBatchCode(request.getBatchCode());
        batch.setImportDate(request.getImportDate());
        batch.setProductionDate(request.getProductionDate());
        batch.setExpiryDate(request.getExpiryDate());
        batch.setQuantity(request.getQuantity());
        batch.setRemainingQuantity(Math.max(0, batch.getRemainingQuantity() + quantityDelta));
        batch.setNote(request.getNote());

        return toResponse(batchRepository.save(batch));
    }

    @Override
    @Transactional
    public void deleteBatch(Long id) {
        ProductBatch batch = findById(id);
        batchRepository.delete(batch);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BatchResponse> getAllBatches(Pageable pageable) {
        return batchRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BatchResponse> getBatchesByProduct(Long productId, Pageable pageable) {
        return batchRepository.findByProductId(productId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
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

    @Override
    @Transactional
    public void returnStock(Long productId, int quantity) {
        // Find the latest active/discount batch to return stock to
        // We prefer returning to batches that are not about to expire soon (higher expiry date)
        List<ProductBatch> batches = batchRepository.findAvailableBatchesFEFO(productId, LocalDate.now());
        
        if (batches.isEmpty()) {
            // If no active batches, just find the most recent one created
            Page<ProductBatch> recent = batchRepository.findByProductId(productId, Pageable.ofSize(1));
            if (!recent.isEmpty()) {
                ProductBatch batch = recent.getContent().get(0);
                batch.setRemainingQuantity(batch.getRemainingQuantity() + quantity);
                if (batch.getStatus() == BatchStatusEnum.DISCONTINUED && batch.getRemainingQuantity() > 0) {
                    batch.setStatus(BatchStatusEnum.ACTIVE);
                }
                batchRepository.save(batch);
            }
            return;
        }

        // Return to the LAST batch in the FEFO list (the one expiring LATEST)
        ProductBatch target = batches.get(batches.size() - 1);
        target.setRemainingQuantity(target.getRemainingQuantity() + quantity);
        batchRepository.save(target);
    }

    private ProductBatch findById(Long id) {
        return batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductBatch", "id", id));
    }

    private BatchResponse toResponse(ProductBatch batch) {
        int daysUntilExpiry = batch.getExpiryDate() != null ? 
            (int) ChronoUnit.DAYS.between(LocalDate.now(), batch.getExpiryDate()) : 0;
        
        return BatchResponse.builder()
                .id(batch.getId())
                .batchCode(batch.getBatchCode())
                .importDate(batch.getImportDate())
                .productionDate(batch.getProductionDate())
                .expiryDate(batch.getExpiryDate())
                .quantity(batch.getQuantity())
                .remainingQuantity(batch.getRemainingQuantity())
                .status(batch.getStatus() != null ? batch.getStatus() : BatchStatusEnum.ACTIVE)
                .statusDisplayName(batch.getStatus() != null ? batch.getStatus().getDisplayName() : "Đang hoạt động")
                .note(batch.getNote())
                .productId(batch.getProduct() != null ? batch.getProduct().getId() : null)
                .productName(batch.getProduct() != null ? batch.getProduct().getName() : "Sản phẩm không xác định")
                .daysUntilExpiry(daysUntilExpiry)
                .build();
    }
}

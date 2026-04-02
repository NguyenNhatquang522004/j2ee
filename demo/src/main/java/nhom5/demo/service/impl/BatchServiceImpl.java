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
import org.springframework.lang.NonNull;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;

/**
 * Triển khai nghiệp vụ quản lý Lô hàng (Batch Management).
 * Sử dụng chiến lược FEFO (First Expired First Out) để quản lý hàng tồn kho
 * thực phẩm sạch,
 * đảm bảo sản phẩm có hạn sử dụng gần nhất sẽ được xuất kho trước.
 */
@Service
@RequiredArgsConstructor
public class BatchServiceImpl implements BatchService {

    private final ProductBatchRepository batchRepository;
    private final ProductRepository productRepository;
    private final nhom5.demo.service.SearchService searchService;
    private final nhom5.demo.service.ProductService productService;

    @SuppressWarnings("null")
    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"products", "product_detail"}, allEntries = true)
    public BatchResponse addBatch(BatchRequest request) {
        Product product = productRepository.findById(Objects.requireNonNull(request.getProductId()))
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (batchRepository.existsByBatchCode(request.getBatchCode())) {
            throw new BusinessException("Mã lô '" + request.getBatchCode() + "' đã tồn tại");
        }

        // Kiểm tra logic ngày tháng cho lô hàng mới
        if (request.getProductionDate() != null) {
            if (request.getProductionDate().getYear() > 2099) {
                throw new BusinessException("Năm sản xuất không hợp lệ (tối đa 2099)");
            }
            if (request.getProductionDate().isAfter(LocalDate.now())) {
                throw new BusinessException("Ngày sản xuất không thể ở tương lai");
            }
        }
        
        if (request.getImportDate().getYear() > 2099) {
            throw new BusinessException("Năm nhập hàng không hợp lệ (tối đa 2099)");
        }
        
        if (request.getProductionDate() != null && request.getImportDate().isBefore(request.getProductionDate())) {
            throw new BusinessException("Ngày nhập hàng không thể trước ngày sản xuất");
        }
        
        if (request.getExpiryDate().getYear() > 2099) {
            throw new BusinessException("Năm hết hạn không hợp lệ (tối đa 2099)");
        }
        
        if (request.getExpiryDate().isBefore(request.getImportDate())
                || request.getExpiryDate().isEqual(request.getImportDate())) {
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

        ProductBatch savedBatch = Objects.requireNonNull(batchRepository.save(batch));
        return toResponse(savedBatch);
    }

    @Override
    public BatchResponse getBatchById(Long id) {
        return toResponse(Objects.requireNonNull(findById(id)));
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"products", "product_detail"}, allEntries = true)
    public BatchResponse updateBatch(Long id, BatchRequest request) {
        ProductBatch batch = findById(id);

        if (!batch.getBatchCode().equals(request.getBatchCode())
                && batchRepository.existsByBatchCode(request.getBatchCode())) {
            throw new BusinessException("Mã lô '" + request.getBatchCode() + "' đã tồn tại");
        }

        // Kiểm tra logic ngày tháng khi cập nhật lô hàng
        if (request.getProductionDate() != null) {
            if (request.getProductionDate().getYear() > 2099) {
                throw new BusinessException("Năm sản xuất không hợp lệ (tối đa 2099)");
            }
            if (request.getProductionDate().isAfter(LocalDate.now())) {
                throw new BusinessException("Ngày sản xuất không thể ở tương lai");
            }
        }
        
        if (request.getImportDate().getYear() > 2099) {
            throw new BusinessException("Năm nhập hàng không hợp lệ (tối đa 2099)");
        }

        if (request.getProductionDate() != null && request.getImportDate().isBefore(request.getProductionDate())) {
            throw new BusinessException("Ngày nhập hàng không thể trước ngày sản xuất");
        }
        
        if (request.getExpiryDate().getYear() > 2099) {
            throw new BusinessException("Năm hết hạn không hợp lệ (tối đa 2099)");
        }

        if (request.getExpiryDate().isBefore(request.getImportDate())
                || request.getExpiryDate().isEqual(request.getImportDate())) {
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

        // Re-evaluate status if stock is added back or expiry is updated
        if (batch.getRemainingQuantity() > 0) {
            if (!batch.getExpiryDate().isBefore(LocalDate.now())) {
                if (batch.getStatus() == BatchStatusEnum.DISCONTINUED || batch.getStatus() == BatchStatusEnum.EXPIRED) {
                    batch.setStatus(BatchStatusEnum.ACTIVE);
                }
            } else {
                batch.setStatus(BatchStatusEnum.EXPIRED);
            }
        } else {
            batch.setStatus(BatchStatusEnum.DISCONTINUED);
        }

        ProductBatch updatedBatch = Objects.requireNonNull(batchRepository.save(batch));
        return toResponse(updatedBatch);
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"products", "product_detail"}, allEntries = true)
    public void deleteBatch(Long id) {
        ProductBatch batch = findById(id);
        batchRepository.delete(Objects.requireNonNull(batch));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BatchResponse> getAllBatches(String query, Pageable pageable) {
        return batchRepository.searchBatches(query, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BatchResponse> getBatchesByProduct(Long productId, Pageable pageable) {
        return batchRepository.findByProductId(Objects.requireNonNull(productId), pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BatchResponse> getNearExpiryBatches(int days) {
        LocalDate warningDate = LocalDate.now().plusDays(days);
        return batchRepository.findBatchesNearExpiry(LocalDate.now(), warningDate)
                .stream().map(this::toResponse).toList();
    }

    /**
     * Xuất kho theo chiến lược FEFO.
     * 
     * @param productId ID sản phẩm cần trừ kho.
     * @param quantity  Số lượng cần trừ.
     * @return Số lượng còn lại (thường là 0 nếu thành công).
     * @throws InsufficientStockException Nếu tổng số lượng trong tất cả các lô
     *                                    không đủ.
     */
    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"products", "product_detail"}, allEntries = true)
    public int deductStock(Long productId, int quantity) {
        List<ProductBatch> batches = batchRepository.findAvailableBatchesFEFO(Objects.requireNonNull(productId), LocalDate.now());

        long totalAvailable = batches.stream()
                .mapToLong(b -> b.getRemainingQuantity().longValue())
                .sum();

        if (totalAvailable < quantity) {
            Product product = productRepository.findById(Objects.requireNonNull(productId))
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
        
        // Sync to Meilisearch and Cache
        Product product = productRepository.findById(Objects.requireNonNull(productId))
                .orElse(null);
        if (product != null) {
            searchService.indexProduct(productService.toResponse(product));
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
        Long total = batchRepository.sumRemainingQuantityByProductId(Objects.requireNonNull(productId), LocalDate.now());
        return total != null ? total : 0L;
    }

    /**
     * Hoàn kho khi đơn hàng bị hủy hoặc trả hàng.
     * Ưu tiên hoàn vào các lô hàng có hạn sử dụng xa nhất để tối ưu hóa thời gian
     * bán.
     */
    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"products", "product_detail"}, allEntries = true)
    public void returnStock(Long productId, int quantity) {
        // Find the latest active/discount batch to return stock to
        // We prefer returning to batches that are not about to expire soon (higher
        // expiry date)
        List<ProductBatch> batches = batchRepository.findAvailableBatchesFEFO(Objects.requireNonNull(productId), LocalDate.now());

        if (batches.isEmpty()) {
            // If no active batches, just find the most recent one created
            Page<ProductBatch> recent = batchRepository.findByProductId(Objects.requireNonNull(productId), Pageable.ofSize(1));
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
        
        // Sync to Meilisearch and Cache
        Product product = productRepository.findById(Objects.requireNonNull(productId))
                .orElse(null);
        if (product != null) {
            searchService.indexProduct(productService.toResponse(product));
        }
    }

    private ProductBatch findById(Long id) {
        return batchRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("ProductBatch", "id", id));
    }

    private BatchResponse toResponse(@NonNull ProductBatch batch) {
        int daysUntilExpiry = batch.getExpiryDate() != null
                ? (int) ChronoUnit.DAYS.between(LocalDate.now(), batch.getExpiryDate())
                : 0;

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
                .createdAt(batch.getCreatedAt())
                .build();
    }
}

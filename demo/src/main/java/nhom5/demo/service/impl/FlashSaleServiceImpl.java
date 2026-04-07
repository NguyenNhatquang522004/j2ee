package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.response.FlashSaleItemResponse;
import nhom5.demo.dto.response.FlashSaleResponse;
import nhom5.demo.dto.response.ProductResponse;
import nhom5.demo.entity.FlashSale;
import nhom5.demo.entity.FlashSaleItem;
import nhom5.demo.entity.Product;
import nhom5.demo.exception.BusinessException;
import nhom5.demo.exception.ResourceNotFoundException;
import nhom5.demo.repository.FlashSaleRepository;
import nhom5.demo.service.FlashSaleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;
import java.util.Objects;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@lombok.extern.slf4j.Slf4j
@Service
@RequiredArgsConstructor
public class FlashSaleServiceImpl implements FlashSaleService {

    private final FlashSaleRepository repository;
    private final nhom5.demo.repository.ProductRepository productRepository;
    private final nhom5.demo.service.NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public FlashSaleResponse getActiveFlashSale() {
        return repository.findActiveFlashSale(LocalDateTime.now())
                .map(fs -> this.convertToResponse(Objects.requireNonNull(fs)))
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlashSaleResponse> getUpcomingFlashSales() {
        return repository.findUpcomingFlashSales(LocalDateTime.now()).stream()
                .map(fs -> this.convertToResponse(Objects.requireNonNull(fs)))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FlashSale createFlashSale(FlashSale flashSale) {
        if (flashSale.getStartTime() == null || flashSale.getEndTime() == null) {
            throw new BusinessException("Thời gian bắt đầu và kết thúc không được để trống");
        }
        if (flashSale.getStartTime().isAfter(flashSale.getEndTime())) {
            throw new BusinessException("Thời gian bắt đầu phải trước thời gian kết thúc");
        }
        if (flashSale.getEndTime().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Thời gian kết thúc không thể ở trong quá khứ");
        }
        if (flashSale.getStartTime().getYear() > 2099 || flashSale.getEndTime().getYear() > 2099) {
            throw new BusinessException("Năm không hợp lệ (tối đa 2099)");
        }

        // Link items back to parent and ensure product is managed to avoid cascade-insert issues
        if (flashSale.getItems() != null) {
            flashSale.getItems().forEach(item -> {
                item.setFlashSale(flashSale);
                // Ensure product reference is managed
                if (item.getProduct() != null && item.getProduct().getId() != null) {
                    item.setProduct(productRepository.findById(Objects.requireNonNull(item.getProduct().getId()))
                        .orElseThrow(() -> new BusinessException("Sản phẩm không tồn tại: " + item.getProduct().getId())));
                }
            });
        }
        FlashSale saved = repository.save(flashSale);
        notificationService.broadcastFlashSaleRefresh();
        return saved;
    }

    @Override
    @Transactional
    public void deleteFlashSale(Long id) {
        repository.deleteById(Objects.requireNonNull(id));
        notificationService.broadcastFlashSaleRefresh();
    }

    @Override
    @Transactional
    public void toggleStatus(Long id) {
        FlashSale fs = repository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("FlashSale", "id", id));
        fs.setActive(!fs.isActive());
        repository.save(fs);
        notificationService.broadcastFlashSaleRefresh();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlashSaleResponse> getAllFlashSales() {
        return repository.findAll().stream()
                .map(fs -> this.convertToResponse(Objects.requireNonNull(fs)))
                .collect(Collectors.toList());
    }

    private FlashSaleResponse convertToResponse(@NonNull FlashSale flashSale) {
        return FlashSaleResponse.builder()
                .id(flashSale.getId())
                .name(flashSale.getName())
                .startTime(flashSale.getStartTime())
                .endTime(flashSale.getEndTime())
                .description(flashSale.getDescription())
                .items(Objects.requireNonNull(flashSale.getItems()).stream()
                        .filter(item -> item.getProduct() != null && 
                                      (item.getProduct().getIsActive() == null || item.getProduct().getIsActive()))
                        .map(this::convertItemToResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private FlashSaleItemResponse convertItemToResponse(@NonNull FlashSaleItem item) {
        Product p = Objects.requireNonNull(item.getProduct());
        ProductResponse pr = ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .price(p.getPrice())
                .imageUrl(p.getImageUrl())
                .unit(p.getUnit())
                .build();

        return FlashSaleItemResponse.builder()
                .id(item.getId())
                .product(pr)
                .flashSalePrice(item.getFlashSalePrice())
                .quantityLimit(item.getQuantityLimit())
                .soldQuantity(item.getSoldQuantity())
                .remainingQuantity(item.getRemainingQuantity())
                .build();
    }

    @Override
    @Transactional
    public FlashSale updateFlashSale(Long id, FlashSale flashSale) {
        FlashSale existing = repository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("FlashSale", "id", id));
        
        if (flashSale.getStartTime() != null) existing.setStartTime(flashSale.getStartTime());
        if (flashSale.getEndTime() != null) existing.setEndTime(flashSale.getEndTime());
        if (flashSale.getName() != null) existing.setName(flashSale.getName());
        if (flashSale.getDescription() != null) existing.setDescription(flashSale.getDescription());
        
        // Update items: Simple strategy - clear and re-add for admin ease
        if (flashSale.getItems() != null) {
            existing.getItems().clear();
            flashSale.getItems().forEach(item -> {
                item.setFlashSale(existing);
                if (item.getProduct() != null && item.getProduct().getId() != null) {
                    item.setProduct(productRepository.findById(Objects.requireNonNull(item.getProduct().getId()))
                        .orElseThrow(() -> new BusinessException("Sản phẩm không tồn tại: " + item.getProduct().getId())));
                }
                existing.getItems().add(item);
            });
        }
        
        FlashSale saved = Objects.requireNonNull(repository.save(existing));
        notificationService.broadcastFlashSaleRefresh();
        return saved;
    }

    @Override
    @Transactional
    public void deactivateExpiredFlashSales() {
        int count = repository.deactivateExpiredFlashSales(LocalDateTime.now());
        if (count > 0) {
            log.info("Đã tự động vô hiệu hóa {} chương trình Flash Sale quá hạn", count);
            notificationService.broadcastFlashSaleRefresh();
        }
    }
}

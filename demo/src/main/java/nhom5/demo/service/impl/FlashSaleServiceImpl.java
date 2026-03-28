package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.response.FlashSaleItemResponse;
import nhom5.demo.dto.response.FlashSaleResponse;
import nhom5.demo.dto.response.ProductResponse;
import nhom5.demo.entity.FlashSale;
import nhom5.demo.entity.FlashSaleItem;
import nhom5.demo.entity.Product;
import nhom5.demo.exception.ResourceNotFoundException;
import nhom5.demo.repository.FlashSaleRepository;
import nhom5.demo.service.FlashSaleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlashSaleServiceImpl implements FlashSaleService {

    private final FlashSaleRepository repository;

    @Override
    @Transactional(readOnly = true)
    public FlashSaleResponse getActiveFlashSale() {
        return repository.findActiveFlashSale(LocalDateTime.now())
                .map(this::convertToResponse)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlashSaleResponse> getUpcomingFlashSales() {
        return repository.findUpcomingFlashSales(LocalDateTime.now()).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FlashSale createFlashSale(FlashSale flashSale) {
        // Link items back to parent
        if (flashSale.getItems() != null) {
            flashSale.getItems().forEach(item -> item.setFlashSale(flashSale));
        }
        return repository.save(flashSale);
    }

    @Override
    @Transactional
    public void deleteFlashSale(Long id) {
        repository.deleteById(id);
    }

    @Override
    @Transactional
    public void toggleStatus(Long id) {
        FlashSale fs = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FlashSale", "id", id));
        fs.setActive(!fs.isActive());
        repository.save(fs);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlashSaleResponse> getAllFlashSales() {
        return repository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private FlashSaleResponse convertToResponse(FlashSale flashSale) {
        return FlashSaleResponse.builder()
                .id(flashSale.getId())
                .name(flashSale.getName())
                .startTime(flashSale.getStartTime())
                .endTime(flashSale.getEndTime())
                .description(flashSale.getDescription())
                .items(flashSale.getItems().stream().map(this::convertItemToResponse).collect(Collectors.toList()))
                .build();
    }

    private FlashSaleItemResponse convertItemToResponse(FlashSaleItem item) {
        Product p = item.getProduct();
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
}

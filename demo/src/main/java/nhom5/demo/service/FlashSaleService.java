package nhom5.demo.service;

import nhom5.demo.dto.response.FlashSaleResponse;
import nhom5.demo.entity.FlashSale;
import java.util.List;

public interface FlashSaleService {
    FlashSaleResponse getActiveFlashSale();
    List<FlashSaleResponse> getUpcomingFlashSales();
    
    // Admin methods
    FlashSale createFlashSale(FlashSale flashSale);
    FlashSale updateFlashSale(Long id, FlashSale flashSale);
    void deleteFlashSale(Long id);
    void toggleStatus(Long id);
    List<FlashSaleResponse> getAllFlashSales();
    void deactivateExpiredFlashSales();
}

package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.dto.response.FlashSaleResponse;
import nhom5.demo.entity.FlashSale;
import nhom5.demo.service.FlashSaleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "FlashSale", description = "Quản lý Flash Sale")
@RestController
@RequestMapping("/api/v1/flash-sales")
@RequiredArgsConstructor
public class FlashSaleController {

    private final FlashSaleService flashSaleService;
    
    @Operation(summary = "Lấy tất cả Flash Sale (Admin)")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<FlashSaleResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(flashSaleService.getAllFlashSales()));
    }

    @Operation(summary = "Lấy Flash Sale đang diễn ra (Public)")
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<FlashSaleResponse>> getActive() {
        return ResponseEntity.ok(ApiResponse.success(flashSaleService.getActiveFlashSale()));
    }

    @Operation(summary = "Lấy các Flash Sale sắp tới (Public)")
    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<FlashSaleResponse>>> getUpcoming() {
        return ResponseEntity.ok(ApiResponse.success(flashSaleService.getUpcomingFlashSales()));
    }

    @Operation(summary = "Tạo Flash Sale mới (Admin)")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FlashSale>> create(@RequestBody FlashSale flashSale) {
        return ResponseEntity.ok(ApiResponse.success("Đã tạo Flash Sale thành công", flashSaleService.createFlashSale(flashSale)));
    }

    @Operation(summary = "Xoá Flash Sale (Admin)")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        flashSaleService.deleteFlashSale(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xoá Flash Sale", null));
    }

    @Operation(summary = "Bật/tắt trạng thái Flash Sale (Admin)")
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> toggle(@PathVariable Long id) {
        flashSaleService.toggleStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật trạng thái Flash Sale", null));
    }
}

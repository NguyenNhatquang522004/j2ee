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
import java.util.Objects;

/**
 * REST CONTROLLER: FlashSaleController
 * ---------------------------------------------------------
 * Manages high-velocity promotional events.
 * Handles the creation, tracking, and visibility of time-limited discount campaigns.
 * 
 * Visibility:
 * - Public: Current and upcoming active sales.
 * - Admin: Full lifecycle control (Create, Toggle, Delete).
 */
@Tag(name = "FlashSale", description = "Quản lý Flash Sale")
@RestController
@RequestMapping("/api/v1/flash-sales")
@RequiredArgsConstructor
public class FlashSaleController {

    private final FlashSaleService flashSaleService;
    
    /**
     * getAll: Comprehensive list of all past, present, and future flash sales.
     */
    @Operation(summary = "Lấy tất cả Flash Sale (Admin)")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<FlashSaleResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(flashSaleService.getAllFlashSales()));
    }

    /**
     * getActive: Retrieves the sale currently accepting orders with discounted prices.
     */
    @Operation(summary = "Lấy Flash Sale đang diễn ra (Public)")
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<FlashSaleResponse>> getActive() {
        return ResponseEntity.ok(ApiResponse.success(flashSaleService.getActiveFlashSale()));
    }

    /**
     * getUpcoming: Returns a preview of scheduled sales for marketing purposes.
     */
    @Operation(summary = "Lấy các Flash Sale sắp tới (Public)")
    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<FlashSaleResponse>>> getUpcoming() {
        return ResponseEntity.ok(ApiResponse.success(flashSaleService.getUpcomingFlashSales()));
    }

    /**
     * create: Registers a new promotional campaign.
     * Enforces strict validation of start/end timestamps via the service layer.
     */
    @Operation(summary = "Tạo Flash Sale mới (Admin)")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FlashSale>> create(@RequestBody FlashSale flashSale) {
        return ResponseEntity.ok(ApiResponse.success("Đã tạo Flash Sale thành công", flashSaleService.createFlashSale(Objects.requireNonNull(flashSale))));
    }

    /**
     * delete: Permanent removal of a flash sale record.
     */
    @Operation(summary = "Xoá Flash Sale (Admin)")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        flashSaleService.deleteFlashSale(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.success("Đã xoá Flash Sale", null));
    }

    /**
     * toggle: Soft-enable/disable of a scheduled sale event.
     */
    @Operation(summary = "Bật/tắt trạng thái Flash Sale (Admin)")
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> toggle(@PathVariable Long id) {
        flashSaleService.toggleStatus(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật trạng thái Flash Sale", null));
    }
}

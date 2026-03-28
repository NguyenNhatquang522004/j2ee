package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nhom5.demo.constant.AppConstants;
import nhom5.demo.dto.request.BatchRequest;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.dto.response.BatchResponse;
import nhom5.demo.service.BatchService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Batches", description = "Quản lý lô hàng (Admin)")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping(AppConstants.BATCH_PATH)
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;

    @Operation(summary = "Thêm lô hàng mới")
    @PostMapping
    public ResponseEntity<ApiResponse<BatchResponse>> addBatch(
            @Valid @RequestBody BatchRequest request) {
        BatchResponse data = batchService.addBatch(request);
        return ResponseEntity.status(201).body(ApiResponse.created(data));
    }

    @Operation(summary = "Danh sách tất cả lô hàng (Admin)")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<BatchResponse>>> getAllBatches(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "expiryDate") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(ApiResponse.success(batchService.getAllBatches(query, pageable)));
    }

    @Operation(summary = "Chi tiết lô hàng theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BatchResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(batchService.getBatchById(id)));
    }

    @Operation(summary = "Danh sách lô hàng theo sản phẩm")
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Page<BatchResponse>>> getByProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "expiryDate") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<BatchResponse> data = batchService.getBatchesByProduct(productId, pageable);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @Operation(summary = "Danh sách lô hàng sắp hết hạn")
    @GetMapping("/near-expiry")
    public ResponseEntity<ApiResponse<List<BatchResponse>>> getNearExpiry(
            @RequestParam(defaultValue = "3") int days) {
        List<BatchResponse> data = batchService.getNearExpiryBatches(days);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @Operation(summary = "Cập nhật lô hàng")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BatchResponse>> updateBatch(
            @PathVariable Long id,
            @Valid @RequestBody BatchRequest request) {
        BatchResponse data = batchService.updateBatch(id, request);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @Operation(summary = "Xóa lô hàng")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBatch(@PathVariable Long id) {
        batchService.deleteBatch(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Tổng tồn kho của sản phẩm")
    @GetMapping("/stock/{productId}")
    public ResponseEntity<ApiResponse<Long>> getTotalStock(@PathVariable Long productId) {
        long stock = batchService.getTotalStock(productId);
        return ResponseEntity.ok(ApiResponse.success(stock));
    }
}

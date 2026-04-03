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
import java.util.Objects;

/**
 * REST CONTROLLER: BatchController
 * ---------------------------------------------------------
 * Manages physical inventory batches for products.
 * Handles stock intake, expiration dates, and real-time inventory levels.
 * 
 * Safety Logic: Ensures products are tracked by batch ID at the warehouse level.
 */
@Tag(name = "Batches", description = "Quản lý lô hàng (Admin)")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping(AppConstants.BATCH_PATH)
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;

    /**
     * addBatch: Registers a new intake of product inventory.
     */
    @Operation(summary = "Thêm lô hàng mới")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'manage:batches')")
    @PostMapping
    public ResponseEntity<ApiResponse<BatchResponse>> addBatch(
            @Valid @RequestBody BatchRequest request) {
        BatchResponse data = batchService.addBatch(Objects.requireNonNull(request));
        return ResponseEntity.status(201).body(ApiResponse.created(data));
    }

    /**
     * getAllBatches: Paginated overview of all registered batches in the system.
     */
    @Operation(summary = "Danh sách tất cả lô hàng (Admin)")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'view:batches', 'manage:batches')")
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

    /**
     * getById: Direct lookup for a specific intake batch.
     */
    @Operation(summary = "Chi tiết lô hàng theo ID")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'view:batches', 'manage:batches')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BatchResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(batchService.getBatchById(Objects.requireNonNull(id))));
    }

    /**
     * getByProduct: Retrieves inventory history for a specific catalog item.
     */
    @Operation(summary = "Danh sách lô hàng theo sản phẩm")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'view:batches', 'manage:batches')")
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Page<BatchResponse>>> getByProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "expiryDate") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<BatchResponse> data = batchService.getBatchesByProduct(Objects.requireNonNull(productId), pageable);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * getNearExpiry: Proactive alert system for items reaching their best-before date.
     */
    @Operation(summary = "Danh sách lô hàng sắp hết hạn")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'view:batches', 'manage:batches')")
    @GetMapping("/near-expiry")
    public ResponseEntity<ApiResponse<List<BatchResponse>>> getNearExpiry(
            @RequestParam(defaultValue = "3") int days) {
        List<BatchResponse> data = batchService.getNearExpiryBatches(days);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * updateBatch: Modifies existing batch data (Quantity, Price, Expiry).
     */
    @Operation(summary = "Cập nhật lô hàng")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'manage:batches')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BatchResponse>> updateBatch(
            @PathVariable Long id,
            @Valid @RequestBody BatchRequest request) {
        BatchResponse data = batchService.updateBatch(Objects.requireNonNull(id), Objects.requireNonNull(request));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * deleteBatch: Removes an intake record from the database.
     */
    @Operation(summary = "Xóa lô hàng")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'manage:batches')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBatch(@PathVariable Long id) {
        batchService.deleteBatch(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * getTotalStock: Aggregates inventory volume across all active batches for a single product.
     */
    @Operation(summary = "Tổng tồn kho của sản phẩm")
    @GetMapping("/stock/{productId}")
    public ResponseEntity<ApiResponse<Long>> getTotalStock(@PathVariable Long productId) {
        long stock = batchService.getTotalStock(Objects.requireNonNull(productId));
        return ResponseEntity.ok(ApiResponse.success(stock));
    }
}

package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nhom5.demo.constant.AppConstants;
import nhom5.demo.dto.request.FarmRequest;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.dto.response.FarmResponse;
import nhom5.demo.service.FarmService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import java.util.Objects;

/**
 * REST CONTROLLER: FarmController
 * ---------------------------------------------------------
 * Manages the origin points of FreshFood inventory.
 * Provides transparency into where products are sourced from and identifies key agricultural partners.
 * 
 * Visibility:
 * - Public: Search and view active farming partners.
 * - Admin: Full registry control (Create, Update, Delete).
 */
@Tag(name = "Farms", description = "Quản lý trang trại")
@RestController
@RequestMapping(AppConstants.FARM_PATH)
@RequiredArgsConstructor
public class FarmController {

    private final FarmService farmService;

    /**
     * getActiveFarms: Paginated catalog of current farming partners.
     * Supports filtering by farm name for quick direct-sourcing research.
     */
    @Operation(summary = "Danh sách trang trại đang hoạt động (public)")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<FarmResponse>>> getActiveFarms(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<FarmResponse> data = (name != null && !name.isBlank())
                ? farmService.searchFarms(name, pageable)
                : farmService.getActiveFarms(pageable);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * getById: Retrieves the full profile of a specific farm, including location and contact history.
     */
    @Operation(summary = "Chi tiết trang trại (public)")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FarmResponse>> getById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(ApiResponse.success(farmService.getFarmById(Objects.requireNonNull(id))));
    }

    /**
     * create: Archives a new farming partnership in the system.
     */
    @Operation(summary = "Tạo trang trại mới (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping
    public ResponseEntity<ApiResponse<FarmResponse>> create(
            @Valid @RequestBody @NonNull FarmRequest request) {
        FarmResponse data = farmService.createFarm(Objects.requireNonNull(request));
        return ResponseEntity.status(201).body(ApiResponse.created(data));
    }

    /**
     * update: Updates metadata regarding a farm's status or certification levels.
     */
    @Operation(summary = "Cập nhật trang trại (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FarmResponse>> update(
            @PathVariable @NonNull Long id,
            @Valid @RequestBody @NonNull FarmRequest request) {
        return ResponseEntity.ok(ApiResponse.success(farmService.updateFarm(Objects.requireNonNull(id), Objects.requireNonNull(request))));
    }

    /**
     * delete: Permanent removal of a farm from the active registry.
     */
    @Operation(summary = "Xoá trang trại (Admin)")
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable @NonNull Long id) {
        farmService.deleteFarm(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.success("Xoá trang trại thành công", null));
    }
}

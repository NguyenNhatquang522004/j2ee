package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.request.AddressRequest;
import nhom5.demo.dto.response.AddressResponse;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.service.AddressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;
import java.util.Objects;

import java.util.List;

/**
 * REST CONTROLLER: AddressController
 * ---------------------------------------------------------
 * Manages physical locations for order delivery.
 * Every operation enforces ownership validation by tying the address to the authenticated UserDetails.
 * 
 * Capabilities:
 * - Multi-address management per user.
 * - Single default address selection for optimized checkout.
 */
@Tag(name = "Address", description = "Quản lý địa chỉ giao hàng của người dùng")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    /**
     * getMyAddresses: Returns all delivery locations registered by the current user.
     */
    @Operation(summary = "Lấy danh sách địa chỉ của tôi")
    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getMyAddresses(
            @AuthenticationPrincipal @NonNull UserDetails userDetails) {
        List<AddressResponse> data = addressService.getMyAddresses(Objects.requireNonNull(userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * addAddress: Registers a new landing spot for fresh food deliveries.
     */
    @Operation(summary = "Thêm địa chỉ mới")
    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(
            @AuthenticationPrincipal @NonNull UserDetails userDetails,
            @Valid @RequestBody @NonNull AddressRequest request) {
        AddressResponse data = addressService.addAddress(Objects.requireNonNull(userDetails.getUsername()), Objects.requireNonNull(request));
        return ResponseEntity.ok(ApiResponse.success("Đã thêm địa chỉ", data));
    }

    /**
     * updateAddress: Modifies details of an existing location.
     * Enforces ownership to prevent malicious cross-user address modification.
     */
    @Operation(summary = "Cập nhật địa chỉ")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @PathVariable @NonNull Long id,
            @AuthenticationPrincipal @NonNull UserDetails userDetails,
            @Valid @RequestBody @NonNull AddressRequest request) {
        AddressResponse data = addressService.updateAddress(Objects.requireNonNull(id), Objects.requireNonNull(userDetails.getUsername()), Objects.requireNonNull(request));
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật địa chỉ", data));
    }

    /**
     * setDefault: Promotes a specific address to be the primary choice for future orders.
     */
    @Operation(summary = "Thiết lập địa chỉ mặc định")
    @PatchMapping("/{id}/default")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefault(
            @PathVariable @NonNull Long id,
            @AuthenticationPrincipal @NonNull UserDetails userDetails) {
        AddressResponse data = addressService.setDefault(Objects.requireNonNull(id), Objects.requireNonNull(userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success("Đã đặt làm mặc định", data));
    }

    /**
     * deleteAddress: Permanent removal of a shipping coordinate.
     */
    @Operation(summary = "Xoá địa chỉ")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @PathVariable @NonNull Long id,
            @AuthenticationPrincipal @NonNull UserDetails userDetails) {
        addressService.deleteAddress(Objects.requireNonNull(id), Objects.requireNonNull(userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success("Đã xoá địa chỉ", null));
    }
}

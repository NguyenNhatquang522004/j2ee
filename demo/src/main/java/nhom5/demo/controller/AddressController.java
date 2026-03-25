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

import java.util.List;

@Tag(name = "Address", description = "Quản lý địa chỉ giao hàng của người dùng")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @Operation(summary = "Lấy danh sách địa chỉ của tôi")
    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getMyAddresses(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<AddressResponse> data = addressService.getMyAddresses(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @Operation(summary = "Thêm địa chỉ mới")
    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AddressRequest request) {
        AddressResponse data = addressService.addAddress(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Đã thêm địa chỉ", data));
    }

    @Operation(summary = "Cập nhật địa chỉ")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AddressRequest request) {
        AddressResponse data = addressService.updateAddress(id, userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật địa chỉ", data));
    }

    @Operation(summary = "Thiết lập địa chỉ mặc định")
    @PatchMapping("/{id}/default")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefault(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        AddressResponse data = addressService.setDefault(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Đã đặt làm mặc định", data));
    }

    @Operation(summary = "Xoá địa chỉ")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        addressService.deleteAddress(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Đã xoá địa chỉ", null));
    }
}

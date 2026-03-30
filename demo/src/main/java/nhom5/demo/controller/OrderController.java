package nhom5.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nhom5.demo.constant.AppConstants;
import nhom5.demo.dto.request.OrderRequest;
import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.dto.response.OrderResponse;
import nhom5.demo.enums.OrderStatusEnum;
import nhom5.demo.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Orders", description = "Quản lý đơn hàng")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping(AppConstants.ORDER_PATH)
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "Đặt hàng mới")
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OrderRequest request) {
        OrderResponse data = orderService.createOrder(userDetails.getUsername(), request);
        return ResponseEntity.status(201).body(ApiResponse.created(data));
    }

    @Operation(summary = "Lịch sử đơn hàng của tôi")
    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OrderResponse> data = orderService.getOrdersByUser(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @Operation(summary = "Danh sách yêu cầu hoàn trả/hoàn tiền (Admin)")
    @PreAuthorize("hasAnyAuthority('manage:orders', 'manage:refunds')")
    @GetMapping("/refund-requests")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getRefundRequests(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<OrderResponse> data = orderService.getRefundRequests(query, pageable);
        return ResponseEntity.ok(ApiResponse.success(data));
    }



    @Operation(summary = "Chi tiết đơn hàng")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        OrderResponse data = orderService.getOrderById(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @Operation(summary = "Tất cả đơn hàng (Admin)")
    @PreAuthorize("hasAuthority('manage:orders')")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAllOrders(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) OrderStatusEnum status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<OrderResponse> data = orderService.getAllOrders(query, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @Operation(summary = "Cập nhật trạng thái đơn hàng (Admin)")
    @PreAuthorize("hasAuthority('manage:orders')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatusEnum status) {
        OrderResponse data = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", data));
    }

    @Operation(summary = "Huỷ đơn hàng")
    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        orderService.cancelOrder(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Đơn hàng đã được huỷ", null));
    }

    @Operation(summary = "Hoàn tiền đơn hàng (Admin)")
    @PreAuthorize("hasAnyAuthority('manage:orders', 'manage:refunds')")
    @PostMapping("/{id}/refund")
    public ResponseEntity<ApiResponse<OrderResponse>> refundOrder(
            @PathVariable Long id) {
        OrderResponse data = orderService.markAsRefunded(id);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu hoàn tiền cho đơn hàng", data));
    }

    @Operation(summary = "Yêu cầu trả hàng")
    @PostMapping("/{id}/return")
    public ResponseEntity<ApiResponse<OrderResponse>> requestReturn(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            @RequestParam(required = false) String returnMedia,
            @AuthenticationPrincipal UserDetails userDetails) {
        OrderResponse data = orderService.requestReturn(id, reason, returnMedia, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Gửi yêu cầu trả hàng thành công", data));
    }



    @Operation(summary = "Xác nhận trả hàng (Admin)")
    @PreAuthorize("hasAnyAuthority('manage:orders', 'manage:refunds')")
    @PostMapping("/{id}/confirm-return")
    public ResponseEntity<ApiResponse<OrderResponse>> confirmReturn(
            @PathVariable Long id) {
        OrderResponse data = orderService.confirmReturn(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xác nhận trả hàng", data));
    }

    @Operation(summary = "Từ chối trả hàng (Admin)")
    @PreAuthorize("hasAnyAuthority('manage:orders', 'manage:refunds')")
    @PostMapping("/{id}/reject-return")
    public ResponseEntity<ApiResponse<OrderResponse>> rejectReturn(
            @PathVariable Long id,
            @RequestParam String reason) {
        OrderResponse data = orderService.rejectReturn(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Đã từ chối yêu cầu trả hàng", data));
    }
}

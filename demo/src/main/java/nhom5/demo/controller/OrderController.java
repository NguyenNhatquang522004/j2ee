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
import org.springframework.lang.NonNull;
import java.util.Objects;

/**
 * REST CONTROLLER: OrderController
 * ---------------------------------------------------------
 * Orchestrates the full lifecycle of customer transactions within the FreshFood ecosystem.
 * Manages order creation, payment status tracking, fulfillment updates, and complex return/refund workflows.
 * 
 * Security: Protects individual data with ownership checks and restricts bulk/status operations to authorized staff.
 */
@Tag(name = "Orders", description = "Quản lý đơn hàng")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping(AppConstants.ORDER_PATH)
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * createOrder: Converts a shopping cart into a finalized purchase record.
     * Triggers inventory reservation and payment processing flows.
     */
    @Operation(summary = "Đặt hàng mới")
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @AuthenticationPrincipal @NonNull UserDetails userDetails,
            @Valid @RequestBody @NonNull OrderRequest request) {
        OrderResponse data = orderService.createOrder(Objects.requireNonNull(userDetails.getUsername()), Objects.requireNonNull(request));
        return ResponseEntity.status(201).body(ApiResponse.created(data));
    }

    /**
     * getMyOrders: Retrieves a paginated history of purchases made by the currently authenticated user.
     */
    @Operation(summary = "Lịch sử đơn hàng của tôi")
    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal @NonNull UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OrderResponse> data = orderService.getOrdersByUser(Objects.requireNonNull(userDetails.getUsername()), pageable);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * getRefundRequests: Administrative queue for pending returns and refund assessments.
     * Visibility: Restricted to Staff/Admin with 'manage:refunds' authority.
     */
    @Operation(summary = "Danh sách yêu cầu hoàn trả/hoàn tiền (Admin)")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'manage:orders', 'view:orders', 'manage:refunds')")
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
    
    /**
     * getOrderById: Detailed lookup for a single transaction. Enforces ownership or admin role.
     */
    @Operation(summary = "Chi tiết đơn hàng (theo ID)")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @PathVariable @NonNull Long id,
            @AuthenticationPrincipal @NonNull UserDetails userDetails) {
        OrderResponse data = orderService.getOrderById(Objects.requireNonNull(id), Objects.requireNonNull(userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * getOrder: Alternate lookup using the human-readable Order Code (e.g., ORD-12345).
     */
    @Operation(summary = "Chi tiết đơn hàng (theo mã đơn)")
    @GetMapping("/code/{orderCode}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            @PathVariable @NonNull String orderCode,
            @AuthenticationPrincipal @NonNull UserDetails userDetails) {
        OrderResponse data = orderService.getOrderByCode(Objects.requireNonNull(orderCode), Objects.requireNonNull(userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * getAllOrders: Master list of all transactions for administrative oversight and bulk management.
     */
    @Operation(summary = "Tất cả đơn hàng (Admin)")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'manage:orders', 'view:orders')")
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

    /**
     * updateStatus: Administrative action to transition an order through its lifecycle statuses.
     */
    @Operation(summary = "Cập nhật trạng thái đơn hàng (Admin)")
    @PreAuthorize("hasAuthority('manage:orders')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable @NonNull Long id,
            @RequestParam @NonNull OrderStatusEnum status) {
        OrderResponse data = orderService.updateOrderStatus(Objects.requireNonNull(id), Objects.requireNonNull(status));
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", data));
    }

    /**
     * cancelOrderByCode: Allows a user to void an order before it enters the processing phase.
     */
    @Operation(summary = "Huỷ đơn hàng (theo mã đơn)")
    @DeleteMapping("/code/{orderCode}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelOrderByCode(
            @PathVariable @NonNull String orderCode,
            @AuthenticationPrincipal @NonNull UserDetails userDetails) {
        orderService.cancelOrder(Objects.requireNonNull(orderCode), Objects.requireNonNull(userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success("Đơn hàng đã được huỷ", null));
    }

    /**
     * cancelOrderById: Convenience wrapper for cancellation via internal Database ID.
     */
    @Operation(summary = "Huỷ đơn hàng (theo ID)")
    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelOrderById(
            @PathVariable @NonNull Long id,
            @AuthenticationPrincipal @NonNull UserDetails userDetails) {
        OrderResponse order = orderService.getOrderById(Objects.requireNonNull(id), Objects.requireNonNull(userDetails.getUsername()));
        orderService.cancelOrder(Objects.requireNonNull(order.getOrderCode()), Objects.requireNonNull(userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success("Đơn hàng đã được huỷ", null));
    }

    /**
     * refundOrder: Triggers the financial reversal for a paid purchase.
     */
    @Operation(summary = "Hoàn tiền đơn hàng (Admin)")
    @PreAuthorize("hasAnyAuthority('manage:orders', 'manage:refunds')")
    @PostMapping("/{id}/refund")
    public ResponseEntity<ApiResponse<OrderResponse>> refundOrder(
            @PathVariable @NonNull Long id) {
        OrderResponse data = orderService.markAsRefunded(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu hoàn tiền cho đơn hàng", data));
    }

    /**
     * requestReturnByCode: Customer-initiated workflow to return physically delivered goods.
     */
    @Operation(summary = "Yêu cầu trả hàng (theo mã đơn)")
    @PostMapping("/code/{orderCode}/return")
    public ResponseEntity<ApiResponse<OrderResponse>> requestReturnByCode(
            @PathVariable @NonNull String orderCode,
            @RequestParam(required = false) String reason,
            @RequestParam(required = false) String returnMedia,
            @AuthenticationPrincipal @NonNull UserDetails userDetails) {
        OrderResponse data = orderService.requestReturn(Objects.requireNonNull(orderCode), reason, returnMedia, Objects.requireNonNull(userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success("Gửi yêu cầu trả hàng thành công", data));
    }

    /**
     * requestReturnById: Convenience wrapper for returns via internal Database ID.
     */
    @Operation(summary = "Yêu cầu trả hàng (theo ID)")
    @PostMapping("/{id}/return")
    public ResponseEntity<ApiResponse<OrderResponse>> requestReturnById(
            @PathVariable @NonNull Long id,
            @RequestParam(required = false) String reason,
            @RequestParam(required = false) String returnMedia,
            @AuthenticationPrincipal @NonNull UserDetails userDetails) {
        OrderResponse order = orderService.getOrderById(Objects.requireNonNull(id), Objects.requireNonNull(userDetails.getUsername()));
        OrderResponse data = orderService.requestReturn(Objects.requireNonNull(order.getOrderCode()), reason, returnMedia, Objects.requireNonNull(userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success("Gửi yêu cầu trả hàng thành công", data));
    }

    /**
     * confirmReturn: Administrative approval of a return request after verifying item status.
     */
    @Operation(summary = "Xác nhận trả hàng (Admin)")
    @PreAuthorize("hasAnyAuthority('manage:orders', 'manage:refunds')")
    @PostMapping("/{id}/confirm-return")
    public ResponseEntity<ApiResponse<OrderResponse>> confirmReturn(
            @PathVariable @NonNull Long id) {
        OrderResponse data = orderService.confirmReturn(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.success("Đã xác nhận trả hàng", data));
    }

    /**
     * rejectReturn: Administrative denial of a return request, requiring a formal reason.
     */
    @Operation(summary = "Từ chối trả hàng (Admin)")
    @PreAuthorize("hasAnyAuthority('manage:orders', 'manage:refunds')")
    @PostMapping("/{id}/reject-return")
    public ResponseEntity<ApiResponse<OrderResponse>> rejectReturn(
            @PathVariable @NonNull Long id,
            @RequestParam @NonNull String reason) {
        OrderResponse data = orderService.rejectReturn(Objects.requireNonNull(id), Objects.requireNonNull(reason));
        return ResponseEntity.ok(ApiResponse.success("Đã từ chối yêu cầu trả hàng", data));
    }
}

package nhom5.demo.controller;

import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.dto.response.UserResponse;
import nhom5.demo.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile(ud.getUsername())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@AuthenticationPrincipal UserDetails ud, @RequestBody nhom5.demo.dto.request.UserUpdateRequest r) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateProfile(ud.getUsername(), r)));
    }

    @PostMapping("/me/logout-all")
    public ResponseEntity<ApiResponse<Void>> logoutAll(@AuthenticationPrincipal UserDetails ud) {
        userService.logoutAllDevices(ud.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PreAuthorize("hasAuthority('manage:users')")
    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getStaff(@RequestParam(defaultValue="0") int p, @RequestParam(defaultValue="10") int s) {
        return ResponseEntity.ok(ApiResponse.success(userService.getStaff(PageRequest.of(p, s))));
    }

    @PreAuthorize("hasAuthority('manage:users')")
    @PostMapping("/staff/create")
    public ResponseEntity<ApiResponse<UserResponse>> postStaff(@RequestBody nhom5.demo.dto.request.RegisterRequest r) {
        return ResponseEntity.status(210).body(ApiResponse.created(userService.createStaff(r, nhom5.demo.enums.RoleEnum.ROLE_STAFF)));
    }

    @PreAuthorize("hasAuthority('manage:users')")
    @PatchMapping("/{id:\\d+}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> patchStatus(@PathVariable Long id) {
        userService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PreAuthorize("hasAuthority('manage:users')")
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<UserResponse>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PreAuthorize("hasAuthority('manage:users')")
    @PutMapping("/{id:\\d+}/admin")
    public ResponseEntity<ApiResponse<UserResponse>> putAdmin(@PathVariable Long id, @RequestBody nhom5.demo.dto.request.AdminUserUpdateRequest r) {
        return ResponseEntity.ok(ApiResponse.success(userService.adminUpdateUser(id, r)));
    }

    @PreAuthorize("hasAuthority('manage:users')")
    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<Void>> delOne(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

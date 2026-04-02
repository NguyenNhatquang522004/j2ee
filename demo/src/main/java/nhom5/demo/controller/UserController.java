package nhom5.demo.controller;

import nhom5.demo.dto.response.ApiResponse;
import nhom5.demo.dto.response.UserResponse;
import nhom5.demo.dto.request.UserUpdateRequest;
import nhom5.demo.dto.request.RegisterRequest;
import nhom5.demo.dto.request.AdminUserUpdateRequest;
import nhom5.demo.service.UserService;
import nhom5.demo.enums.RoleEnum;
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
import jakarta.validation.Valid;
import java.util.Objects;

/**
 * REST CONTROLLER: UserController
 * ---------------------------------------------------------
 * Manages user accounts and administrative staff oversight.
 * 
 * Capabilities:
 * - Profile: Self-service for authenticated users (update info, avatar, security).
 * - Admin: High-level management of user status, role assignment, and account deletion.
 * 
 * Security: Enforces 'manage:users' permission for administrative endpoints.
 */
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * getAll: Paginated search of the user database. Accessible only by privileged admins.
     */
    @PreAuthorize("hasAuthority('manage:users')")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAll(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) RoleEnum role,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="10") int size,
            @RequestParam(defaultValue="createdAt") String sortBy,
            @RequestParam(defaultValue="desc") String direction) {
        
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers(query, role, isActive, pageable)));
    }

    /**
     * getProfile: Retrieves the detailed account info for the currently authenticated session.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(@AuthenticationPrincipal @NonNull UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile(Objects.requireNonNull(ud.getUsername()))));
    }

    /**
     * updateProfile: Updates personal metadata for the current user.
     */
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal @NonNull UserDetails ud, 
            @RequestBody @NonNull UserUpdateRequest r) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateProfile(Objects.requireNonNull(ud.getUsername()), Objects.requireNonNull(r))));
    }

    /**
     * updateAvatar: Uploads and refreshes the user's profile picture.
     * @throws java.io.IOException if the file stream is corrupted.
     */
    @PostMapping("/me/avatar")
    public ResponseEntity<ApiResponse<UserResponse>> updateAvatar(
            @AuthenticationPrincipal @NonNull UserDetails ud,
            @RequestParam("file") @NonNull org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        return ResponseEntity.ok(ApiResponse.success(userService.updateAvatar(Objects.requireNonNull(ud.getUsername()), Objects.requireNonNull(file))));
    }

    /**
     * deleteAvatar: Reverts to the default profile icon by removing the custom avatar.
     */
    @DeleteMapping("/me/avatar")
    public ResponseEntity<ApiResponse<UserResponse>> deleteAvatar(@AuthenticationPrincipal @NonNull UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(userService.deleteAvatar(Objects.requireNonNull(ud.getUsername()))));
    }

    /**
     * logoutAll: Revokes tokens across all active sessions for the current user (Nuclear Logout).
     */
    @PostMapping("/me/logout-all")
    public ResponseEntity<ApiResponse<Void>> logoutAll(@AuthenticationPrincipal @NonNull UserDetails ud) {
        userService.logoutAllDevices(Objects.requireNonNull(ud.getUsername()));
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * getStaff: Specialized lookup for administrative and operational staff members.
     */
    @PreAuthorize("hasAuthority('manage:users')")
    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getStaff(@RequestParam(defaultValue="0") int p, @RequestParam(defaultValue="10") int s) {
        return ResponseEntity.ok(ApiResponse.success(userService.getStaff(PageRequest.of(p, s))));
    }

    /**
     * postStaff: Creates a new internal staff account with specific roles/permissions.
     */
    @PreAuthorize("hasAuthority('manage:users')")
    @PostMapping("/staff/create")
    public ResponseEntity<ApiResponse<UserResponse>> postStaff(
            @RequestBody @Valid @NonNull RegisterRequest r,
            @RequestParam(required = false) RoleEnum role) {
        RoleEnum finalRole = (role != null) ? role : RoleEnum.ROLE_STAFF;
        return ResponseEntity.status(201).body(ApiResponse.created(userService.createStaff(Objects.requireNonNull(r), finalRole)));
    }

    /**
     * patchStatus: Administrative toggle to enable or ban a user account.
     */
    @PreAuthorize("hasAuthority('manage:users')")
    @PatchMapping("/{id:\\d+}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> patchStatus(@PathVariable @NonNull Long id) {
        userService.toggleUserStatus(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * getOne: Detailed lookup of any specific user by ID (Internal/Admin only).
     */
    @PreAuthorize("hasAuthority('manage:users')")
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<UserResponse>> getOne(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(Objects.requireNonNull(id))));
    }

    /**
     * putAdmin: High-level account modification by an administrator.
     */
    @PreAuthorize("hasAuthority('manage:users')")
    @PutMapping("/{id:\\d+}/admin")
    public ResponseEntity<ApiResponse<UserResponse>> putAdmin(
            @PathVariable @NonNull Long id, 
            @RequestBody @NonNull AdminUserUpdateRequest r) {
        return ResponseEntity.ok(ApiResponse.success(userService.adminUpdateUser(Objects.requireNonNull(id), Objects.requireNonNull(r))));
    }

    /**
     * delOne: Permanent deletion of a user record and their associated data.
     */
    @PreAuthorize("hasAuthority('manage:users')")
    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<Void>> delOne(@PathVariable @NonNull Long id) {
        userService.deleteUser(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

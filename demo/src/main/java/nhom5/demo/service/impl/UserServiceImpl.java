package nhom5.demo.service.impl;

import lombok.RequiredArgsConstructor;
import nhom5.demo.dto.response.UserResponse;
import nhom5.demo.entity.User;
import nhom5.demo.exception.BusinessException;
import nhom5.demo.exception.ResourceNotFoundException;
import nhom5.demo.repository.UserRepository;
import nhom5.demo.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Triển khai nghiệp vụ Quản lý người dùng.
 * Bao gồm: Cập nhật hồ sơ, Quản lý ảnh đại diện (Cloudinary), Hệ thống tích điểm và Phân quyền (RBAC).
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final nhom5.demo.repository.CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.cloudinary.Cloudinary cloudinary;
    private final nhom5.demo.service.AuditService auditService;

    @Override
    @Transactional
    public UserResponse updateAvatar(String username, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        User user = findByUsername(username);
        
        java.util.Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), 
                com.cloudinary.utils.ObjectUtils.asMap("folder", "avatars"));
        
        String url = uploadResult.get("secure_url").toString();
        user.setAvatarUrl(url);
        
        return toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse getProfile(String username) {
        User user = findByUsername(username);
        return toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String username, nhom5.demo.dto.request.UserUpdateRequest request) {
        User user = findByUsername(username);

        String newEmail = request.getEmail().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(newEmail) &&
                userRepository.existsByEmail(newEmail)) {
            throw new BusinessException("Email '" + newEmail + "' đã được sử dụng");
        }

        // Sử dụng SecurityUtils.sanitize để loại bỏ các ký tự nguy hiểm (XSS) trước khi lưu DB.
        user.setEmail(nhom5.demo.security.SecurityUtils.sanitize(newEmail));
        user.setFullName(nhom5.demo.security.SecurityUtils.sanitize(request.getFullName()));
        user.setPhone(nhom5.demo.security.SecurityUtils.sanitize(request.getPhone()));

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            if (request.getOldPassword() == null || request.getOldPassword().isBlank()) {
                throw new BusinessException("Vui lòng cung cấp mật khẩu cũ để thực hiện đổi mật khẩu");
            }
            if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
                throw new BusinessException("Mật khẩu cũ không chính xác");
            }
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            // Invalidate other sessions after password change
            user.setTokenVersion(user.getTokenVersion() + 1);
        }

        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getEmailNotifications() != null) user.setEmailNotifications(request.getEmailNotifications());
        if (request.getPromoNotifications() != null) user.setPromoNotifications(request.getPromoNotifications());

        return toResponse(userRepository.save(user));
    }

    @Override
    public Page<UserResponse> getAllUsers(String query, nhom5.demo.enums.RoleEnum role, Boolean isActive, Pageable pageable) {
        return userRepository.searchUsers(query, role, isActive, pageable).map(this::toResponse);
    }

    @Override
    public UserResponse getUserById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional
    public void toggleUserStatus(Long id) {
        User user = findById(id);
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
    }

    /**
     * Đăng xuất khỏi mọi thiết bị bằng cách tăng Token Version (Security Stamp).
     */
    @Override
    @Transactional
    public void logoutAllDevices(String username) {
        User user = findByUsername(username);
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = findById(id);
        user.setIsActive(false);
        userRepository.save(user);
        auditService.log(nhom5.demo.security.SecurityUtils.getCurrentUsername(), "SOFT_DELETE_USER", "User", id.toString(), "Soft-deleted user (isActive=false): " + user.getUsername());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getStaff(Pageable pageable) {
        return userRepository.findByRoleIn(
            java.util.Arrays.asList(nhom5.demo.enums.RoleEnum.ROLE_ADMIN, nhom5.demo.enums.RoleEnum.ROLE_STAFF),
            pageable
        ).map(this::toResponse);
    }

    @Override
    @Transactional
    public UserResponse adminUpdateUser(Long id, nhom5.demo.dto.request.AdminUserUpdateRequest request) {
        User user = findById(id);
        
        if (request.getFullName() != null) user.setFullName(nhom5.demo.security.SecurityUtils.sanitize(request.getFullName()));
        if (request.getEmail() != null) user.setEmail(nhom5.demo.security.SecurityUtils.sanitize(request.getEmail()));
        if (request.getPhone() != null) user.setPhone(nhom5.demo.security.SecurityUtils.sanitize(request.getPhone()));
        if (request.getAddress() != null) user.setAddress(nhom5.demo.security.SecurityUtils.sanitize(request.getAddress()));
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getIsActive() != null) user.setIsActive(request.getIsActive());
        if (request.getCustomPermissions() != null) {
            user.getCustomPermissions().clear();
            user.getCustomPermissions().addAll(request.getCustomPermissions());
        }
        
        User savedUser = userRepository.save(user);
        auditService.log(nhom5.demo.security.SecurityUtils.getCurrentUsername(), "ADMIN_UPDATE_USER", "User", id.toString(), "Updated staff/user: " + user.getUsername());
        return toResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse createStaff(nhom5.demo.dto.request.RegisterRequest request, nhom5.demo.enums.RoleEnum role) {
        if (userRepository.existsByUsername(request.getUsername())) {
             throw new BusinessException("Tên đăng nhập '" + request.getUsername() + "' đã tồn tại");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
             throw new BusinessException("Email '" + request.getEmail() + "' đã được sử dụng");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(role)
                .isActive(true)
                .provider("LOCAL")
                .build();

        userRepository.save(user);
        cartRepository.save(nhom5.demo.entity.Cart.builder().user(user).build());

        auditService.log(nhom5.demo.security.SecurityUtils.getCurrentUsername(), "ADMIN_CREATE_STAFF", "User", user.getId().toString(), "Created personnel: " + user.getUsername() + " with role " + role);
        return toResponse(user);
    }

    private User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    private User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .membershipTier(user.getMembershipTier())
                .avatarUrl(user.getAvatarUrl())
                .lifetimePoints(user.getLifetimePoints())
                .availablePoints(user.getAvailablePoints())
                .emailNotifications(user.getEmailNotifications())
                .promoNotifications(user.getPromoNotifications())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .isTwoFactorEnabled(user.getIsTwoFactorEnabled())
                .createdAt(user.getCreatedAt())
                .permissions(combinePermissions(user))
                .build();
    }

    private java.util.Set<String> combinePermissions(User user) {
        java.util.Set<String> all = new java.util.HashSet<>();
        if (user.getRole() != null && user.getRole().getPermissions() != null) {
            all.addAll(user.getRole().getPermissions());
        }
        if (user.getCustomPermissions() != null) {
            all.addAll(user.getCustomPermissions());
        }
        return all;
    }
}

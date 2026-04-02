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
import org.springframework.lang.NonNull;
import java.util.Objects;

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
    private final nhom5.demo.service.MailService mailService;

    @Override
    @Transactional
    public UserResponse updateAvatar(@NonNull String username, @NonNull org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        User user = findByUsername(username);
        
        java.util.Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), 
                com.cloudinary.utils.ObjectUtils.asMap("folder", "avatars"));
        
        String url = Objects.requireNonNull(uploadResult.get("secure_url")).toString();
        user.setAvatarUrl(url);
        
        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse deleteAvatar(@NonNull String username) {
        User user = findByUsername(username);
        user.setAvatarUrl(null);
        return toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse getProfile(@NonNull String username) {
        User user = findByUsername(username);
        return toResponse(Objects.requireNonNull(user));
    }

    @Override
    @Transactional
    public UserResponse updateProfile(@NonNull String username, @NonNull nhom5.demo.dto.request.UserUpdateRequest request) {
        User user = findByUsername(username);

        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhone().replaceAll("[^0-9+]", "");
        if (phone.startsWith("+84")) {
            phone = "0" + phone.substring(3);
        } else if (phone.startsWith("84")) {
            phone = "0" + phone.substring(2);
        }

        if (!user.getEmail().equalsIgnoreCase(email) && userRepository.existsByEmail(email)) {
            throw new BusinessException("Email '" + email + "' đã được sử dụng");
        }
        if (!user.getPhone().equals(phone) && userRepository.existsByPhone(phone)) {
            throw new BusinessException("Số điện thoại '" + phone + "' đã được sử dụng");
        }
        
        boolean emailChanged = !user.getEmail().equalsIgnoreCase(email);
        boolean phoneChanged = !user.getPhone().equals(phone);
        boolean passwordChanged = false;

        user.setEmail(email);
        user.setFullName(request.getFullName().trim());
        user.setPhone(phone);

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
            passwordChanged = true;
        }

        if (request.getDateOfBirth() != null) {
            if (request.getDateOfBirth().isAfter(java.time.LocalDate.now())) {
                throw new BusinessException("Ngày sinh không thể ở tương lai");
            }
            if (request.getDateOfBirth().getYear() < 1900 || request.getDateOfBirth().getYear() > java.time.LocalDate.now().getYear()) {
                throw new BusinessException("Năm sinh không hợp lệ");
            }
            user.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getEmailNotifications() != null) user.setEmailNotifications(request.getEmailNotifications());
        if (request.getPromoNotifications() != null) user.setPromoNotifications(request.getPromoNotifications());

        User savedUser = userRepository.save(user);

        // Gửi cảnh báo bảo mật qua Email
        if (passwordChanged) {
            mailService.sendSecurityAlert(savedUser.getEmail(), savedUser.getFullName(), "Thay đổi mật khẩu");
        }
        if (emailChanged) {
            mailService.sendSecurityAlert(savedUser.getEmail(), savedUser.getFullName(), "Thay đổi địa chỉ Email");
        }
        if (phoneChanged) {
            mailService.sendSecurityAlert(savedUser.getEmail(), savedUser.getFullName(), "Thay đổi số điện thoại");
        }

        return toResponse(savedUser);
    }

    @Override
    public Page<UserResponse> getAllUsers(String query, nhom5.demo.enums.RoleEnum role, Boolean isActive, @NonNull Pageable pageable) {
        return userRepository.searchUsers(query, role, isActive, pageable).map(this::toResponse);
    }

    @Override
    public UserResponse getUserById(@NonNull Long id) {
        return toResponse(Objects.requireNonNull(findById(id)));
    }

    @Override
    @Transactional
    public void toggleUserStatus(@NonNull Long id) {
        User user = findById(id);
        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        userRepository.save(user);
    }

    /**
     * Đăng xuất khỏi mọi thiết bị bằng cách tăng Token Version (Security Stamp).
     */
    @Override
    @Transactional
    public void logoutAllDevices(@NonNull String username) {
        User user = findByUsername(username);
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(@NonNull Long id) {
        User user = findById(id);
        userRepository.delete(Objects.requireNonNull(user));
        auditService.log(nhom5.demo.security.SecurityUtils.getCurrentUsername(), "DELETE_USER", "User", id.toString(), "Soft-deleted user (deleted_at set): " + user.getUsername());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getStaff(@NonNull Pageable pageable) {
        return userRepository.findByRoleIn(
            java.util.Arrays.asList(nhom5.demo.enums.RoleEnum.ROLE_ADMIN, nhom5.demo.enums.RoleEnum.ROLE_STAFF),
            pageable
        ).map(this::toResponse);
    }

    @Override
    @Transactional
    public UserResponse adminUpdateUser(@NonNull Long id, @NonNull nhom5.demo.dto.request.AdminUserUpdateRequest request) {
        User user = findById(id);
        
        if (request.getFullName() != null) user.setFullName(request.getFullName().trim());
        if (request.getEmail() != null) {
            String email = request.getEmail().trim().toLowerCase();
            if (!user.getEmail().equalsIgnoreCase(email) && userRepository.existsByEmail(email)) {
                throw new BusinessException("Email '" + email + "' đã được sử dụng bởi người dùng khác");
            }
            user.setEmail(email);
        }
        if (request.getPhone() != null) {
            String phone = request.getPhone().replaceAll("[^0-9+]", "");
            if (phone.startsWith("+84")) phone = "0" + phone.substring(3);
            else if (phone.startsWith("84")) phone = "0" + phone.substring(2);
            
            if (!user.getPhone().equals(phone) && userRepository.existsByPhone(phone)) {
                throw new BusinessException("Số điện thoại '" + phone + "' đã được sử dụng bởi người dùng khác");
            }
            user.setPhone(phone);
        }
        if (request.getRole() != null) {
            // Anti-self-demotion logic could go here if needed
            user.setRole(request.getRole());
        }
        if (request.getIsActive() != null) user.setIsActive(request.getIsActive());
        if (request.getCustomPermissions() != null) {
            Objects.requireNonNull(user.getCustomPermissions()).clear();
            user.getCustomPermissions().addAll(request.getCustomPermissions());
        }
        
        User savedUser = userRepository.save(Objects.requireNonNull(user));
        auditService.log(nhom5.demo.security.SecurityUtils.getCurrentUsername(), "ADMIN_UPDATE_USER", "User", id.toString(), "Updated staff/user: " + user.getUsername());
        return toResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse createStaff(@NonNull nhom5.demo.dto.request.RegisterRequest request, @NonNull nhom5.demo.enums.RoleEnum role) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhone().replaceAll("[^0-9+]", "");
        if (phone.startsWith("+84")) phone = "0" + phone.substring(3);
        else if (phone.startsWith("84")) phone = "0" + phone.substring(2);

        if (userRepository.existsByUsername(username)) {
             throw new BusinessException("Tên đăng nhập '" + username + "' đã tồn tại");
        }
        if (userRepository.existsByEmail(email)) {
             throw new BusinessException("Email '" + email + "' đã được sử dụng");
        }
        if (userRepository.existsByPhone(phone)) {
             throw new BusinessException("Số điện thoại '" + phone + "' đã được sử dụng");
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phone(phone)
                .role(role)
                .isActive(true)
                .provider("LOCAL")
                .build();

        User savedUser = userRepository.save(Objects.requireNonNull(user));
        cartRepository.save(Objects.requireNonNull(nhom5.demo.entity.Cart.builder().user(savedUser).build()));

        auditService.log(nhom5.demo.security.SecurityUtils.getCurrentUsername(), "ADMIN_CREATE_STAFF", "User", Objects.requireNonNull(savedUser.getId()).toString(), "Created personnel: " + savedUser.getUsername() + " with role " + role);
        return toResponse(savedUser);
    }

    private User findByUsername(@NonNull String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    private User findById(@NonNull Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private UserResponse toResponse(@NonNull User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
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
                .customPermissions(new java.util.HashSet<>(Objects.requireNonNull(user.getCustomPermissions())))
                .inheritedPermissions(user.getRole() != null ? user.getRole().getPermissions() : java.util.Collections.emptySet())
                .build();
    }

    private java.util.Set<String> combinePermissions(@NonNull User user) {
        java.util.Set<String> all = new java.util.HashSet<>();
        if (user.getRole() != null && user.getRole().getPermissions() != null) {
            all.addAll(Objects.requireNonNull(user.getRole().getPermissions()));
        }
        if (user.getCustomPermissions() != null) {
            all.addAll(Objects.requireNonNull(user.getCustomPermissions()));
        }
        return all;
    }
}

package nhom5.demo.service;

import nhom5.demo.dto.request.UserUpdateRequest;
import nhom5.demo.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface UserService {
    UserResponse getProfile(@NonNull String username);

    UserResponse updateProfile(@NonNull String username, @NonNull UserUpdateRequest request);

    UserResponse updateAvatar(@NonNull String username, @NonNull MultipartFile file)
            throws IOException;

    UserResponse deleteAvatar(@NonNull String username);

    Page<UserResponse> getAllUsers(String query, nhom5.demo.enums.RoleEnum role, Boolean isActive, @NonNull Pageable pageable);

    UserResponse getUserById(@NonNull Long id);

    void toggleUserStatus(@NonNull Long id);

    void logoutAllDevices(@NonNull String username);

    void deleteUser(@NonNull Long id);

    Page<UserResponse> getStaff(@NonNull Pageable pageable);

    UserResponse adminUpdateUser(@NonNull Long id, @NonNull nhom5.demo.dto.request.AdminUserUpdateRequest request);

    UserResponse createStaff(@NonNull nhom5.demo.dto.request.RegisterRequest request, @NonNull nhom5.demo.enums.RoleEnum role);
}

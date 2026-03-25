package nhom5.demo.service;

import nhom5.demo.dto.request.RegisterRequest;
import nhom5.demo.dto.request.UserUpdateRequest;
import nhom5.demo.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse getProfile(String username);

    UserResponse updateProfile(String username, UserUpdateRequest request);

    Page<UserResponse> getAllUsers(Pageable pageable);

    UserResponse getUserById(Long id);

    void toggleUserStatus(Long id);

    void deleteUser(Long id);
}

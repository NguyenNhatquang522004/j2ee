package nhom5.demo.service;

import nhom5.demo.dto.request.LoginRequest;
import nhom5.demo.dto.request.RegisterRequest;
import nhom5.demo.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}

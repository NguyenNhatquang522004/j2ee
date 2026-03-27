# 🛡️ Chính sách Bảo mật (Security) - FreshFood

Tài liệu này chi tiết về các cơ chế bảo mật đã triển khai trong hệ thống FreshFood.

## 🔑 Xác thực (Authentication)
- **JWT (JSON Web Token)**: Mọi yêu cầu API từ Client (ngoại trừ các endpoint công khai) đều yêu cầu Header `Authorization: Bearer <TOKEN>`.
- **Hết hạn Token**: Token được thiết lập với thời gian sống có hạn để tăng cường bảo mật.

## 🛡️ Bảo mật Phân quyền (Authorization)
Hệ thống sử dụng **Spring Security 6** và `@PreAuthorize("hasRole('ADMIN')")`:
- **`ROLE_USER`**: Truy cập các chức năng mua hàng, xem hàng và đánh giá.
- **`ROLE_ADMIN`**: Truy cập toàn quyền trang quản trị, duyệt đánh giá và cấu hình hệ thống.

## 🔐 Bảo mật 2 lớp (2FA)
FreshFood hỗ trợ bảo mật đa tầng cho người dùng:
1.  **Google Authenticator (TOTP)**: 
    - Người dùng quét mã QR trong phần Cài đặt.
    - Token mã số 6 chữ số được yêu cầu sau khi nhập đúng mật khẩu ở màn hình đăng nhập.
2.  **Email OTP**: 
    - Sau khi đăng nhập bằng mật khẩu, hệ thống gửi mã xác minh về email đăng ký.
    - Người dùng nhập mã này để hoàn tất phiên đăng nhập.

## 💎 Lưu trữ Media Bảo mật
Hình ảnh và video được lưu trữ qua **Cloudinary**:
- Các tài nguyên Admin có thể được cấu hình để truy cập hạn chế (Private Assets).
- Tải lên (Upload) yêu cầu Token và quyền tương ứng từ Backend.

## 🛡️ Phòng thủ Ứng dụng
- **CORS Config**: Chỉ cho phép các domain được tin tưởng (ví dụ: localhost:5173).
- **Password Hashing**: Toàn bộ mật khẩu được băm qua thuật toán **BCrypt** trước khi lưu xuống Database.

---
© 2026 FreshFood Project. Bảo lưu mọi quyền.

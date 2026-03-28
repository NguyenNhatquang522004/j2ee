# 🛡️ Chính sách Bảo mật (Security) - FreshFood

Tài liệu này chi tiết về các cơ chế bảo mật cấp độ doanh nghiệp đã được triển khai trong hệ thống FreshFood.

---

## 🔑 1. Quản lý Bí mật (Secrets Management)
Hệ thống áp dụng quy chuẩn tách biệt hoàn toàn mã nguồn và thông tin nhạy cảm:
- **Cấu hình môi trường (`.env`)**: Tất cả các Key nhạy cảm (JWT, Cloudinary, Meilisearch, SMTP) được lưu trữ trong file `.env` và được chặn bởi `.gitignore`.
- **Mẫu cấu hình (`.env.example`)**: Cung cấp mẫu chuẩn cho các nhà phát triển khác mà không làm lộ dữ liệu thật.
- **Docker Compose Mapping**: Sử dụng cú pháp `${VARIABLE}` để ánh xạ biến từ `.env` vào container.

---

## 🛡️ 2. Bảo mật Phiên làm việc (JWT & Session)
- **Chuẩn xác thực**: Sử dụng `JSON Web Token (JWT)` với thuật toán ký an toàn.
- **Token Versioning**: Mỗi người dùng có một `token_version` trong Database. Khi đăng xuất hoặc đổi mật khẩu, version này sẽ tăng lên -> Vô hiệu hóa ngay lập tức các Token cũ đang lưu hành.

---

## 🌐 3. Chính sách CORS (Cross-Origin Resource Sharing)
Hệ thống cấu hình Filter CORS nghiêm ngặt để chỉ cho phép các nguồn tin cậy:
- **Whitelisted Origins**: `http://localhost:3000`, `http://localhost:5173`.
- **Allowed Methods**: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`.
- **Credentials**: Hỗ trợ gửi kèm Cookie/Auth Header qua `setAllowCredentials(true)`.

---

## 🔒 4. CSRF Protection (Stateless API Guard)
Hệ thống ưu tiên sử dụng chuẩn REST API không trạng thái (Stateless), giúp loại bỏ các lỗi đồng bộ mã xác thực thông thường:
- **API Exclusion**: Mọi yêu cầu bắt đầu bằng `/api/v1/**` được loại trừ khỏi bộ lọc CSRF. Điều này là an toàn tuyệt đối vì hệ thống yêu cầu mã `Authorization: Bearer <JWT>` trong Header — một thông tin mà các trang web độc hại không thể tự động đính kèm hoặc đọc được từ LocalStorage.
- **Fail-safe Design**: Khắc phục triệt để lỗi người dùng phải thực hiện hành động 2 lần do trễ mã XSRF-TOKEN.
- **Stateful Safety**: Với các phần (nếu có) sử dụng Sesion, hệ thống vẫn duy trì `CookieCsrfTokenRepository` chuẩn để bảo vệ.

---

## 🚦 5. Giới hạn Tần suất (Enterprise Rate Limiting)
Sử dụng Redis Sorted Sets để triển khai thuật toán **Sliding Window (Cửa sổ trượt)**:
- **Tính chính xác**: Đo lường tần suất gọi API theo từng giây, khắc phục nhược điểm của thuật toán Fixed Window.
- **Endpoint Gating**: Giới hạn tối đa 5 lần thử đăng nhập/phút để chống Brute-force.

---

## 🔐 6. Bảo mật 2 lớp (2FA) & Kiểm soát Truy cập
- **Đa phương thức**: Hỗ trợ Google Authenticator (TOTP) và Email OTP.
- **RBAC (Role-Based Access Control)**: Phân quyền theo vai trò (Admin, User, Staff) và **Granular Permissions** chi tiết.
- **Failed Login Lockout**: Tự động khóa tài khoản sau 5 lần đăng nhập sai liên tiếp.

---

## 🔍 7. Nhật ký Hậu kiểm (Audit Trail)
Mọi hành động quan trọng của quản trị viên đều được ghi lại tự động:
- **Chi tiết**: Ai thực hiện, nội dung thay đổi, đối tượng bị tác động (Resource ID), IP address và thời điểm.
- **Tra soát**: Dữ liệu nằm trong bảng `admin_audit_logs`.

---

## 💾 8. Bảo mật Tầng Dữ liệu (Database Guard)
- **Pessimistic Locking**: Sử dụng `@Lock(LockModeType.PESSIMISTIC_WRITE)` chống Race Condition cho giao dịch nhạy cảm.
- **Validation**: Kiểm tra dữ liệu chuẩn Jakarta Bean Validation.

---

## 💰 9. Bảo mật Thanh toán (SePay Webhook Security)
Hệ thống tích hợp thanh toán tự động qua SePay với cơ chế bảo mật đa lớp:
- **Token Verification**: Các yêu cầu Webhook từ SePay phải chứa mã xác thực trong Header `Authorization`. Hệ thống sẽ so khớp mã này với biến môi trường `app.sepay.token` trước khi xử lý đơn hàng.
- **CSRF Exclusion**: Endpoint `/api/v1/payment/sepay-webhook` được loại trừ khỏi bộ lọc CSRF của Spring Security để cho phép các dịch vụ bên thứ ba giao tiếp hợp lệ.
- **Dữ liệu Đối soát (Reconciliation)**: Logic xử lý tự động phân tích nội dung chuyển khoản theo mẫu `FF{orderId}` để khớp lệnh chính xác 100%.

---

---
© 2026 FreshFood Project. Bảo lưu mọi quyền.

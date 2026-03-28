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

## 🔒 4. CSRF Protection (Double Submit Cookie)
Hệ thống chống lại các cuộc tấn công Cross-Site Request Forgery (CSRF) bằng cơ chế nghiêm ngặt:
- **Strict Match Policy**: Chỉ chấp nhận các yêu cầu thay đổi dữ liệu (POST, PUT, DELETE) khi mã token trong Cookie và mã trong Header (`X-XSRF-TOKEN`) khớp hoàn toàn 1:1.
- **Synchronized Initialization**: Mã CSRF được khởi tạo ngay từ lần gọi API đầu tiên qua `CsrfCookieFilter`.

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
© 2026 FreshFood Project. Bảo lưu mọi quyền.

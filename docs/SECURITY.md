# 🛡️ Chính sách Bảo mật (Security) - FreshFood

Tài liệu này chi tiết về các cơ chế bảo mật đã triển khai trong hệ thống FreshFood.

## 🔑 Xác thực & Phiên làm việc (Authentication & Session)
- **JWT (JSON Web Token)**: Mọi yêu cầu API đều yêu cầu Header `Authorization: Bearer <TOKEN>`.
- **Token Versioning (tv)**: Trường `token_version` trong Database giúp kiểm soát phiên làm việc.
    - **Logout All Devices**: Khi người dùng chọn đăng xuất tất cả, `token_version` tăng lên -> Mọi JWT cũ bị vô hiệu hóa ngay lập tức.
    - **Session Isolation**: Đảm bảo Token của User và Admin không thể tráo đổi hoặc dùng sai mục đích.

- **Authentication Isolation**: Đảm bảo Token của User và Admin không thể tráo đổi hoặc dùng sai mục đích. Phân quyền chặt chẽ ngay từ tầng JWT Claims.

## 🛡️ Phân quyền & Quản lý Nhân sự (RBAC + ABAC)
Hệ thống kết hợp giữa Vai trò cố định và **Granular Custom Permissions**:
- **Role-based**: `ROLE_USER`, `ROLE_ADMIN`, và đặc biệt là `ROLE_STAFF` (Dành cho nhân viên).
- **Custom Permissions**: Admin có thể gán các quyền cụ thể cho từng nhân viên (ví dụ: `view:batches`, `manage:products`).
- **Permission Matrix**: Toàn bộ hệ thống Backend kiểm soát từng hành động qua các authority cụ thể, tích hợp với giao diện UI ma trận quyền hạn để Admin dễ dàng điều phối nhân sự.

- **Sliding Window Algorithm**: Sử dụng Redis Sorted Sets để đo lường tần suất gọi API theo từng mili giây. Ngăn chặn hiện tượng bùng nổ yêu cầu tại điểm giao thoa giữa các phút (khắc phục nhược điểm của Fixed Window).
- **Endpoint Protection**: Thiết lập các giới hạn nghiêm ngặt cho Login (5 lần/phút), Register (3 lần/phút), và Newsletter Subscription để chống brute-force.

## 🔒 CSRF Protection (Enterprise Target Strict Match)
- **Double Submit Cookie**: Kích hoạt bộ lọc CSRF bằng `CookieCsrfTokenRepository` với cấu hình `HttpOnly: false` để React có thể đọc mã đồng bộ.
- **Strict Match Policy**: Hệ thống chỉ chấp nhận mutating requests (POST, PUT, DELETE) khi mã token trong Cookie và mã token trong Header (`X-XSRF-TOKEN`) khớp hoàn toàn 1:1.
- **CSRF Initialization**: Luôn khởi tạo và đính kèm mã CSRF ngay từ lần gọi API GET đầu tiên thông qua `CsrfCookieFilter`.

## 🔐 Bảo mật 2 lớp (2FA)
FreshFood hỗ trợ bảo mật đa tầng:
1.  **Google Authenticator (TOTP)**: Quét mã QR, nhập mã 6 số (TTL 30s).
2.  **Email OTP**: Gửi mã xác minh 6 số về email sau khi nhập đúng mật khẩu.

- **Locking Chiến lược**: Sử dụng `@Lock(LockModeType.PESSIMISTIC_WRITE)` trong Spring Data JPA để khóa bản ghi tại tầng Database khi thực hiện các giao dịch trừ kho hoặc sử dụng mã giảm giá, tránh Race Condition.
- **Price & Logic Guard**: Mọi tính toán logic nghiệp vụ đều diễn ra ở Server. Không tin tưởng dữ liệu giá hoặc quyền truy cập được gửi từ Client.

## 🔍 Audit Trail (Nhật ký hậu kiểm)
Mọi hành động nhạy cảm của nhân viên quản trị đều được ghi lại:
- **Chi tiết bản ghi**: Ai làm, hành động gì (CREATE/UPDATE/DELETE), ID tài nguyên nào, thời điểm cụ thể và mô tả chi tiết.
- **Bảng audit**: Dữ liệu lưu trong bảng `admin_audit_logs` dùng để tra soát khi có sự cố dữ liệu.

## 🛡️ Header Bảo mật (Security Headers)
Cấu hình Spring Security ép buộc các Header:
- **Content Security Policy (CSP)**: Ngăn chặn XSS.
- **Strict-Transport-Security (HSTS)**: Ép buộc HTTPS.
- **X-Frame-Options (DENY)**: Chống Clickjacking.

## 💎 Lưu trữ Media Bảo mật
- **Cloudinary**: Hình ảnh và video được lưu trữ qua Cloudinary với các tài nguyên được bảo vệ.
- Tải lên (Upload) yêu cầu Token và quyền tương ứng từ Backend.

---
© 2026 FreshFood Project. Bảo lưu mọi quyền.

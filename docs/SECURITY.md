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
Hệ thống cấu hình Filter CORS linh hoạt và bảo mật cao thông qua biến môi trường:
- **Dynamic Allowed Origins**: Danh sách các domain được phép truy cập (`http://localhost:3000`, `http://localhost:5173`,...) được cấu hình thông qua biến `CORS_ALLOWED_ORIGINS` trong file `.env`.
- **Allowed Methods**: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`.
- **Credentials**: Hỗ trợ gửi kèm Cookie/Auth Header qua `setAllowCredentials(true)`.

---

## 🛠️ 4. Bảo vệ Giám sát Hệ thống (Actuator Hardening)
Hệ thống Spring Boot Actuator cung cấp các thông tin quan trọng về sức khỏe và cấu hình của Server:
- **Giới hạn Truy cập**: Tất cả các Endpoint `/actuator/**` đều được bảo vệ nghiêm ngặt bằng quyền `ROLE_ADMIN`. Các yêu cầu từ người dùng thông thường hoặc chưa đăng nhập sẽ bị từ chối truy cập (403 Forbidden).
- **Bộ lọc Exposure**: Chỉ hiển thị các thông tin cần thiết (`health`, `info`) để giảm thiểu rủi ro rò rỉ cấu hình môi trường.
- **Health Details**: Chỉ hiển thị chi tiết trạng thái sức khỏe (database, redis, disk space) cho quản trị viên.

---

## 🔒 5. CSRF Protection (Stateless API Guard)
Hệ thống ưu tiên sử dụng chuẩn REST API không trạng thái (Stateless), giúp loại bỏ các lỗi đồng bộ mã xác thực thông thường:
- **API Exclusion**: Mọi yêu cầu bắt đầu bằng `/api/v1/**` được loại trừ khỏi bộ lọc CSRF. Điều này là an toàn tuyệt đối vì hệ thống yêu cầu mã `Authorization: Bearer <JWT>` trong Header — một thông tin mà các trang web độc hại không thể tự động đính kèm hoặc đọc được từ LocalStorage.
- **Fail-safe Design**: Khắc phục triệt để lỗi người dùng phải thực hiện hành động 2 lần do trễ mã XSRF-TOKEN.
- **Stateful Safety**: Với các phần (nếu có) sử dụng Sesion, hệ thống vẫn duy trì `CookieCsrfTokenRepository` chuẩn để bảo vệ.

---

## 🚥 5. Giới hạn Tần suất & Chặn truy cập (Rate Limiting & IP Blocking)
Sử dụng Redis Sorted Sets để triển khai thuật toán **Sliding Window (Cửa sổ trượt)** và hệ thống quản lý IP linh hoạt:
- **Tính chính xác**: Đo lường tần suất gọi API theo từng giây, khắc phục nhược điểm của thuật toán Fixed Window.
- **Endpoint Gating**: Giới hạn tối đa 5 lần thử đăng nhập/phút để chống Brute-force.
- **Hệ thống IP Blocklist**: Tích hợp danh sách đen IP toàn cầu. Mọi yêu cầu từ các IP này sẽ bị chặn ngay từ Filter để giảm tải cho hệ thống và ngăn chặn các cuộc tấn công DDoS/Scraping.
- **Chế độ Chặn Vĩnh viễn/Tạm thời**: Hỗ trợ thiết lập thời gian hết hạn chặn IP (`blocked_until`) hoặc chặn vĩnh viễn (`is_permanent`).

---

## 🔐 6. Bảo mật 2 lớp (2FA) & Kiểm soát Truy cập (Access Control)
- **Đa phương thức**: Hỗ trợ Google Authenticator (TOTP) và Email OTP.
- **RBAC (Role-Based Access Control)**: Phân quyền theo vai trò (Admin, User, Staff) và **Granular Permissions** chi tiết.
- **Chính sách Khóa tài khoản (Account Lockout)**: Tự động khóa tài khoản trong 30 phút sau 5 lần đăng nhập sai liên tiếp. Người dùng nhận được thông báo rõ ràng về thời gian còn lại trước khi có thể thử lại.
- **Admin IP Whitelisting**: Một lớp bảo vệ bổ sung cho đội ngũ vận hành. Chỉ cho phép truy cập quyền quản trị từ các địa chỉ IP cụ thể (ví dụ: IP văn phòng). Cấu hình qua biến môi trường hoặc bảng thiết lập hệ thống.

---

## 🔍 7. Nhật ký Hậu kiểm (Audit Trail) & Token Invalidation
Mọi hành động quan trọng được ghi lại tự động và quản lý phiên đăng nhập chủ động:
- **Chi tiết Audit**: Ai thực hiện, nội dung thay đổi, đối tượng bị tác động (Resource ID), IP address và thời điểm. Dữ liệu nằm trong bảng `admin_audit_logs`.
- **Vô hiệu hóa Phiên tức thì (Security Stamp)**: Mỗi người dùng có một `token_version` trong Database. Khi đổi mật khẩu, version này sẽ tăng lên -> Vô hiệu hóa ngay lập tức các Token cũ trên tất cả thiết bị của người dùng đó.

---

## 💾 8. Bảo mật Tầng Dữ liệu & Làm sạch (Data Guard & Sanitization)
- **XSS Protection (Làm sạch Đầu vào)**: Sử dụng thư viện Jsoup để tự động làm sạch (Sanitize) tất cả các trường dữ liệu HTML/Text gửi lên từ người dùng (Hồ sơ, Bình luận, Tin nhắn), ngăn chặn các vụ tấn công chèn mã độc.
- **Pessimistic Locking**: Sử dụng `@Lock(LockModeType.PESSIMISTIC_WRITE)` chống Race Condition cho giao dịch nhạy cái như áp dụng mã giảm giá.
- **Validation**: Kiểm tra dữ liệu chuẩn Jakarta Bean Validation.

---

## 💳 9. Bảo mật Thanh toán (Payment Security)
Hệ thống tích hợp thanh toán tự động qua SePay và VnPay với cơ chế bảo mật đa lớp:
- **Checksum & Signature Verification**: 
    - **VnPay**: Mọi callback và redirect đều được xác thực chữ ký (Secure Hash) bằng thuật toán `HmacSHA512`.
    - **SePay**: Các yêu cầu Webhook phải chứa mã xác thực trong Header `Authorization` khớp với `app.sepay.token`.
- **Thanh toán Chính chủ (Ownership validation)**: Trước khi tạo URL thanh toán VnPay, hệ thống kiểm tra `order.userId` so với người dùng đang đăng nhập (`principal`). Ngăn chặn việc tạo link thanh toán trái phép cho đơn hàng của người khác.
- **CSRF Exclusion**: Các endpoint Webhook (`/api/v1/payment/*`) được loại trừ khỏi bộ lọc CSRF để cho phép dịch vụ bên thứ ba giao tiếp hợp lệ.
- **Dữ liệu Đối soát (Reconciliation)**: Logic xử lý tự động phân tích nội dung chuyển khoản để khớp lệnh chính xác 100%.

---

## 🧺 10. Bảo trì & Tự động hoá (Maintenance & Automation)
- **Hệ thống Scheduled Tasks**: Tự động dọn dẹp các đơn hàng PENDING quá hạn (15 phút) để giải phóng tồn kho thực tế, ngăn chặn việc "giữ chỗ" ảo làm ảnh hưởng tới việc kinh doanh.
- **Cleanup Jobs**: Định kỳ xóa bỏ các mã xác thực (Reset Password, 2FA) đã hết hạn để tối ưu dung lượng DB.

---

## 🛡️ 11. Bảo mật Dữ liệu Cấu hình (Public Settings Filtering)
- **Whitelisting Cấu hình**: Hệ thống áp dụng bộ lọc nghiêm ngặt (Whitelist) cho endpoint lấy cấu hình công khai `/api/v1/settings/public`.
- **Ngăn chặn Rò rỉ**: Chỉ các Key được định nghĩa an toàn (như `STORE_NAME`, `CONTACT_EMAIL`, `MAINTENANCE_MODE`) mới được phép trả về cho người dùng không đăng nhập. Các biến môi trường nhạy cảm hoặc cấu hình nội bộ luôn được bảo vệ 100%.

---

## 🔍 12. Bảo mật Tìm kiếm REST (Meilisearch Authentication)
- **REST-based Auth**: Hệ thống không sử dụng SDK Meilisearch để tránh rò rỉ Key qua các lỗi thư viện. Thay vào đó, mọi yêu cầu được thực hiện qua `RestTemplate` với Header `Authorization` được quản lý an toàn ở tầng Service.
- **Master Key Protection**: Master Key của Meilisearch chỉ tồn tại trong biến môi trường phía Server và không bao giờ xuất hiện ở mã nguồn Frontend.

---
© 2026 FreshFood Project. Bảo lưu mọi quyền.

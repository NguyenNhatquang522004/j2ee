# 📜 Nhật ký thay đổi (Changelog) - FreshFood

Tất cả các cập nhật quan trọng cho dự án FreshFood sẽ được liệt kê tại đây.

## [v3.4.0] - 2026-04-01
### 🛡️ Quan sát & Bảo mật (Observability & Hardening)
- **Comprehensive Logging (SLF4J)**: Triển khai hệ thống giám sát đa điểm tại `OrderServiceImpl`, `PaymentServiceImpl`, các Security Filters và `GlobalExceptionHandler` giúp truy vết 100% logic nghiệp vụ và lỗi hệ thống.
- **JWT Kill Switch (v2.0)**: Nâng cấp cơ chế vô hiệu hóa phiên tức thì dựa trên `tokenVersion`, đảm bảo đăng xuất ngay lập tức trên mọi thiết bị khi phát hiện rủi ro.
- **Maintenance Mode**: Tích hợp bộ lọc chế độ bảo trì, cho phép đóng hệ thống an toàn để nâng cấp mà không làm gián đoạn trải nghiệm người dùng.
- **CSP Hardening**: Triển khai Content Security Policy giúp ngăn chặn triệt để các cuộc tấn công XSS (Cross-Site Scripting).

### 🚀 Hiệu năng & Đồng bộ (Performance & Sync)
- **Asynchronous Search Core**: Chuyển đổi toàn bộ quy trình Index Meilisearch sang xử lý Luồng chạy nền (`@Async`), giúp giao dịch đặt hàng nhanh hơn và không bị gián đoạn.
- **Search Resiliency**: Thiết lập cơ chế Timeout gắt gao (2s/3s) cho các yêu cầu tìm kiếm để bảo vệ giao dịch chính của cơ sở dữ liệu.
- **High-Fidelity Address Sync**: Đồng bộ hóa cấu trúc địa chỉ 4 thành phần (Xã-Huyện-Tỉnh) từ `database.sql` thông qua DTO lên tới giao diện `OrderDetail.jsx` và `Checkout.jsx`.

## [v3.3.0] - 2026-03-31
### 🛡️ Bảo mật & Định danh (Validation & Hardening)
- **Standardized Vietnamese Validation**: Triển khai bộ Regex chuẩn cho số điện thoại di động Việt Nam (khớp tiền tố nhà mạng) và Họ tên (chỉ Unicode chữ cái & dấu cách).
- **Automated Data Normalization**: Tự động chuẩn hóa định dạng số điện thoại (`+84` -> `0`, xóa ký tự lạ) và Email (về chữ thường, trim khoảng trắng) tại Service layer.
- **Database Identity Hardening**: Áp dụng ràng buộc cứng `UNIQUE` và `NOT NULL` cho `Phone`, `Email`, và `Username` trực tiếp tại lược đồ Database.
- **Frontend Sync**: Đồng bộ hóa toàn bộ quy tắc validate vào giao diện Đăng ký (`Register.jsx`) và Hồ sơ (`Profile.jsx`) với phản hồi người dùng (`title` & `pattern`).

### 📦 Quản lý kho & Lô hàng (Inventory 2.0)
- **Batch Date Enforcement**: Thêm ràng buộc logic ngày sản xuất < ngày nhập < ngày hết hạn, chặn hoàn toàn các lỗi nhập liệu năm sai (tối đa 2099).
- **Automated Status Lifecycle**: Cập nhật cơ chế tự động chuyển trạng thái `EXPIRED` (quá hạn) và `DISCONTINUED` (hết hàng) qua Scheduler và luồng trừ kho FEFO.
- **Batch Update Reliability**: Gia cố logic cập nhật lô hàng, tự động tái đánh giá trạng thái (`ACTIVE`/`EXPIRED`) dựa trên số lượng tồn kho và ngày hạn dùng mới.

## [v3.2.0] - 2026-03-30
### ✨ Tính năng mới
- **Role-based 404 Logic**: Trang 404 thông minh tự động hiển thị `AdminLayout` cho Quản trị viên/Nhân viên và `UserLayout` cho khách hàng.
- **Customizable Address Labels**: Người dùng và Quản trị viên có thể tự đặt tên nhãn cho địa chỉ (Ví dụ: Nhà riêng, Kho, Công ty...) thay vì các nhãn mặc định.
- **Avatar Management (Admin)**: Bổ sung tính năng thay đổi và gỡ bỏ ảnh đại diện trực tiếp trong trang Cài đặt Hệ thống của Admin.

### 🛡️ Bảo mật & Ổn định
- **Clarified 2FA Policy**: Tách biệt rõ ràng giữa "Bảo mật cá nhân" và "Chính sách bắt buộc 2FA toàn hệ thống" trong giao diện Admin.
- **Newsletter Layout Stability**: Khắc phục lỗi rớt bố cục trong trình soạn thảo bản tin trên các màn hình kích thước trung bình (Máy tính bảng).
- **Redundancy Cleanup**: Loại bỏ các cấu hình 2FA lặp lại và tối ưu hóa luồng điều hướng trang cá nhân cho Admin.

## [v2.4.0] - 2026-03-30
### 🛡️ Audit & Hardening (Hệ thống & Dữ liệu)
- **N+1 Query Resolution**: Tối ưu hóa hiệu năng giỏ hàng (`CartService`) bằng cơ chế Batch Fetch dữ liệu lô hàng (Batch) và Flash Sale, giảm thiểu số lượng truy vấn DB.
- **Centralized Security**: Hợp nhất bộ lọc IP Whitelist vào `AdminIpWhitelistFilter`. Chuẩn hóa Key `ADMIN_IP_WHITELIST` (Viết HOA) đồng bộ giữa mã nguồn và cơ sở dữ liệu.
- **Dynamic Loyalty Settings**: Khởi tạo và đồng bộ hóa tỉ lệ tích điểm (`LOYALTY_RATIO`) và giá trị quy đổi sang cấu hình động, cho phép Admin điều chỉnh trực tiếp từ Dashboard.
- **Loyalty Null-safety**: Gia cố logic tích điểm với xử lý Null-safe và khởi tạo dữ liệu mặc định cho User cũ, ngăn chặn lỗi runtime.
- **Admin Settings UI**: Mở rộng giao diện quản trị với các mục cấu hình Điểm thưởng, Thông tin cửa hàng và Mạng xã hội chuyên nghiệp.

## [v2.3.0] - 2026-03-30
### 🛡️ Bảo mật & Trải nghiệm người dùng (Security & SEO)
- **ID Obfuscation (orderCode)**: Chuyển đổi toàn bộ hệ thống định danh đơn hàng sang `orderCode` bảo mật thay cho ID số tự tăng, ngăn chặn việc dò tìm dữ liệu trái phép (IDOR).
- **SEO-friendly Slugs**: Áp dụng URL thân thiện (vd: `/products/thit-bo`) thay cho `/products/123`. Tích hợp logic tự động sinh slug từ Text Việt có dấu.
- **Admin IP Whitelisting**: Nâng cấp bộ lọc IP bảo vệ Dashboad, hỗ trợ Header `X-Forwarded-For` cho môi trường Proxy/Docker.
- **AI Security**: Thắt chặt quyền truy cập AI Freshness API, chỉ cho phép người dùng đã đăng ký sử dụng tài nguyên AI.

### 📦 Quản lý kho & Thanh toán (Inventory & Payment)
- **Zero Stock Leak Logic**: Chuyển thời điểm trừ kho đơn COD lên bước `PACKAGING`. Sửa lỗi logic hoàn kho khi hủy đơn COD đang vận chuyển.
- **FEFO Strategy Audit**: Xác minh và hoàn thiện chiến lược xuất kho "Hạn dùng trước, Xuất trước" (FEFO) trong `BatchService`.
- **SePay Upgrade**: Cập nhật cơ chế xác thực Webhook dựa trên mã đơn hàng `ORD-...` mới.

## [v2.2.0] - 2026-03-30
### 💳 Thanh toán & Hạ tầng (Flyway & VnPay)
- **Tích hợp VnPay Full**: Triển khai logic ký số HMAC-SHA512 và xử lý callback thanh toán an toàn, tự động xác nhận đơn hàng.
- **Quản lý Database (Flyway)**: Chuyển đổi từ `ddl-auto=update` sang Flyway Migration để quản lý phiên bản database chuyên nghiệp và an toàn dữ liệu.
- **Bảo mật Thanh toán**: Ràng buộc quyền sở hữu đơn hàng (Ownership check), chỉ người mua mới có thể tạo link thanh toán.
- **Tài liệu hệ thống**: Cập nhật Redis và VnPay vào Technology Stack trong README.

### 🛠️ Sửa lỗi & Tối ưu (Fixes)
- **Code Sanitization**: Xử lý triệt để các cảnh báo "Raw type" trong `PaymentController` theo tiêu chuẩn Java Generics.
- **Checkout Flow**: Tích hợp luồng chuyển hướng thanh toán trực tiếp từ giao diện Checkout Frontend.

## [v2.1.0] - 2026-03-30
### 🚀 Hiệu năng & Tối ưu hóa (Performance & Gzip)
- **GZIP Compression**: Kích hoạt nén dữ liệu cho các phản hồi JSON, tăng tốc độ tải trang lên tới 70%.
- **Production Config**: Hoàn thiện cấu hình nén MIME-types chuẩn web thương mại điện tử.

## [v2.0.0] - 2026-03-29
### 🛡️ Phục hồi & Ổn định (System Recovery)
- **Database Restoration**: Khôi phục 100% dữ liệu từ bản sao lưu `database.sql` sau sự cố.
- **IDE Build Sync**: Tối ưu hóa `pom.xml` giúp đồng bộ symbols chính xác trên VS Code và IntelliJ.

## [v1.9.0] - 2026-03-29
### 🔍 Tìm kiếm & Bảo mật (Search & Privacy)
- **Meilisearch REST Engine**: Chuyển đổi hoàn toàn sang REST Template để tăng tính ổn định trong môi trường Docker.
- **Public Settings Filtering**: Cơ chế Whitelist bảo vệ các thông tin cấu hình nhạy cảm.

## [v1.8.0] - 2026-03-29
### 🥇 Hệ thống Hội viên (Loyalty & Membership)
- **Tích điểm Tự động**: Cơ chế tích 1 điểm cho mỗi 1,000 VND khi hoàn tất đơn hàng.
- **Phân hạng Membership**: Tự động xếp hạng (Bronze, Silver, Gold, Platinum) dựa trên Lifetime Points.
- **Scheduled Tasks**: Tự động dọn dẹp đơn hàng quá hạn sau 15 phút.

## [v1.4.0] - 2026-03-28
### 💳 Thanh toán SePay (VietQR)
- **SePay Integration**: Tự động xác nhận đơn hàng qua Webhook khi khách chuyển khoản đúng nội dung.
- **Webhook Security**: Thực hiện xác thực Token bí mật cho mọi yêu cầu từ SePay.

## [v1.2.0] - 2026-03-27
### ✨ Media & Review
- **Cloudinary Storage**: Hỗ trợ lưu trữ ảnh/video chuyên nghiệp cho sản phẩm và đánh giá.
- **Multi-media Reviews**: Cho phép đính kèm nhiều ảnh/video khi đánh giá sản phẩm.

## [v1.1.0] - 2026-03-20
### ✨ Core Features
- Bảo mật 2 lớp (2FA) qua Google Authenticator và Email OTP.
- Chức năng Quản lý Lô hàng (Batch Management).
- Hệ thống Giỏ hàng và Danh sách yêu thích.

## [v1.0.0] - 2026-03-15
### 🎉 Khởi tạo dự án
- Thiết lập khung dự án Spring Boot và React Vite.
- Xây dựng sơ đồ cơ sở dữ liệu cơ bản và xác thực JWT.

---
© 2026 FreshFood Project. Bảo lưu mọi quyền.

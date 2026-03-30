# 📜 Nhật ký thay đổi (Changelog) - FreshFood

Tất cả các cập nhật quan trọng cho dự án FreshFood sẽ được liệt kê tại đây.

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

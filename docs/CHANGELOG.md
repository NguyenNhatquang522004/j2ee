# 📜 Nhật ký thay đổi (Changelog) - FreshFood

Tất cả các cập nhật quan trọng cho dự án FreshFood sẽ được liệt kê tại đây.

## [v1.2.0] - 2026-03-27

### ✨ Cập nhật chính
- **Tích hợp Cloudinary**: Hỗ trợ lưu trữ ảnh/video chuyên nghiệp cho sản phẩm, đánh giá và ảnh đại diện.
- **Thư viện Media**: Trang quản lý tập trung tài nguyên cho Admin.
- **Review đa phương tiện**: Người dùng có thể đính kèm nhiều ảnh/video khi viết đánh giá sản phẩm.
- **Admin Moderation**: Cho phép Admin duyệt, phản hồi và ẩn các đánh giá sản phẩm.
- **Đồng bộ Header**: Thêm menu Danh mục và Trang trại dạng dropdown động.
- **Phản hồi đánh giá**: Admin có thể trả lời trực tiếp các đánh giá của khách hàng.

## [v1.3.0] - 2026-03-28

### 🛡️ Bảo mật tiêu chuẩn Enterprise (Level 3/3)
- **Hệ thống CSRF Protection (Strict Match)**: Kích hoạt Double Submit Cookie khớp lệnh tuyệt đối giữa React và Spring Boot.
- **Sliding Window Rate Limiting**: Nâng cấp thuật toán giới hạn tần suất sử dụng Redis Sorted Sets, ngăn chặn triệt đại các cuộc tấn công Brute-force.
- **Khóa dữ liệu (Pessimistic Locking)**: Áp dụng khóa bản ghi ở tầng Database (`SELECT FOR UPDATE`) cho các giao dịch nhạy cảm như áp dụng mã giảm giá.
- **Audit Trail (Nhật ký hậu kiểm)**: Tự động ghi lại mọi hành động thay đổi dữ liệu của Admin (Tạo, Sửa, Xóa, Tặng Voucher) vào `admin_audit_logs`.
- **Cấu hình Security Headers**: Thêm `Referrer-Policy`, `X-Content-Type-Options` và hoàn thiện `CSP` nghiêm ngặt.

### 👥 Quản lý nhân sự & Phân quyền (RBAC)
- **Role-based + Custom Permissions**: Hệ thống cho phép gán quyền riêng biệt cho từng nhân viên (ví dụ: nhân viên kho chỉ có quyền quản lý lô hàng).
- **Giao diện Quản lý Nhân sự**: Trang `Nhân sự` mới cho phép Admin quản lý danh sách đội ngũ và tùy chỉnh ma trận quyền hạn qua UI trực quan.
- **Đồng bộ Trạng thái 2FA**: Sửa lỗi hiển thị trạng thái kích hoạt 2FA không đồng bộ giữa Database và Giao diện.

### 🎫 Hệ thống Mã giảm giá (Coupons)
- **Logic Voucher Công khai/Riêng tư**: Phân định rõ ràng mã giảm giá chung cho mọi người và mã dành riêng cho khách hàng thân thiết.
- **Quy trình Tặng Voucher**: Cho phép Admin gửi voucher trực tiếp cho cá nhân qua Email và Thông báo hệ thống mà không làm tăng rác dữ liệu.

### 🐛 Sửa lỗi (Fixes)
- Sửa lỗi `403 Forbidden` khi người dùng tải ảnh đại diện trong hồ sơ.
- Khắc phục lỗi Syntax JSX trong các danh sách đánh giá sản phẩm.
- Sửa lỗi `map is not a function` khi dữ liệu trang trại trả về dạng phân trang.

### 🎨 Cải thiện UI (UI/UX)
- Chuyển đổi toàn bộ tông màu tím sang màu Xanh/Trắng của FreshFood.
- Tinh gọn Header bằng cách ẩn tên người dùng và đưa nút Đăng xuất vào trang Settings.

## [v1.1.0] - 2026-03-20

### ✨ Đã thêm
- Bảo mật 2 lớp (2FA) qua Google Authenticator và Email OTP.
- Chức năng Quản lý Lô hàng (Batch) cho Admin.
- Hệ thống Giỏ hàng (Cart) và Danh sách yêu thích (Wishlist).
- Tìm kiếm sản phẩm thông minh.

## [v1.0.0] - 2026-03-15

### 🎉 Khởi tạo dự án
- Thiết lập khung dự án Spring Boot và React Vite.
- Xây dựng sơ đồ cơ sở dữ liệu cơ bản.
- Chức năng đăng ký/đăng nhập cơ bản qua JWT.

---
© 2026 FreshFood Project. Bảo lưu mọi quyền.

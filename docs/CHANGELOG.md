# 📜 Nhật ký thay đổi (Changelog) - FreshFood

Tất cả các cập nhật quan trọng cho dự án FreshFood sẽ được liệt kê tại đây.

## [v1.7.0] - 2026-03-28

### 📊 Quản trị Thông minh & Trải nghiệm (Smart Admin & UX)
- **Bảng điều khiển (Dashboard) Nâng cao**: Tích hợp biểu đồ doanh thu thời gian thực (CSS/SVG Charts), hệ thống phím tắt "Quick Actions" và danh sách nhiệm vụ ưu tiên dựa trên dữ liệu thật từ Backend.
- **Nâng cấp Thư viện Media**: Bổ sung tính năng phân tích dung lượng lưu trữ (Storage Analytics), sửa lỗi hiển thị video lightbox và tối ưu hóa hiển thị metadata tệp tin.
- **Giao diện Responsive 100%**: Thiết kế lại toàn bộ khung quản trị (`AdminLayout`) cho trải nghiệm mobile hoàn hảo với Sidebar trượt, Drawer và bảng dữ liệu hỗ trợ cuộn ngang thông minh.
- **Cải thiện Quản lý Nhân sự**: Sửa lỗi nút thêm mới và nâng cấp logic tìm kiếm (Search) đa nền tảng, xử lý tốt các trường hợp dữ liệu rỗng hoặc khoảng trắng.

### 🛠️ Tối ưu hóa & Sửa lỗi (Performance & Fixes)
- **Unified Padding System**: Loại bỏ hiện tượng "padding chồng padding" và chuẩn hóa màu nền cho toàn bộ khu vực Admin.
- **Fix ReferenceErrors**: Khắc phục triệt để các lỗi thiếu Import biểu tượng (`PlusIcon`, `ChartBarIcon`) và lỗi biến `useState` không xác định.
- **Table UX**: Áp dụng `min-width` cho bảng dữ liệu trong các container cuộn ngang, ngăn chặn việc xô lệch thông tin trên màn hình nhỏ.
 
## [v1.6.0] - 2026-03-29
 
+### 🚀 Tính năng & Trải nghiệm (Features & UX)
+- **Hệ thống So sánh Sản phẩm (Compare)**: Hoàn thiện tính năng so sánh trực quan đa sản phẩm (Giá, Tồn kho, Chứng chỉ, Trang trại).
+- **Đồng bộ Flash Sale**: Thống nhất nhãn giảm giá đỏ và giá ưu tiên trên toàn bộ hệ thống (Home, Product List, Wishlist).
+- **Global API Logging**: Tích hợp log tự động cho mọi yêu cầu/phản hồi API trong Console, hỗ trợ kiểm soát dữ liệu thời gian thực.
+
+### 🛡️ Bảo mật & Tin cậy (Security & Reliability)
+- **Tối ưu CSRF cho SPA**: Chuyển sang cơ chế Stateless API Exclusion cho `/api/v1/**`, khắc phục lỗi "bấm 2 lần mới được" mà vẫn đảm bảo an toàn tuyệt đối qua JWT Header.
+- **Củng cố Wishlist API**: Đồng bộ dữ liệu `isNew`, `totalStock`, `farmName` và `originalPrice` giúp giao diện Wishlist đồng nhất với cửa hàng chính.
+- **Repository Transactions**: Bổ sung `@Modifying` và `@Transactional` cho các phương thức xoá tập trung (Cart, Wishlist), đảm bảo dữ liệu được cập nhật ngay lập tức.
+
 ## [v1.5.0] - 2026-03-28
 
### 🔔 Thông báo & Tính ổn định Hệ thống (Notifications & Reliability)
- **Hệ thống Thông báo Admin (Real-time Badge)**: Tích hợp huy hiệu thông báo số lượng tin nhắn liên hệ chưa đọc trực tiếp trên thanh Sidebar của Admin (Pulsing Red Badge).
- **Tối ưu hóa Giao dịch (Transactional Optimization)**: Khắc phục triệt để lỗi `500 Internal Server Error` khi kiểm tra mã giảm giá (Coupon validation) bằng cách tách biệt logic đọc và logic ghi (Locks).
- **Ổn định Giao diện Quản trị**: Sửa lỗi `ReferenceError` gây trắng trang tại các trang quản lý **Sản phẩm** (Products) và **Người dùng** (Users).
- **Xử lý Dữ liệu Boolean**: Chuẩn hóa ánh xạ kiểu dữ liệu `bit(1)` giữa MySQL và Java `Boolean` (Object) để tăng độ tương thích và tránh lỗi truy vấn.

## [v1.2.0] - 2026-03-27

### ✨ Cập nhật chính
- **Tích hợp Cloudinary**: Hỗ trợ lưu trữ ảnh/video chuyên nghiệp cho sản phẩm, đánh giá và ảnh đại diện.
- **Thư viện Media**: Trang quản lý tập trung tài nguyên cho Admin.
- **Review đa phương tiện**: Người dùng có thể đính kèm nhiều ảnh/video khi viết đánh giá sản phẩm.
- **Admin Moderation**: Cho phép Admin duyệt, phản hồi và ẩn các đánh giá sản phẩm.
- **Đồng bộ Header**: Thêm menu Danh mục và Trang trại dạng dropdown động.
- **Phản hồi đánh giá**: Admin có thể trả lời trực tiếp các đánh giá của khách hàng.

## [v1.4.0] - 2026-03-28

### 💳 Thanh toán & Tự động hoá
- **Tích hợp SePay (VietQR)**: Hệ thống tự động xác nhận đơn hàng qua Webhook khi khách hàng chuyển khoản đúng nội dung `FF{orderId}`.
- **Bảo mật Webhook**: Thêm mã xác thực Token trong Header cho các yêu cầu từ SePay để ngăn chặn giả mạo dữ liệu.
- **Sửa lỗi CSRF Webhook**: Cấu hình ngoại lệ bảo mật cho phép SePay giao tiếp với Backend mà không bị chặn bởi bộ lọc CSRF.

### 🔍 Tìm kiếm & Lọc nâng cao (Advanced Filtering)
- **Bộ lọc Sản phẩm (Admin)**: Bổ sung lọc theo **Trang trại**, **Khoảng giá (Min-Max)** và nút **Xóa bộ lọc**.
- **Bộ lọc Đơn hàng (Admin)**: Thêm chức năng **Sắp xếp (Sort)** theo Ngày tạo và Tổng tiền (Tăng/Giảm).
- **Bộ lọc Người dùng (Admin)**: Thêm chức năng **Sắp xếp** theo Tên và Ngày tham gia.
- **Tìm kiếm Trang trại**: Bổ sung thanh tìm kiếm theo Tên/Tỉnh thành và lọc theo loại **Chứng nhận** (VietGAP, Organic...).

### 🛠️ Sửa lỗi & Tối ưu (Fixes & Optimization)
- **Đồng bộ Wishlist**: Sửa lỗi danh sách yêu thích không hiển thị số lượng tồn kho và điểm đánh giá trung bình.
- **Dọn dẹp mã nguồn**: Loại bỏ các Import không sử dụng và sửa lỗi Warning trong Backend Service.

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

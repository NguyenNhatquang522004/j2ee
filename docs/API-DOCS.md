# 📡 API Documentation - FreshFood

Tài liệu này cung cấp cái nhìn tổng quan về các điểm cuối (Endpoints) của hệ thống FreshFood.

## 🔗 Thông tin chung
- **Base URL (Local)**: `http://localhost:8080/api/v1`
- **Xác thực**: Sử dụng Bearer Token (JWT) trong header `Authorization`.
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

## 📂 Các nhóm API chính

### 1. 🔥 Authentication (`/auth`)
- `POST /login`: Đăng nhập và nhận JWT. Có hỗ trợ 2FA.
- `POST /register`: Đăng ký tài khoản mới.
- `POST /verify-2fa`: Xác minh mã OTP/Email sau khi đăng nhập.

### 2. 🛡️ User Management (`/users`)
- `GET /me`: Lấy thông tin cá nhân hiện tại.
- `POST /me/avatar`: Tải ảnh đại diện lên Cloudinary.
- `GET /admin/all`: (Admin) Danh sách toàn bộ người dùng.

### 3. 📦 Products & Categories (`/products`, `/categories`)
- `GET /products`: Danh sách sản phẩm (public).
- `POST /products`: (Admin) Tạo sản phẩm mới kèm hình ảnh.
- `GET /categories`: Danh mục đang hoạt động.

### 🛒 Đơn hàng & Giỏ hàng (`orders`, `order_items`, `cart_items`)
- **`Order`**: Thông tin đơn hàng (Tổng cộng, Trạng thái, Phương thức thanh toán).
    - **Định danh**: `orderCode` (ORD-...) bảo mật, chống IDOR.
    - **Thanh toán**: `isPaid` (Đã thanh toán), `isRefunded` (Đã hoàn tiền), `paidAt`, `refundedAt`.
    - **Logistics**: Địa chỉ 4 tầng (`addressDetail`, `ward`, `district`, `province`) đồng bộ hóa với hệ thống GHN/GHTK.
    - **Hậu mãi**: `returnReason`, `returnMedia` (Ảnh bằng chứng), `rejectReason`, `returnRequestedAt`.
- **`OrderItem`**: Chi tiết các sản phẩm, số lượng và giá tại thời điểm mua (Price Snapshot).

### 5. 🛒 Cart & Orders (`/cart`, `/orders`)
- `GET /cart`: Xem giỏ hàng hiện tại.
- `POST /orders`: Tạo đơn hàng mới từ giỏ hàng.

### 6. ⭐ Reviews (`/reviews`)
- `POST /reviews`: Gửi đánh giá kèm hình ảnh/video.
- `PUT /reviews/admin/{id}/moderate`: (Admin) Duyệt và phản hồi đánh giá.

### 📊 7. Dashboard & Analytics (`/dashboard`)
- `GET /dashboard`: (Admin) Lấy dữ liệu thống kê tổng hợp, doanh thu và biểu đồ hiệu suất.

### 🖼️ 8. Media Library (`/media`)
- `GET /media`: (Admin) Danh sách tài liệu đa phương tiện từ Cloudinary.
- `POST /media/upload`: Tải tệp tin mới lên hệ thống.
- `DELETE /media/{id}`: Xoá tài nguyên khỏi thư viện.

### 💳 9. Payment Gateways (`/payment`)
- `POST /vnpay/create`: Tạo URL thanh toán VnPay an toàn (Ownership-checked).
- `GET /vnpay-callback`: IPN/Redirect xử lý kết quả thanh toán từ VnPay.
- `POST /sepay-webhook`: Tự động xác thực và confirm đơn hàng từ giao dịch ngân hàng (SePay).

### 🧿 10. AI & Search (`/ai`, `/products`)
- `POST /ai/analyze`: Phân tích hình ảnh độ tươi thực phẩm qua AI.
- `GET /products (Async)`: Tìm kiếm đa tiêu chí, tích hợp Meilisearch xử lý nền (@Async) siêu tốc.

### ⚙️ 11. Settings & Infrastructure (`/settings`)
- `GET /settings/public`: Thông tin cấu hình Shop (Tên, Liên hệ, Maintenance mode) được lọc bảo mật.

---
© 2026 FreshFood Project.

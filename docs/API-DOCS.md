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

### 4. 🚜 Farms & Batches (`/farms`, `/batches`)
- `GET /farms`: Thông tin các trang trại đối tác.
- `POST /batches`: Nhập lô hàng mới cho sản phẩm.

### 5. 🛒 Cart & Orders (`/cart`, `/orders`)
- `GET /cart`: Xem giỏ hàng hiện tại.
- `POST /orders`: Tạo đơn hàng mới từ giỏ hàng.

### 6. ⭐ Reviews (`/reviews`)
- `POST /reviews`: Gửi đánh giá kèm hình ảnh/video.
- `PUT /reviews/admin/{id}/moderate`: (Admin) Duyệt và phản hồi đánh giá.

---
© 2026 FreshFood Project.

# 🗄️ Database Schema - FreshFood

Tài liệu này cung cấp chi tiết về cấu trúc các bảng và thực thể của FreshFood.

## 📊 Sơ đồ thực thể chính (Entities)

Dự án FreshFood bao gồm các thực thể cốt lõi sau:

### 👤 Người dùng (`users`)
- **`id`**: Khóa chính (Long).
- **`username`**, **`password`**: Thông tin đăng nhập.
- **`fullName`**, **`email`**: Thông tin cá nhân.
- **`avatarUrl`**: Link ảnh đại diện (Lưu trên Cloudinary).
- **`role`**: Vai trò (`ROLE_USER`, `ROLE_ADMIN`).
- **`twoFactorEnabled`**, **`twoFactorMethod`**: Cấu hình bảo mật nâng cao.

### 📦 Sản phẩm & Kho (`products`, `categories`, `batches`)
- **`Category`**: Nhóm sản phẩm (Rau, Củ, Quả, Thịt...).
- **`Product`**: Chi tiết sản phẩm, giá, ảnh, thuộc về một `Category` và `Farm`.
- **`Batch`**: Quản lý từng lô hàng cụ thể cho một `Product`, ghi nhận ngày nhập, ngày hết hạn và số lượng thực tế.

### 🚜 Đối tác (`farms`)
- **`Farm`**: Thông tin nhà nông/trang trại cung cấp thực phẩm.
- Mối quan hệ: Một `Farm` có thể cung cấp nhiều `Product`.

### 🛒 Đơn hàng & Giỏ hàng (`orders`, `order_items`, `cart_items`)
- **`Order`**: Thông tin đơn hàng (Tổng cộng, Trạng thái, Phương thức thanh toán).
- **`OrderItem`**: Chi tiết các sản phẩm và số lượng trong từng đơn hàng.

### ⭐ Tương tác (`reviews`, `review_media`)
- **`Review`**: Nhận xét khách hàng, điểm đánh giá (1-5), trạng thái duyệt và phản hồi của Admin.
- **`ReviewMedia`**: Danh sách link ảnh/video đi kèm từng đánh giá sản phẩm.

## 📏 Quy chuẩn Dữ liệu
- **`created_at`** và **`updated_at`**: Tự động ghi nhận thời gian qua các Annotation JPA.
- **Tên bảng**: Luôn sử dụng dạng số nhiều (ví dụ: `products` thay vì `product`).
- **Liên kết**: Sử dụng `FetchType.LAZY` cho các liên kết `@OneToMany` hoặc `@ManyToMany` để tối ưu hiệu năng.

---
© 2026 FreshFood Project. Bảo lưu mọi quyền.

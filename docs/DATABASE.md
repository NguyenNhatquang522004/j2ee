# 🗄️ Database Schema - FreshFood

Tài liệu này cung cấp chi tiết về cấu trúc các bảng và thực thể của FreshFood.

## 📊 Sơ đồ thực thể chính (Entities)

Dự án FreshFood bao gồm các thực thể cốt lõi sau:

### 👤 Người dùng (`users`)
- **`id`**: Khóa chính (Long).
- **`username`**: Tên đăng nhập (**Unique, Not Null**).
- **`password`**: Mật khẩu đã mã hóa (BCrypt).
- **`fullName`**: Họ tên đầy đủ (**Not Null**, Chỉ Unicode chữ cái & dấu cách).
- **`email`**: Địa chỉ email (**Unique, Not Null**, Định dạng RFC).
- **`phone`**: Số điện thoại (**Unique, Not Null**, Định dạng 10 số di động VN).
- **`avatarUrl`**: Link ảnh đại diện (Lưu trên Cloudinary).
- **`role`**: Vai trò (`ROLE_USER`, `ROLE_ADMIN`).
- **`twoFactorEnabled`**, **`twoFactorMethod`**: Cấu hình bảo mật nâng cao.

### 📦 Sản phẩm & Kho (`products`, `categories`, `product_batches`)
- **`Category`**: Nhóm sản phẩm (Rau, Củ, Quả, Thịt...).
- **`Product`**: Chi tiết sản phẩm, giá, ảnh, thuộc về một `Category` và `Farm`.
- **`ProductBatch`**: Quản lý từng lô hàng cụ thể.
    - Trạng thái: `ACTIVE`, `DISCOUNT`, `EXPIRED`, `DISCONTINUED`.
    - Ràng buộc: `productionDate` <= `importDate` < `expiryDate`.
    - Tự động hóa: Chuyển sang `DISCONTINUED` khi hết hàng, `EXPIRED` khi quá hạn.

### 🚜 Đối tác (`farms`)
- **`Farm`**: Thông tin nhà nông/trang trại cung cấp thực phẩm.
- Mối quan hệ: Một `Farm` có thể cung cấp nhiều `Product`.

### 🛒 Đơn hàng & Giỏ hàng (`orders`, `order_items`, `cart_items`)
- **`Order`**: Thông tin đơn hàng (Tổng cộng, Trạng thái, Phương thức thanh toán).
    - **Định danh**: `orderCode` (ORD-...) bảo mật, chống IDOR.
    - **Thanh toán**: `isPaid` (Đã thanh toán), `isRefunded` (Đã hoàn tiền), `paidAt`, `refundedAt`.
    - **Logistics**: Địa chỉ 4 tầng (`addressDetail`, `ward`, `district`, `province`) đồng bộ hóa hoàn toàn.
    - **Hậu mãi**: `returnReason`, `returnMedia` (Ảnh bằng chứng), `rejectReason`, `returnRequestedAt`.
- **`OrderItem`**: Chi tiết sản phẩm, số lượng và giá chốt (Price Snapshot) tại thời điểm mua.

### ⭐ Tương tác & Bảo mật (`reviews`, `coupons`, `admin_audit_logs`)
- **`Review`**: Nhận xét khách hàng, điểm đánh giá (1-5), trạng thái duyệt và phản hồi của Admin.
- **`Coupon`**: Quản lý mã giảm giá công khai và mã tặng riêng từng cá nhân (Private Voucher).
- **`AdminAuditLog`**: Ghi lại mọi hành động thay đổi dữ liệu nhạy cảm của Admin (RBAC/Audit Trail).

### 🔔 Thông báo & Đăng ký (`notifications`, `newsletter_subscribers`)
- **`Notification`**: Ghi nhận các thông báo về đơn hàng, đăng nhập và voucher cho người dùng.
- **`NewsletterSubscriber`**: Quản lý danh sách email đăng ký nhận bản tin từ `FreshFood`.

## 📏 Quy chuẩn Dữ liệu
- **`created_at`** và **`updated_at`**: Tự động ghi nhận thời gian qua các Annotation JPA.
- **Tên bảng**: Luôn sử dụng dạng số nhiều (ví dụ: `products` thay vì `product`).
- **Liên kết**: Sử dụng `FetchType.LAZY` cho các liên kết `@OneToMany` hoặc `@ManyToMany` để tối ưu hiệu năng.

---
© 2026 FreshFood Project. Bảo lưu mọi quyền.

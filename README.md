# 🥗 FreshFood - Nền tảng Thương mại điện tử Thực phẩm hữu cơ

FreshFood là một nền tảng thương mại điện tử hiện đại, chuyên cung cấp các sản phẩm thực phẩm hữu cơ, sạch và tươi sống từ các trang trại uy tín. Dự án được xây dựng với mục tiêu mang lại trải nghiệm mua sắm an toàn, tiện lợi và minh bạch cho người tiêu dùng.

## 🚀 Tính năng chính

### 🛒 Dành cho Người dùng (Storefront)
- **Duyệt sản phẩm**: Xem danh sách sản phẩm theo danh mục, trang trại hoặc tìm kiếm trực tiếp.
- **Giỏ hàng & Thanh toán**: Hệ thống giỏ hàng linh hoạt, tích hợp thanh toán VnPay (Đang phát triển) và COD.
- **Danh sách yêu thích (Wishlist)**: Lưu lại các sản phẩm quan tâm để mua sau.
- **Đánh giá đa phương tiện**: Người dùng có thể đánh giá sản phẩm kèm theo hình ảnh/video thực tế (Lưu trữ qua Cloudinary).
- **Trang cá nhân**: Quản lý thông tin cá nhân, ảnh đại diện, địa chỉ nhận hàng và lịch sử đơn hàng.
- **AI Scan**: Sử dụng trí tuệ nhân tạo để phân tích hình ảnh sản phẩm (Gợi ý công thức, thông tin dinh dưỡng).
- **Bảo mật 2 lớp (2FA)**: Bảo vệ tài khoản qua Google Authenticator hoặc Email OTP.

### 🛡️ Dành cho Quản trị (Admin Dashboard)
- **Quản lý Sản phẩm & Danh mục**: Thêm mới, cập nhật trạng thái và tồn kho.
- **Quản lý Đơn hàng**: Theo dõi và cập nhật trạng thái giao hàng.
- **Quản lý Trang trại & Lô hàng**: Theo dõi nguồn gốc thực phẩm qua từng lô hàng cụ thể.
- **Thư viện Media**: Quản lý tập trung hình ảnh/video trên Cloudinary.
- **Duyệt Đánh giá**: Kiểm duyệt và phản hồi các nhận xét từ khách hàng.
- **Bản tin (Newsletter)**: Gửi thông tin khuyến mãi đến danh sách người dùng đăng ký.

## 💻 Công nghệ sử dụng

### Backend
- **Java Spring Boot 3**: Framework chính cho backend (REST API).
- **Spring Security & JWT**: Cơ chế xác thực và phân quyền mạnh mẽ.
- **Spring Data JPA**: Giao tiếp với cơ sở dữ liệu (MySQL/H2).
- **Cloudinary SDK**: Lưu trữ và tối ưu hóa hình ảnh/video.
- **Spring Mail**: Gửi mã OTP và thông báo hệ thống.

### Frontend
- **React.js (Vite)**: Thư viện xây dựng giao diện người dùng nhanh chóng.
- **Tailwind CSS**: Framework CSS cho giao diện hiện đại, responsive.
- **Context API**: Quản lý trạng thái toàn cục (User, Cart, Wishlist).
- **Axios**: Kết nối và gọi API từ backend.
- **Heroicons**: Bộ icon vector sắc nét và đồng bộ.

## 👥 Đội ngũ phát triển

Dự án được thực hiện bởi sự cộng tác của:

1.  **Đặng Thanh Toàn** 
    - Vai trò: Chủ chốt / Frontend Architect
    - GitHub: [thanhtoan2004](https://github.com/thanhtoan2004)
2.  **Nguyễn Nhật Quang** 
    - Vai trò: Chủ chốt / Backend Architect
    - GitHub: [NguyenNhatquang522004](https://github.com/NguyenNhatquang522004)

## 📖 Tài liệu hướng dẫn

Chi tiết về dự án có thể tham khảo trong thư mục `/docs`:
- [Kiến trúc hệ thống](./docs/ARCHITECTURE.md)
- [Hướng dẫn API](./docs/API-DOCS.md)
- [Cơ sở dữ liệu](./docs/DATABASE.md)
- [Bảo mật & 2FA](./docs/SECURITY.md)
- [Triển khai hệ thống](./docs/DEPLOYMENT.md)
- [Nhật ký thay đổi](./docs/CHANGELOG.md)

---
© 2026 FreshFood Project. Bảo lưu mọi quyền.

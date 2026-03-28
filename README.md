# 🥗 FreshFood - Nền tảng Thương mại điện tử Thực phẩm hữu cơ

FreshFood là một nền tảng thương mại điện tử hiện đại, chuyên cung cấp các sản phẩm thực phẩm hữu cơ, sạch và tươi sống từ các trang trại uy tín. Dự án được xây dựng với mục tiêu mang lại trải nghiệm mua sắm an toàn, tiện lợi và minh bạch cho người tiêu dùng.

## 🚀 Tính năng chính

### 🛒 Dành cho Người dùng (Storefront)
- **Duyệt sản phẩm**: Xem danh sách sản phẩm theo danh mục, trang trại hoặc tìm kiếm trực tiếp.
- **Giỏ hàng & Thanh toán**: Hệ thống giỏ hàng linh hoạt, tích hợp thanh toán VnPay (Đang phát triển) và COD.
- **Danh sách yêu thích (Wishlist)**: Lưu lại các sản phẩm quan tâm để mua sau.
- **Đánh giá đa phương tiện**: Người dùng có thể đánh giá sản phẩm kèm theo hình ảnh/video thực tế (Lưu trữ qua Cloudinary).
- **Trang cá nhân**: Quản lý thông tin cá nhân, ảnh đại diện, địa chỉ nhận hàng và lịch sử đơn hàng.
- [AI Scan](./docs/ARCHITECTURE.md): Sử dụng trí tuệ nhân tạo để phân tích sản phẩm.
- **Giám sát & Log**: Tích hợp **Sentry** (Theo dõi lỗi) và **Structured JSON Logging**.
- **Tìm kiếm nâng cao**: Tích hợp **Meilisearch** cho tốc độ tìm kiếm cực nhanh.

### 🛡️ Dành cho Quản trị (Admin Dashboard)
- **Quản lý Sản phẩm & Danh mục**: Thêm mới, cập nhật trạng thái và tồn kho.
- **Quản lý Nhân sự**: Hệ thống phân quyền cụ thể cho từng nhân viên (RBAC).
- **Hệ thống Mã giảm giá**: Quản lý Voucher công khai/riêng tư và logic tặng quà cá nhân.
- **Audit Logs**: Nhật ký hoạt động quản trị viên đạt tiêu chuẩn audit doanh nghiệp.
- **CI/CD Pipeline**: Tự động Build & Test qua **GitHub Actions**.

## 💻 Công nghệ sử dụng

### Backend
- **Java Spring Boot 21**: Framework chính (REST API).
- **Security Grade 3**: Đạt chuẩn Enterprise với CSRF Strict Match, Sliding Window Rate Limit và Pessimistic Locking.
- **Spring Security (RBAC + Custom Perms)**: Phân quyền theo Role và tùy chỉnh cho từng nhân sự.
- **Redis & Meilisearch**: Cache, Rate Limiting và Search Engine.
- **Sentry**: Error Tracking & Performance Monitoring.
- **Logstash/Logback**: Structured JSON Logging.

### Infrastructure & DevOps
- **Docker & Docker Compose**: Đóng gói toàn bộ stack (App, Redis, Meilisearch, MailHog).
- **GitHub Actions**: Tự động hóa quy trình CI (Lint, Test, Build Docker).
- **MailHog**: Môi trường giả lập SMTP để kiểm thử email.

© 2026 FreshFood Project. Bảo lưu mọi quyền.

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
- [Bảo mật & Phân quyền](./docs/SECURITY.md)
- [Triển khai Docker](./docs/DEPLOYMENT.md)
- [Nhật ký thay đổi](./docs/CHANGELOG.md)

---
© 2026 FreshFood Project. Bảo lưu mọi quyền.

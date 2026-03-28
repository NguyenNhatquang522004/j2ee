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
- **Quản lý Sản phẩm & Danh mục**: Thêm mới, cập nhật trạng thái, tồn kho, lọc theo trang trại và khoảng giá.
- **Quản lý Đơn hàng**: Theo dõi trạng thái, tìm kiếm mã đơn/khách hàng và sắp xếp theo ngày/giá tiền.
- **Tích hợp Thanh toán Tự động**: Hỗ trợ **SePay (VietQR)** với Webhook bảo mật bằng Token, tự động xác nhận đơn hàng khi có tiền về.
- **Bảo mật Nâng cao**: Đạt tiêu chuẩn Enterprise với CSRF Strict Match, Sliding Window Rate Limit (Redis) và Account Lockout sau 5 lần sai mật khẩu.
- **Quản lý Nhân sự**: Hệ thống phân quyền cụ thể cho từng nhân viên (RBAC).
- **Hệ thống Mã giảm giá**: Quản lý Voucher công khai/riêng tư và logic tặng quà cá nhân.
- **Audit Logs**: Nhật ký hoạt động quản trị viên đạt tiêu chuẩn audit doanh nghiệp.
- **CI/CD Pipeline**: Tự động Build & Test qua **GitHub Actions**.

## 🛠️ Hướng dẫn cài đặt nhanh (Quick Start)

Lưu ý: Bạn cần cài đặt [Docker](https://www.docker.com/) và [Docker Compose](https://docs.docker.com/compose/) trên máy.

1.  **Clone dự án:**
    ```bash
    git clone https://github.com/NguyenNhatquang522004/j2ee.git
    cd j2ee
    ```

2.  **Cấu hình biến môi trường:**
    Sao chép file mẫu `.env.example` thành `.env` và điền các thông tin cần thiết (Cloudinary, JWT Secret...):
    ```bash
    cp .env.example .env
    ```

3.  **Khởi chạy toàn bộ hệ thống bằng Docker:**
    ```bash
    docker-compose up -d --build
    ```

4.  **Truy cập ứng dụng:**
    - **Frontend:** [http://localhost](http://localhost) (Cổng 80)
    - **Backend API:** [http://localhost:8080/api-docs](http://localhost:8080/api-docs) (Swagger UI)
    - **MailHog (Kiểm tra Email):** [http://localhost:8025](http://localhost:8025)
    - **Meilisearch UI:** [http://localhost:7700](http://localhost:7700)

## 💻 Công nghệ sử dụng

### Backend
- **Java Spring Boot 21**: Framework chính (REST API).
- **Security Grade 3**: Đạt chuẩn Enterprise với CSRF Strict Match, Sliding Window Rate Limit và Pessimistic Locking.
- **Spring Security (RBAC + Custom Perms)**: Phân quyền theo Role và tùy chỉnh cho từng nhân sự.
- **Redis & Meilisearch**: Cache, Rate Limiting và Search Engine.
- **Sentry**: Error Tracking & Performance Monitoring.
- **Logstash/Logback**: Structured JSON Logging.

### Frontend
- **React 18 + Vite**: Thư viện UI hiện đại và tốc độ build cực nhanh.
- **Tailwind CSS**: Framework styling tiện lợi, tối ưu.
- **Lucide React**: Hệ thống Icon phong phú.
- **Framer Motion**: Animation mượt mà, cao cấp.

### Infrastructure & DevOps
- **Docker & Docker Compose**: Container hóa toàn bộ stack (App, Redis, Meilisearch, MailHog).
- **GitHub Actions**: Tự động hóa quy trình CI (Lint, Test, Build Docker).
- **MailHog**: Môi trường giả lập SMTP để kiểm thử email nhanh chóng.

## 📂 Cấu trúc thư mục

```text
j2ee/
├── demo/            # Mã nguồn Backend (Spring Boot)
├── frontend/        # Mã nguồn Frontend (React + Vite)
├── ai-service/      # Dịch vụ AI (Python/Flask - Mock)
├── docs/            # Hệ thống tài liệu dự án
├── docker-compose.yml # Cấu hình chạy Docker Stack
└── .env.example     # File mẫu cấu hình biến môi trường
```

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
### 🤖 AI Freshness Service (Phụ trợ)
Dịch vụ PythonFlask sử dụng YOLOv8 để phân tích độ tươi của thực phẩm qua hình ảnh.
1.  Truy cập thư mục `/ai-service`.
2.  Làm theo hướng dẫn trong [ai-service/README.md](file:///d:/j2ee/ai-service/README.md) để cài đặt Python và tải Model.
3.  Server AI sẽ chạy tại `http://localhost:5001`.

---
© 2026 FreshFood Project. Bảo lưu mọi quyền.

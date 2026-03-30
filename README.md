# 🥗 FreshFood - Nền tảng Thương mại điện tử Thực phẩm hữu cơ

FreshFood là một nền tảng thương mại điện tử hiện đại, chuyên cung cấp các sản phẩm thực phẩm hữu cơ, sạch và tươi sống từ các trang trại uy tín. Dự án được xây dựng với mục tiêu mang lại trải nghiệm mua sắm an toàn, tiện lợi và minh bạch cho người tiêu dùng.

## 🚀 Tính năng chính

### 🛒 Dành cho Người dùng (Storefront)
- **Duyệt sản phẩm**: Xem danh sách sản phẩm theo danh mục, trang trại hoặc tìm kiếm trực tiếp.
- **Giỏ hàng & Thanh toán**: Hệ thống giỏ hàng linh hoạt, tích hợp thanh toán VnPay (Đang phát triển) và COD.
- **Danh sách yêu thích (Wishlist)**: Đã nâng cấp đồng bộ thông tin (Trang trại, Tồn kho, Nhãn mới) và tối ưu hóa tốc độ xử lý.
- **So sánh Sản phẩm**: Hệ thống so sánh thông số chi tiết giữa các sản phẩm giúp người dùng dễ dàng lựa chọn.
- **Flash Sale & Khuyến mãi**: Hiển thị ưu đãi Flash Sale thời gian thực với nhãn giảm giá đỏ rực rỡ và logic ưu tiên giá tốt nhất.
- **Hệ thống Xác nhận Toàn cầu (Global Confirm)**: Thay thế hoàn toàn các hộp thoại trình duyệt (window.confirm) bằng Promise-based Modal cao cấp, đồng bộ trải nghiệm người dùng toàn hệ thống.
- **Hệ thống Hội viên (Loyalty)**: Tích điểm tự động khi mua hàng (1K VND = 1 Point), phân hạng Bronze/Silver/Gold/Platinum và tự động nâng cấp membership trọn đời.
- **Tìm kiếm nâng cao**: Tích hợp **Meilisearch** qua REST API tùy chỉnh (không dùng SDK) cho tốc độ tìm kiếm cực nhanh và khả năng tùy biến cao.
- **Phục hồi & Hiệu năng (v2.1)**: Đạt trạng thái Zero-Warning, nén dữ liệu GZIP tự động và hoàn thiện quy trình phục hồi Database an toàn qua Docker.
- **Bảo mật Hạ tầng**: Hệ thống Whitelist tự động và cơ chế bảo vệ Actuator đặc quyền cho Admin, ngăn chặn rò rỉ thông tin máy chủ.

### 🛡️ Dành cho Quản trị (Admin Dashboard)
- **Dashboard Thông minh**: Trực quan hóa dữ liệu qua biểu đồ doanh thu 7 ngày, hệ thống phím tắt "Quick Actions" và danh sách nhiệm vụ ưu tiên.
- **Bảo mật Đa tầng (Hardening)**: Đạt tiêu chuẩn Enterprise với Account Lockout (chống Brute-force), IP Blocklist, Admin IP Whitelisting, WebSocket Security (bỏ qua filter cho endpoint /ws/info đầu cuối), và Security Stamp (Vô hiệu hóa phiên tức thì).
- **Payment Security**:
    - **Checksum Validation**: Mọi callback từ VnPay/SePay đều được xác thực chữ ký (Signature) bằng thuật toán HMAC-SHA512/Token bí mật trước khi xử lý.
    - **Ownership Enforcement**: Chỉ chủ sở hữu đơn hàng mới có quyền tạo link thanh toán (Logic trong `PaymentController`).
- **Data Integrity**: Chuyển sang Flyway đảm bảo cấu trúc database không bị thay đổi ngẫu nhiên ngoài ý muốn.
- **Làm sạch Dữ liệu (XSS Protection)**: Tích hợp Jsoup filter ngăn chặn tấn công Script Injection trên toàn hệ thống.
- **Quản lý Thư viện Media**: Tích hợp Storage Analytics, xem trước video mượt mà và quản lý tài nguyên tập trung qua Cloudinary.
- **Giao diện Responsive 100%**: Trải nghiệm quản trị hoàn hảo trên mọi thiết bị với Sidebar trượt và bố cục bảng dữ liệu thông minh.
- **SePay (VietQR)**: Tự động hóa quy trình thanh toán qua Webhook bảo mật, xác nhận đơn hàng tức thì.
- **Quản lý Nhân sự & Phân quyền**: Hệ thống RBAC với ma trận quyền hạn chi tiết và quản lý Audit Logs chuyên nghiệp.
- **Hệ thống Mã giảm giá**: Quản lý Voucher công khai/riêng tư và logic tặng quà cá nhân.
- **Tự động hoá Bảo trì**: Hệ thống Scheduled Tasks dọn dẹp đơn hàng ảo quá hạn và tối ưu dung lượng Database.

### 🏗️ Cột mốc Hạ tầng & Bảo mật (Infrastructure Milestones)
- **Database Migration**: Tích hợp **Flyway**, quản lý phiên bản database đồng bộ giữa các môi trường, đảm bảo tính toàn vẹn của dữ liệu trong quá trình mở rộng.
- **Stock Integrity**: Hệ thống **Redis Stock Reservation** (Giữ chỗ tồn kho 15 phút) giúp chống "overselling" khi khách đặt hàng nhưng chưa hoàn tất thanh toán.
- **Payment Gateway**: Tích hợp **VnPay 2.1.0** với luồng bảo mật HMAC-SHA512 và xác thực Signature nghiêm ngặt từ Backend.
- **Zero-Warning Code**: Đã rà soát thủ công toàn bộ mã nguồn, bổ sung JavaDoc và xử lý triệt để các cảnh báo kỹ thuật (Raw types, unused imports).
- **Logging & Auditing**: Hệ thống Audit Logs tập trung ghi nhận mọi tác động đến dữ liệu của quản trị viên để phục vụ bảo soát.

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

### Backend (Spring Boot 3.x)
- **Spring Data JPA**: Quản lý thực thể và tương tác cơ sở dữ liệu.
- **Spring Security + JWT**: Bảo mật hệ thống, phân quyền (RBAC) và xác thực 2 lớp (2FA).
- **Redis**: Caching, Stock Reservation (giữ chỗ tồn kho) và xử lý Rate Limiting.
- **Flyway**: Quản lý phiên bản cơ sở dữ liệu (Database Migration).
- **VNPAY & SePay**: Hệ thống thanh toán trực tuyến qua cổng thẻ và QR Code.
- **Bucket4j**: Giới hạn tần suất yêu cầu (Rate Limiting) kết hợp Redis.
- **Sentry**: Giám sát lỗi và báo cáo Log thời gian thực.

### Frontend
- **React 18 + Vite**: Thư viện UI hiện đại với tốc độ build và hot-reload cực nhanh.
- **Tailwind CSS**: Framework CSS tiện lợi giúp xây dựng giao diện tùy biến, responsive 100%.
- **Heroicons**: Hệ thống Icons chuẩn từ đội ngũ Tailwind Labs.
- **React Router 7**: Hệ thống định tuyến mạnh mẽ cho Single Page Application.
- **Axios & Context API**: Xử lý gọi API và quản lý trạng thái ứng dụng tập trung.
- **React Hot Toast**: Hệ thống thông báo (Toast Notifications) trực quan, mượt mà.

### Infrastructure & Services
- **Docker & Docker Compose**: Container hóa toàn bộ stack (App, Database, Redis, Meilisearch, MailHog).
- **Redis**: Cấu trúc dữ liệu trong bộ nhớ (In-memory), sử dụng cho Caching, Stock Reservation và Rate Limiting.
- **Cloudinary**: Dịch vụ quản lý, lưu trữ và tối ưu hóa hình ảnh/video chuyên nghiệp.
- **Meilisearch**: Công cụ tìm kiếm tốc độ cao (Search Engine) tích hợp qua Docker.
- **GitHub Actions**: Tự động hóa quy trình CI (Lint, Test, Build Docker Image).
- **MailHog**: Môi trường giả lập SMTP dành cho việc kiểm thử email trong quá trình phát triển.

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

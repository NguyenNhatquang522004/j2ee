<p align="center">
  <img src="./docs/assets/logo.png" alt="FreshFood Logo" width="200" />
</p>

# 🥗 FreshFood - Nền tảng Thương mại điện tử Thực phẩm hữu cơ

FreshFood là một nền tảng thương mại điện tử hiện đại, chuyên cung cấp các sản phẩm thực phẩm hữu cơ, sạch và tươi sống từ các trang trại uy tín. Dự án được xây dựng với mục tiêu mang lại trải nghiệm mua sắm an toàn, tiện lợi và minh bạch cho người tiêu dùng.

## 🚀 Tính năng chính

### 🛒 Dành cho Người dùng (Storefront)
- **Duyệt sản phẩm**: Xem danh sách sản phẩm theo danh mục, trang trại, tìm kiếm hoặc truy cập trực tiếp qua **SEO-friendly Slugs** (VD: `/products/thit-bo-tuoi`).
- **Giỏ hàng & Thanh toán**: Hệ thống giỏ hàng linh hoạt, tích hợp thanh toán VnPay và COD với định danh **OrderCode** (ORD-...) bảo mật.
- **Danh sách yêu thích (Wishlist)**: Đã nâng cấp đồng bộ thông tin (Trang trại, Tồn kho, Nhãn mới) và tối ưu hóa tốc độ xử lý.
- **So sánh Sản phẩm**: Hệ thống so sánh thông số chi tiết giữa các sản phẩm giúp người dùng dễ dàng lựa chọn.
- **Flash Sale & Khuyến mãi**: Hiển thị ưu đãi Flash Sale thời gian thực với nhãn giảm giá đỏ rực rỡ và logic ưu tiên giá tốt nhất.
- **Hệ thống Xác nhận Toàn cầu (Global Confirm)**: Thay thế hoàn toàn các hộp thoại trình duyệt (window.confirm) bằng Promise-based Modal cao cấp, đồng bộ trải nghiệm người dùng toàn hệ thống.
- **Hệ thống Hội viên (Loyalty 2.0)**: Tích điểm tự động với tỉ lệ tùy chỉnh (`LOYALTY_RATIO`), hỗ trợ đổi điểm lấy giảm giá khi thanh toán, tự động nâng cấp phân hạng (Bronze/Silver/Gold/Platinum) dựa trên Lifetime Points với cơ chế Null-safe tuyệt đối.
- **Tự quản lý Đánh giá**: Người dùng có thể chủ động **Chỉnh sửa** hoặc **Xóa** các bài đánh giá của chính mình trực tiếp trong tab Lịch sử đánh giá của trang Hồ sơ (Profile).
- **Định danh & Xác thực Việt Nam**: Hệ thống **Standardized Vietnamese Validation** với Regex chuẩn 10 số di động theo tiền tố nhà mạng VN, hỗ trợ Unicode full-name (không số/ký tự lạ) và tự động chuẩn hóa dữ liệu (`+84` -> `0`, lowercase email) trước khi lưu trữ.
- **Tìm kiếm nâng cao (Asynchronous)**: Tích hợp **Meilisearch** xử lý bất đồng bộ (@Async), hỗ trợ tìm kiếm Tiếng Việt siêu tốc mà không ảnh hưởng đến hiệu năng giao dịch.
- **Phục hồi & Hiệu năng (v3.4)**: Đạt trạng thái Zero-Warning, giải quyết triệt để N+1 Query, nén dữ liệu GZIP và tối ưu hóa Timeout cho các dịch vụ phụ trợ.
- **Bảo mật Hạ tầng & Quản trị**: Hệ thống **Admin Settings** tập trung, Admin IP Whitelist, và **Maintenance Mode** linh hoạt cho phép đóng hệ thống an toàn để nâng cấp.
- **Mắt thần Giám sát (Observability)**: Hệ thống **SLF4J Logging** tập trung giúp truy vết 100% vòng đời đơn hàng và các Callback tài chính (VnPay/SePay).
- **Tính năng AI**: Tích hợp **AI Image Analysis** đánh giá độ tươi thực phẩm với luồng xử lý ảnh mượt mà.

### 🛡️ Dành cho Quản trị (Admin Dashboard)
- **Dashboard Thông minh**: Trực quan hóa dữ liệu qua biểu đồ doanh thu 7 ngày, hệ thống phím tắt "Quick Actions" và danh sách nhiệm vụ ưu tiên.
- **Bảo mật Đa tầng (Hardening)**: Đạt tiêu chuẩn Enterprise với Account Lockout, IP Blocklist, **JWT Kill Switch** (vô hiệu hóa phiên tức thì), **CSP (Content Security Policy)**, WebSocket Security, và Security Stamp.
- **Payment Security & Observability**:
    - **Checksum Validation**: Xác thực chữ ký Callback từ VnPay/SePay bằng HMAC-SHA512.
    - **Financial Traceability**: Logging chi tiết dữ liệu thô (Raw payload) từ cổng thanh toán để phục vụ đối soát và Audit tài chính.
    - **Ownership Enforcement**: Kiểm soát quyền sở hữu đơn hàng nghiêm ngặt tại Controller layer.
- **Data Integrity**: Chuyển sang Flyway đảm bảo cấu trúc database không bị thay đổi ngẫu nhiên ngoài ý muốn.
- **Làm sạch Dữ liệu (XSS Protection)**: Tích hợp Jsoup filter ngăn chặn tấn công Script Injection trên toàn hệ thống.
- **Quản lý Thư viện Media**: Tích hợp Storage Analytics, xem trước video mượt mà và quản lý tài nguyên tập trung qua Cloudinary.

## 📜 Tài liệu Kỹ thuật Chi tiết
Xem thêm các tài liệu chi tiết về hệ thống tại thư mục `/docs`:
- [🏗️ Kiến trúc hệ thống (Architecture)](./docs/ARCHITECTURE.md)
- [🛡️ Chính sách bảo mật (Security)](./docs/SECURITY.md)
- [📡 Hướng dẫn API (API Docs)](./docs/API-DOCS.md)
- [🗄️ Cơ sở dữ liệu (Database)](./docs/DATABASE.md)
- [🚀 Triển khai hệ thống (Deployment)](./docs/DEPLOYMENT.md)
- [📜 Nhật ký thay đổi (Changelog)](./docs/CHANGELOG.md)
- **Giao diện Responsive 100%**: Trải nghiệm quản trị hoàn hảo trên mọi thiết bị với Sidebar trượt và bố cục bảng dữ liệu thông minh.
- **SePay (VietQR)**: Tự động hóa quy trình thanh toán qua Webhook bảo mật, xác nhận đơn hàng tức thì.
- **Quản lý Nhân sự & Phân quyền (Granular RBAC v3.5)**: 
    - **Ma trận quyền hạn chi tiết**: Chuyển đổi từ ROLE-based sang Authority-based, cho phép phân tách quyền **"Chỉ xem" (View)** và **"Toàn quyền" (Manage)** cho từng mô-đun (Sản phẩm, Đơn hàng, Kho hàng, Media, Dashboard).
    - **UI Protection**: Tự động ẩn các nút thao tác (Thêm/Sửa/Xóa) dựa trên quyền hạn thực tế của nhân viên.
    - **Audit Logs**: Ghi nhận 100% lịch sử truy cập và thay đổi của nhân sự quản trị.
- **Tùy biến Hồ sơ & Bảo mật**:
    - **Quản trị Avatar**: Hỗ trợ tải lên, thay thế và gỡ bỏ ảnh đại diện (Admin/User) với hệ thống fallback tên viết tắt chuyên nghiệp.
    - **Nhãn địa chỉ tùy chỉnh**: Cho phép đặt tên gợi nhớ cho địa chỉ nhận hàng (Ví dụ: Nhà vườn, Cơ quan, Kho đông lạnh...) thay vì các nhãn cố định.
    - **Role-aware Error Pages**: Trang 404 thông minh tự động chuyển đổi giao diện (Admin/User Layout) dựa trên quyền hạn của người dùng.
- **Hệ thống Mã giảm giá**: Quản lý Voucher công khai/riêng tư và logic tặng quà cá nhân.
- **Quản lý Lô hàng & Date**: Hệ thống quản lý **Inventory Batch v2.0** với ràng buộc ngày nhập/sản xuất/hết hạn nghiêm ngặt (chặn lỗi nhập liệu sau 2099), tự động chuyển trạng thái `EXPIRED` và `DISCONTINUED` thông qua bộ quét hàng ngày (Scheduler).
- **Tự động hoá Bảo trì**: Hệ thống Scheduled Tasks dọn dẹp đơn hàng ảo quá hạn và tối ưu dung lượng Database.

### 🏗️ Cột mốc Hạ tầng & Bảo mật (Infrastructure Milestones)
- **Database Migration**: Tích hợp **Flyway**, quản lý phiên bản database đồng bộ giữa các môi trường. Bản nâng cấp **V3** bổ sung cơ chế Fulltext Search và Soft Delete.
- **Stock Integrity**: Hệ thống **Redis Stock Reservation** kết hợp với chiến lược **FEFO** (First Expired, First Out). Tự động trừ kho tại bước `PACKAGING` cho đơn COD và `CONFIRMED` cho đơn trả trước để đảm bảo tuyệt đối không bán vượt mức (Zero Overselling).
- **Database Hardening**: Áp dụng ràng buộc cứng `UNIQUE` & `NOT NULL` cho các định danh cá nhân (`Username`, `Email`, `Phone`) trực tiếp tại database dump giúp đảm bảo toàn vẹn dữ liệu gốc.
- **Soft Delete (v3.0)**: Áp dụng trên toàn bộ hệ thống (Hibernate 6 `@SQLRestriction`), đảm bảo dữ liệu quan trọng không bị xóa vĩnh viễn, phục vụ đối soát và báo cáo.
- **SEO & Search**: Tích hợp **SEO-friendly Slugs** cho URL sản phẩm và Meilisearch đồng bộ thời gian thực qua Webhook/Events.
- **Payment Gateway**: Tích hợp **VnPay 2.1.0** và **SePay** với luồng bảo mật HMAC-SHA512, sử dụng mã hóa Base64 cho Secret Keys và xác thực Signature nghiêm ngặt.
- **Zero-Warning Code**: Đã rà soát thủ công toàn bộ mã nguồn, bổ sung JavaDoc và xử lý triệt để các cảnh báo kỹ thuật (Raw types, unused imports, Null-safety).
- **Security Auditing**: Hệ thống **Security Logs** tập trung ghi nhận mọi nỗ lực truy cập dẫm chân IP (IP Whitelisting) và thay đổi trạng thái đơn hàng nhạy cảm.

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
- **Redis**: Caching, Stock Reservation (giữ chỗ tồn kho), xử lý Rate Limiting và Centralized Session Tracking.
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

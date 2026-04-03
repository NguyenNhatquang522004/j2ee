# 🛡️ RAWFOOD PROJECT: ĐỊNH DANH HỆ SINH THÁI CÔNG NGHỆ

Dự án **RawFood** là sự kết hợp hoàn hảo giữa các giải pháp lưu trữ nội tại (Library-based) và các nền tảng dịch vụ hàng đầu thế giới (SaaS/External Services).

---

## 🌐 1. CÁC NỀN TẢNG DỊCH VỤ NGOẠI VI (EXTERNAL SERVICES / SAAS)
Đây là các dịch vụ trả phí hoặc nền tảng đám mây được tích hợp qua API để đảm bảo tính sẵn sàng và chuyên nghiệp.

### 💰 Tài chính & Thanh toán (FinTech)
*   **SePay (SaaS)**: Nền tảng tự động hóa theo dõi biến động số dư ngân hàng qua Webhook. Giúp hệ thống tự confirm đơn hàng khi khách chuyển khoản.
*   **VnPay Gateway (API)**: Cổng thanh toán quốc gia, hỗ trợ quét QR, thẻ nội địa và quốc tế.
*   **Google OAuth2**: Dịch vụ xác thực trung gian cho phép đăng nhập qua tài khoản Google.

### 🤖 Trí tuệ nhân tạo & Hình ảnh (AI & Content)
*   **Roboflow (AI Platform)**: Dịch vụ lưu trữ Dataset và triển khai Model AI dưới dạng Inference API cho `ai-service`.
*   **Cloudinary (Media SaaS)**: Mạng lưới CDN toàn cầu dùng để lưu trữ và nén ảnh sản phẩm tự động, tối ưu tốc độ tải trang.

### 🔭 Vận hành & Bảo mật (Ops & Security)
*   **Sentry.io (SaaS)**: Nền tảng giám sát lỗi thời gian thực, báo cáo sự cố trực tiếp khi có lỗi Runtime phát sinh.
*   **Google Authenticator (App)**: Ứng dụng di động xác thực TOTP dùng cho bảo mật 2 lớp (2FA).
*   **Gmail/SendGrid (Email Service)**: Hạ tầng gửi thư điện tử thương mại (Invoices, OTP).
*   **Redis Cloud**: Dịch vụ lưu trữ RAM đám mây giúp đồng bộ Session và Rate limit.

---

## 🏗️ 2. KHUNG XƯƠNG KỸ THUẬT NỘI TẠI (FRAMEWORKS & LIBRARIES)
Đây là các thư viện và bộ khung (dependencies) được cài đặt trực tiếp trong mã nguồn dự án.

### 🔒 Backend (J2EE - Spring Boot)
*   **Spring Boot 3.4.4 & Java 21**: Nền tảng xử lý logic chính.
*   **Spring Security**: Thư viện quản lý phân quyền và mã hóa mật khẩu.
*   **Spring Data JPA**: Thư viện ORM tương tác với MySQL.
*   **JJWT & Lombok**: Thư viện xử lý Token và tối ưu hóa code.
*   **Flyway**: Thư viện quản lý di trú cơ sở dữ liệu.
*   **Bucket4j**: Thư viện hỗ trợ giới hạn tần suất truy cập (Rate Limiting).

### 🎨 Frontend (React Premium)
*   **React 18.3.1 & Vite**: Bộ đôi Framework UI và Build Tool siêu tốc.
*   **TailwindCSS 3.4**: Thư viện thiết kế giao diện theo phương pháp Utility-first.
*   **React Router 7**: Thư viện điều hướng trang (SPA).
*   **Axios & StompJS**: Thư viện gọi API và kết nối WebSocket thời gian thực.
*   **Framer Motion**: Thư viện tạo các micro-animations mượt mà.

### 🐍 AI Service (Python Stack)
*   **Flask**: Micro-framework cho dịch vụ nhận diện.
*   **Ultralytics (YOLOv8)**: Thư viện Deep Learning cốt lõi cho Computer Vision.
*   **OpenCV**: Thư viện xử lý thị giác máy tính và ma trận hình ảnh.

---

## ⚙️ 3. HẠ TẦNG VẬN HÀNH (INFRASTRUCTURE)
Hệ thống sử dụng các nền tảng tự lưu trữ (Self-hosted) để tối ưu hóa hiệu năng và quyền kiểm soát.

*   **Docker & Docker Compose**: Đóng gói toàn bộ hệ thống vào Container để triển khai mọi nơi.
*   **Nginx**: Reverse Proxy tối ưu hóa luồng dữ liệu cho Frontend.
*   **MySQL 8.0**: Hệ quản trị cơ sở dữ liệu quan hệ chính.
*   **Meilisearch (Self-hosted)**: Công cụ tìm kiếm chuyên sâu (Full-text Search Engine) siêu tốc, chịu trách nhiệm cho mọi thao tác tìm kiếm sản phẩm và dữ liệu trên hệ thống.
*   **Redis**: Lưu trữ RAM nội tại giúp tăng tốc Session và Rate limit.

---
> [!IMPORTANT]
> Sự kết hợp rạch ròi giữa **SaaS (Bên ngoài)** và **Library (Bên trong)** giúp RawFood vừa có được sự bảo mật tối thượng, vừa đạt được tốc độ phát triển và triển khai thần tốc.

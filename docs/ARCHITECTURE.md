# 🏗️ System Architecture - FreshFood

Tài liệu này mô tả sơ đồ hệ thống và cấu trúc thành phần của FreshFood.

## 🌉 Sơ đồ Tổng quan (High-level Architecture)

FreshFood được thiết kế theo kiến trúc **Monolithic** hiện đại với các thành phần decoupled:
1.  **Frontend (Client)**: Ứng dụng React 18+ (Vite) xử lý giao diện, logic trạng thái và tương tác người dùng qua Context API.
2.  **Backend (Server)**: Java 21 + Spring Boot 3 cung cấp RESTful API và xử lý nghiệp vụ, bảo mật.
3.  **Database (Persistence Layer)**: MySQL (Dockerized) để lưu trữ dữ liệu bền vững.

4.  **External Services**:
    -   **Cloudinary**: Xử lý và lưu trữ hình ảnh/video (Asset Management).
    -   **SMTP Server**: Gửi Email OTP và thông báo.
    -   **AI Scan**: Xử lý phân tích thực phẩm bằng mô hình học máy tích hợp.
    -   **Meilisearch**: Công cụ tìm kiếm tốc độ cao cho sản phẩm và bài viết.
    -   **Sentry**: Theo dõi lỗi (Error Tracking) và hiệu năng hệ thống theo thời gian thực.
    -   **MailHog**: Máy chủ SMTP giả lập cho việc kiểm thử email trong Docker.

## 📂 Phân cấp Gói (Package Structure)

### 🍃 Spring Boot Backend (`/demo`)
Dự án được phân chia theo kiến trúc 3 lớp chuẩn:
- **`controller`**: Điểm đón yêu cầu HTTP và trả về `ApiResponse`.
- **`service`**: Chứa logic nghiệp vụ xử lý chính.
- **`repository`**: Giao tiếp với cơ sở dữ liệu qua Hibernate/JPA.
- **`dto`**: Đối tượng chuyển đổi dữ liệu, tách biệt giữa dữ liệu API và dữ liệu Entity.
- **`security`**: Tầng bảo mật chứa bộ lọc JWT, cấu hình CORS và 2FA.

### ⚛️ React Frontend (`/frontend`)
- **`/api`**: Định nghĩa các dịch vụ gọi API qua Axios.
- **`/components`**: Các thành phần giao diện nhỏ, tái sử dụng cao. Bao gồm `AdminLayout` - khung sườn hợp nhất cho toàn bộ module quản trị với khả năng tự thích ứng màn hình (Responsive Shell).
- **`/context`**: Lớp quản lý trạng thái tập trung (State Management).
- **`/pages`**: Các view chính của hệ thống.

## ⚡ Kiến trúc Tìm kiếm & Cấu hình (Search & Settings)

### 🏎️ Search Architecture (REST-driven)
Để đạt được sự ổn định cao nhất trong môi trường Docker, FreshFood sử dụng kiến trúc tìm kiếm dựa trên REST thay vì SDK truyền thống:
- **RestTemplate Integration**: Backend giao tiếp trực tiếp với Meilisearch qua HTTP Client, giúp loại bỏ các lỗi tương thích phiên bản của thư viện SDK.
- **Master Key Security**: Xác thực được thực hiện ở tầng Server, đảm bảo Key tìm kiếm không bao giờ bị lộ ra Frontend.

### 🛡️ Public Settings Whitelist
Hệ thống quản lý cấu hình được thiết kế theo nguyên tắc "Tối thiểu quyền hạn":
- **Config Privacy Layer**: API cấu hình công khai `/api/v1/settings/public` chỉ trả về danh sách các Key đã được định nghĩa trong mã nguồn (Hard-coded Whitelist).
- **Data Security**: Mọi thiết lập nhạy cảm sẽ bị lọc bỏ tự động trước khi gửi tới Client, ngăn chặn rò rỉ thông tin hạ tầng.

---
© 2026 FreshFood Project. Bảo lưu mọi quyền.

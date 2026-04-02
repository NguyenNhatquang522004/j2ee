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

### 🏎️ Search Architecture (Asynchronous & REST-driven)
FreshFood sử dụng kiến trúc tìm kiếm "Resilient & Non-blocking" để đạt được sự ổn định cao nhất:
- **Asynchronous Indexing (@Async)**: Mọi thao tác cập nhật (Index) hoặc xóa (Delete) sản phẩm trên Meilisearch đều được đẩy xuống luồng chạy nền, giúp luồng giao dịch đặt hàng không bị phụ thuộc vào độ trễ của hệ thống tìm kiếm.
- **Resiliency Timeouts**: Thiết lập cơ chế Timeout gắt gao (Connect: 2s, Read: 3s) thông qua `RestTemplate` tùy chỉnh, đảm bảo hệ thống không bị treo hoặc "sụp đổ dây chuyền" khi Meilisearch gặp sự cố hoặc quá tải.
- **Master Key Security**: Xác thực được thực hiện ở tầng Server, đảm bảo Key tìm kiếm không bao giờ bị lộ ra Frontend.

### 🧿 Observability Layer (Deep Traceability)
Để đảm bảo khả năng giám sát 24/7 và khắc phục sự cố tức thì:
- **Comprehensive Logging (SLF4J)**: Hệ thống triển khai Logging tập trung tại các "nút thắt" quan trọng: Vòng đời đơn hàng (Order Lifecycle), Thanh toán (Payment Callback), và Bộ lọc bảo mật (Security Filters).
- **Log Levels Strategy**: Sử dụng `INFO` cho các sự kiện nghiệp vụ quan trọng, `WARN` cho các bất ổn tiềm tàng (vd: Meilisearch chậm), và `ERROR` cho các ngoại lệ nghiêm trọng cùng với dấu vết (Stack trace) đầy đủ.
- **Centralized Exception Handling**: Mọi lỗi hệ thống được thu gom về `GlobalExceptionHandler`, ghi lại Log chi tiết và trả về phản hồi chuẩn hóa cho Frontend.

### 🛡️ Security & Integrity (Hardening Layer)
Hệ thống được thiết kế theo nguyên tắc "Phòng thủ chiều sâu" (Defense in Depth):
- **Admin IP Whitelisting**: Một bộ lọc chuyên biệt (`AdminIpWhitelistFilter`) kiểm soát mọi truy cập tới `/api/v1/dashboard/**` và các tài nguyên nhạy cảm, chỉ cho phép các IP trong danh sách trắng (Whitelist) từ cơ sở dữ liệu.
- **Security Auditing**: Mọi hành vi đáng ngờ (Login failed, Unauthorized access) và thay đổi trạng thái đơn hàng đều được ghi lại trong bảng `security_logs` để phục vụ điều tra và bảo mật.
- **CSRF Cookie Hardening**: Sử dụng `CookieCsrfTokenRepository` với HttpOnly=false để xác thực giao tiếp an toàn giữa SPA và API.

### 📦 Lifecycle & Data Consistency
- **Order State Machine**: Quy trình trạng thái đơn hàng được tập trung hóa trong `OrderStateMachine`, ngăn chặn các bước chuyển đổi phi logic (VD: Hủy đơn hàng đã giao thành công).
- **Soft Delete Policy**: Áp dụng cơ chế Xóa mềm (`deleted_at`) cho toàn bộ thực thể kinh doanh cốt lõi (Sản phẩm, Đơn hàng, Người dùng...). Dữ liệu không bao giờ bị xóa thực tế khỏi Disk, giúp bảo toàn tính toàn vẹn của báo cáo tài chính hằng năm.
- **Database Consistency (Flyway)**: Mọi thay đổi cấu trúc Database đều được thực hiện qua Scripts Migration (V1, V2, V3...), đảm bảo mọi môi trường (Dev/Staging/Prod) luôn đồng nhất 100%.
- **Inventory Locking**: Kết hợp **Redis Stock Reservation** (Optimistic) và **ProductBatch Pessimistic Locking** (Database level) để đảm bảo không bao giờ xảy ra tình trạng "bán lố" hàng tồn kho.
- **Data Flow Synchronicity**: Cấu trúc địa chỉ 4 tầng (addressDetail, ward, district, province) được duy trì đồng nhất từ lược đồ SQL, qua ánh xạ Entity/DTO tại Java, lên tới giao diện React, đảm bảo tính toàn vẹn dữ liệu xuyên suốt 3 tầng kiến trúc.

---
© 2026 FreshFood Project. Bảo lưu mọi quyền.

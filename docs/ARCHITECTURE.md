# 🏗️ System Architecture - FreshFood

Tài liệu này mô tả sơ đồ hệ thống và cấu trúc thành phần của FreshFood.

## 🌉 Sơ đồ Tổng quan (High-level Architecture)

FreshFood được thiết kế theo kiến trúc **Monolithic** hiện đại với các thành phần decoupled:
1.  **Frontend (Client)**: Ứng dụng React 18+ (Vite) xử lý giao diện, logic trạng thái và tương tác người dùng qua Context API.
2.  **Backend (Server)**: Java 21 + Spring Boot 3 cung cấp RESTful API và xử lý nghiệp vụ, bảo mật.
3.  **Database (Persistence Layer)**: H2 (Dev) / MySQL (Prod) để lưu trữ dữ liệu bền vững.
4.  **External Services**:
    -   **Cloudinary**: Xử lý và lưu trữ hình ảnh/video (Asset Management).
    -   **SMTP Server**: Gửi Email OTP và thông báo.
    -   **AI Scan**: Xử lý phân tích thực phẩm bằng mô hình học máy tích hợp.

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
- **`/components`**: Các thành phần giao diện nhỏ, tái sử dụng cao.
- **`/context`**: Lớp quản lý trạng thái tập trung (State Management).
- **`/pages`**: Các view chính của hệ thống.

---
© 2026 FreshFood Project. Bảo lưu mọi quyền.

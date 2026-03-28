# 🚀 Triển khai (Deployment) - FreshFood

Tài liệu này hướng dẫn cách triển khai dự án FreshFood lên các môi trường Local, Docker và Production.

---

## 🛠️ Triển khai bằng Docker (Khuyến nghị)

Dự án đã được tối ưu hóa để chạy qua Docker Compose, giúp đồng nhất môi trường cho tất cả các dịch vụ.

### 1. Chuẩn bị biến môi trường
Sao chép file mẫu và điền các thông tin:
```bash
cp .env.example .env
```
Các tham số quan trọng cần lưu ý:
- `JWT_SECRET`: Khóa bí mật để ký token.
- `MAIL_USERNAME` / `MAIL_PASSWORD`: Tài khoản Gmail SMTP (nếu muốn gửi mail thật).
- `CLOUDINARY_*`: Thông tin máy chủ lưu trữ ảnh/video.

### 2. Khởi động hệ thống
```bash
docker-compose up -d --build
```
Lệnh này sẽ tự động:
- Khởi tạo **MySQL** (trong container `freshfood-api` build).
- Chạy **Redis** (Cache & Rate Limit).
- Chạy **Meilisearch** (Search Engine).
- Chạy **MailHog** (SMTP giả lập).
- Build và chạy **Spring Boot Backend**.
- Build và chạy **React Frontend** qua NGINX.

---

## 🍃 Triển khai Backend thủ công (Spring Boot)

### 📂 Bước 1: Build file JAR
Trong thư mục `/demo`, chạy lệnh:
```bash
./mvnw clean package -DskipTests
```

### 🍃 Bước 2: Chạy Backend
```bash
java -jar target/demo-0.0.1-SNAPSHOT.jar
```
**Lưu ý**: Cần cài đặt sẵn MySQL và Redis trên máy local nếu không dùng Docker.

---

## ⚛️ Triển khai Frontend thủ công (React Vite)

### 🎨 Bước 1: Build file tĩnh
Trong thư mục `/frontend`, chạy lệnh:
```bash
npm install
npm run build
```

### ⚛️ Bước 2: Cấu hình NGINX
Sau khi build, thư mục `/dist` sẽ chứa mã nguồn. Sử dụng NGINX để host và cấu hình proxy `/api` về địa chỉ Backend (thường là `http://localhost:8080`).

---

## 🔒 Kiểm tra sau triển khai
1. Kiểm tra trạng thái container: `docker ps`.
2. Truy cập API Docs: `http://localhost:8080/swagger-ui.html`.
3. Kiểm tra log hệ thống: `docker logs -f freshfood-api`.

---
© 2026 FreshFood Project. Bảo lưu mọi quyền.

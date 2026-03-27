# 🚀 Triển khai (Deployment) - FreshFood

Tài liệu này hướng dẫn các bước để đưa dự án FreshFood lên môi trường thực tế.

## 🍃 Triển khai Backend (Spring Boot)

### 📂 Bước 1: Build file JAR
Trong thư mục `/demo`, chạy lệnh:
```bash
./mvnw clean package -DskipTests
```
File JAR sẽ được tạo trong `target/demo-0.0.1-SNAPSHOT.jar`.

### 🍃 Bước 2: Chạy Backend
Bạn có thể chạy trực tiếp bằng lệnh Java:
```bash
java -jar target/demo-0.0.1-SNAPSHOT.jar
```
**Lưu ý**: Hãy đảm bảo biến môi trường (Database, Cloudinary) được thiết lập đúng trong `application.properties` hoặc `ENV`.

---

## ⚛️ Triển khai Frontend (React Vite)

### 🎨 Bước 1: Build file tĩnh
Trong thư mục `/frontend`, chạy lệnh:
```bash
npm run build
```
Thư mục `/dist` sau khi build xong sẽ chứa tất cả các file HTML/JS/CSS đã được tối ưu hóa.

### ⚛️ Bước 2: Host Frontend
Bạn có thể upload thư mục `/dist` lên các dịch vụ host như **Netlify**, **Vercel** hoặc host trực tiếp trên **NGINX**.

---

## 🛠️ Triển khai tổng thể (Docker - Dự kiến)
FreshFood được thiết kế để có thể dễ dàng Docker hóa qua các Container:
- **db**: MySQL service.
- **backend**: Spring Boot application.
- **frontend**: NGINX phục vụ file tĩnh và proxy API.

---
© 2026 FreshFood Project. Bảo lưu mọi quyền.

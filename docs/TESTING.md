# 🧪 Chiến lược Kiểm thử (Testing) - FreshFood

Tài liệu này hướng dẫn cách kiểm thử và đảm bảo chất lượng hệ thống FreshFood.

## 🧪 Kiểm thử Backend (Spring Boot)

### 📂 Unit Testing (Junit 5 & Mockito)
Các thành phần chính cần được Unit Test:
- **`service`**: Kiểm thử các phương thức logic của hệ thống.
- **`utils`**: Kiểm thử logic băm mật khẩu, tạo mã OTP hoặc tách chuỗi.

### 🧪 Integration Testing
Kiểm thử tích hợp các lớp và Repository:
- **`repository`**: Sử dụng `@DataJpaTest` để kiểm tra khả năng tương tác của Database.
- **`controller`**: Sử dụng `MockMvc` để mô phỏng các yêu cầu HTTP và kiểm tra phản hồi JSON.

## ⚛️ Kiểm thử Frontend (React)

### 🎨 Component Testing
Kiểm tra khả năng hiển thị của các thành phần như `Navbar`, `ProductCard`, `CartItem`.
- **Thư viện đề xuất**: `React Testing Library`, `Jest`.

### 🧪 E2E Testing (End-to-End)
Kiểm tra luồng đi của người dùng (ví dụ: đăng nhập -> giỏ hàng -> thanh toán):
- **Công cụ đề xuất**: `Cypress`, `Playwright`.

## 🛡️ Kiểm thử Bảo mật & API
- **Postman/Insomnia**: Để gửi các yêu cầu giả lập đến Backend và kiểm tra tính chính xác của phản hồi.
- **MailHog Interface**: Truy cập [http://localhost:8025](http://localhost:8025) để kiểm thử giao diện và nội dung email gửi đi (OTP, Voucher, Order Info).
- **OWASP ZAP**: (Tùy chọn) Để quét các lỗ hổng bảo mật cơ bản như SQL Injection.

## 🚀 Hướng dẫn Chạy Test
Trong thư mục `/demo` (Backend):
```bash
./mvnw test
```

---
© 2026 FreshFood Project. Bảo lưu mọi quyền.

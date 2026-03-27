# 💾 Backup & Restore - FreshFood

Tài liệu này hướng dẫn cách sao lưu và phục hồi dữ liệu cho hệ thống FreshFood.

## 🗄️ Sao lưu Cơ sở dữ liệu (Database Backup)

### 📂 H2 Database (Phát triển)
Dữ liệu được lưu trữ trong file: `~/freshfood.mv.db`.
- **Cách sao lưu**: Chỉ cần copy file này vào một thư mục an toàn khi ứng dụng không hoạt động.

### 🐘 MySQL Database (Dự kiến Sản xuất)
- **Công cụ**: Sử dụng `mysqldump`.
- **Lệnh thực hiện**:
    ```bash
    mysqldump -u [username] -p [database_name] > backup_[date].sql
    ```

## 📸 Sao lưu Media (Cloudinary)
Hình ảnh và video không được lưu trong DB gốc mà lưu trữ trên Cloudinary.
- **Sao lưu**: Bạn có thể sử dụng Cloudinary CLI hoặc tài khoản Admin để xuất danh sách asset.
- **Lưu ý**: Xóa bản ghi trong DB không tự động xóa file trên Cloudinary مگر khi sử dụng `MediaService.delete()`.

## 🔄 Phục hồi dữ liệu (Restore)

### 📂 H2 Database
- Tắt ứng dụng.
- Thay thế file `freshfood.mv.db` bằng bản sao lưu.
- Khởi động lại ứng dụng.

### 🐘 MySQL Database
- **Lệnh thực hiện**:
    ```bash
    mysql -u [username] -p [database_name] < backup_[date].sql
    ```

---
© 2026 FreshFood Project. Bảo lưu mọi quyền.

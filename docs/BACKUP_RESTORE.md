# 💾 Backup & Restore - FreshFood

Tài liệu này hướng dẫn cách sao lưu và phục hồi dữ liệu cho hệ thống FreshFood.

## 🗄️ Sao lưu Cơ sở dữ liệu (Database Backup)

### 🐳 MySQL trong Docker (Standard)
Dữ liệu được lưu trữ trong database `clean_food_db` bên trong container.
- **Cách sao lưu (Từ máy host)**:
    ```bash
    docker exec freshfood-api mysqldump -u root clean_food_db > backup_$(date +%F).sql
    ```
- **Lưu ý**: Lệnh này trích xuất schema và dữ liệu trực tiếp từ container đang chạy.

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

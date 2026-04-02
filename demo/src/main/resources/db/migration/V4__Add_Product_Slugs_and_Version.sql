-- V4__Add_Product_Slugs_and_Version.sql
-- Bổ sung cột slug cho SEO và cột version để hỗ trợ Optimistic Locking (Hibernate @Version)

-- 1. Cập nhật bảng products
ALTER TABLE products ADD COLUMN slug VARCHAR(255) DEFAULT NULL;
ALTER TABLE products ADD COLUMN version BIGINT DEFAULT 0;
CREATE UNIQUE INDEX idx_product_slug ON products(slug);

-- 2. Cập nhật bảng product_batches cho Optimistic Locking
ALTER TABLE product_batches ADD COLUMN version BIGINT DEFAULT 0;

-- 3. Cập nhật slug cho dữ liệu cũ (Dựa trên tên sản phẩm hiện tại)
-- Lưu ý: Logic này đơn giản hóa, trong thực tế nên chạy qua Java code hoặc Procedure phức tạp hơn
-- Ở đây ta chỉ cập nhật NULL để JPA/Hibernate tự động điền khi nạp qua @PrePersist/@PreUpdate nếu cần,
-- Tuy nhiên để tránh lỗi khi nạp trang, ta có thể tạm thời lấy name làm slug (chưa normalize hoàn toàn)
UPDATE products SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;

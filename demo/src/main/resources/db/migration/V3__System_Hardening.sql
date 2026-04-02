-- V3__System_Hardening.sql
-- Thêm cơ chế Xóa mềm (Soft Delete) và các bảng bảo mật nâng cao

-- 1. Thêm cột deleted_at cho các bảng quan trọng
ALTER TABLE users ADD COLUMN deleted_at DATETIME(6) DEFAULT NULL;
ALTER TABLE products ADD COLUMN deleted_at DATETIME(6) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN deleted_at DATETIME(6) DEFAULT NULL;
ALTER TABLE categories ADD COLUMN deleted_at DATETIME(6) DEFAULT NULL;
ALTER TABLE coupons ADD COLUMN deleted_at DATETIME(6) DEFAULT NULL;
ALTER TABLE farms ADD COLUMN deleted_at DATETIME(6) DEFAULT NULL;
ALTER TABLE product_batches ADD COLUMN deleted_at DATETIME(6) DEFAULT NULL;
ALTER TABLE reviews ADD COLUMN deleted_at DATETIME(6) DEFAULT NULL;
ALTER TABLE admin_audit_logs ADD COLUMN deleted_at DATETIME(6) DEFAULT NULL;
ALTER TABLE newsletter_subscribers ADD COLUMN deleted_at DATETIME(6) DEFAULT NULL;

-- 2. Thêm các Index để tối ưu hiệu năng lọc dữ liệu sạch (chưa xóa)
CREATE INDEX idx_user_deleted_at ON users(deleted_at);
CREATE INDEX idx_product_deleted_at ON products(deleted_at);
CREATE INDEX idx_order_deleted_at ON orders(deleted_at);

-- 3. Tạo FULLTEXT INDEX cho tìm kiếm sản phẩm tốc độ cao (MATCH...AGAINST)
ALTER TABLE products ADD FULLTEXT INDEX idx_product_search (name, description);

-- 4. Tạo bảng SECURITY_LOGS để ghi nhận các sự kiện bảo mật (Login failed, Rate limit, Unauthorized)
CREATE TABLE IF NOT EXISTS security_logs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    event_type VARCHAR(50) NOT NULL, -- e.g., 'LOGIN_FAILED', 'UNAUTHORIZED_ACCESS', 'RATE_LIMIT_HIT'
    ip_address VARCHAR(45) NOT NULL,
    username VARCHAR(255) DEFAULT NULL,
    details TEXT,
    severity VARCHAR(20) NOT NULL, -- e.g., 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    created_at DATETIME(6) DEFAULT NULL,
    PRIMARY KEY (id),
    INDEX idx_security_event (event_type),
    INDEX idx_security_ip (ip_address),
    INDEX idx_security_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Cấu hình mặc định cho IP Whitelist (Nếu chưa có trong system_settings)
INSERT IGNORE INTO system_settings (setting_key, setting_value, description, updated_at)
VALUES ('admin_ip_whitelist', '*', 'Danh sách IP được phép truy cập Admin (dấu * là cho phép tất cả)', NOW());

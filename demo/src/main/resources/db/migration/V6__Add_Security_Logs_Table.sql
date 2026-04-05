-- V6__Add_Security_Logs_Table.sql
-- Tự động khởi tạo bảng Nhật ký bảo mật (Security Audit) 

CREATE TABLE IF NOT EXISTS `security_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `event_type` VARCHAR(50) NOT NULL, -- e.g., 'LOGIN_FAILED', 'UNAUTHORIZED_ACCESS', 'SUSPICIOUS_ADMIN_ACCESS'
    `ip_address` VARCHAR(45) NOT NULL,
    `username` VARCHAR(255) DEFAULT NULL,
    `details` TEXT,
    `severity` VARCHAR(20) NOT NULL, -- e.g., 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    `created_at` DATETIME(6) DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_security_event` (`event_type`),
    INDEX `idx_security_ip` (`ip_address`),
    INDEX `idx_security_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Nhật ký: Đã hoàn tất di chuyển dữ liệu cho hệ thống giám sát an ninh FreshFood.

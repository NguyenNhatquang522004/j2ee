-- V2__Additional_Tables.sql

CREATE TABLE IF NOT EXISTS product_batches (
  id bigint NOT NULL AUTO_INCREMENT,
  product_id bigint NOT NULL,
  batch_code varchar(50) NOT NULL UNIQUE,
  quantity int NOT NULL DEFAULT 0,
  remaining_quantity int NOT NULL DEFAULT 0,
  import_date date NOT NULL,
  production_date date DEFAULT NULL,
  expiry_date date NOT NULL,
  status enum('ACTIVE','DISCONTINUED','DISCOUNT','EXPIRED') NOT NULL,
  note varchar(500) DEFAULT NULL,
  created_at datetime(6) DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS carts (
  id bigint NOT NULL AUTO_INCREMENT,
  user_id bigint NOT NULL UNIQUE,
  created_at datetime(6) DEFAULT NULL,
  updated_at datetime(6) DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cart_items (
  id bigint NOT NULL AUTO_INCREMENT,
  cart_id bigint NOT NULL,
  product_id bigint NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  FOREIGN KEY (cart_id) REFERENCES carts (id),
  FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
  id bigint NOT NULL AUTO_INCREMENT,
  user_id bigint NOT NULL,
  message varchar(500) NOT NULL,
  type varchar(50) DEFAULT NULL,
  link varchar(255) DEFAULT NULL,
  is_read bit(1) NOT NULL DEFAULT b'0',
  created_at datetime(6) DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS system_settings (
  id bigint NOT NULL AUTO_INCREMENT,
  setting_key varchar(100) NOT NULL UNIQUE,
  setting_value text,
  description varchar(255) DEFAULT NULL,
  updated_at datetime(6) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id bigint NOT NULL AUTO_INCREMENT,
  admin_username varchar(255) NOT NULL,
  action varchar(255) NOT NULL,
  resource_type varchar(255) NOT NULL,
  resource_id varchar(255) DEFAULT NULL,
  details varchar(1000) DEFAULT NULL,
  ip_address varchar(255) DEFAULT NULL,
  created_at datetime(6) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS wishlist_items (
  id bigint NOT NULL AUTO_INCREMENT,
  product_id bigint NOT NULL,
  user_id bigint NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS flash_sales (
  id bigint NOT NULL AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  description varchar(255) DEFAULT NULL,
  start_time datetime(6) NOT NULL,
  end_time datetime(6) NOT NULL,
  is_active bit(1) NOT NULL DEFAULT b'1',
  created_at datetime(6) DEFAULT NULL,
  updated_at datetime(6) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS flash_sale_items (
  id bigint NOT NULL AUTO_INCREMENT,
  flash_sale_id bigint NOT NULL,
  product_id bigint NOT NULL,
  flash_sale_price decimal(15,2) NOT NULL,
  quantity_limit int NOT NULL,
  sold_quantity int NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  FOREIGN KEY (flash_sale_id) REFERENCES flash_sales (id),
  FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS media (
  id bigint NOT NULL AUTO_INCREMENT,
  url varchar(255) NOT NULL,
  public_id varchar(255) DEFAULT NULL,
  file_name varchar(255) DEFAULT NULL,
  file_type varchar(255) DEFAULT NULL,
  file_size bigint DEFAULT NULL,
  created_at datetime(6) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id bigint NOT NULL AUTO_INCREMENT,
  email varchar(255) NOT NULL UNIQUE,
  is_active bit(1) DEFAULT b'1',
  subscribed_at datetime(6) DEFAULT NULL,
  created_at datetime(6) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reviews (
  id bigint NOT NULL AUTO_INCREMENT,
  product_id bigint NOT NULL,
  user_id bigint NOT NULL,
  rating int NOT NULL,
  comment text,
  admin_reply text,
  status enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  created_at datetime(6) DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS review_media (
  id bigint NOT NULL AUTO_INCREMENT,
  review_id bigint NOT NULL,
  url varchar(255) NOT NULL,
  file_type varchar(255) DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (review_id) REFERENCES reviews (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coupon_assigned_users (
  coupon_id bigint NOT NULL,
  user_id bigint NOT NULL,
  PRIMARY KEY (coupon_id, user_id),
  FOREIGN KEY (coupon_id) REFERENCES coupons (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contact_messages (
  id bigint NOT NULL AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  subject varchar(255) NOT NULL,
  content text NOT NULL,
  is_read bit(1) NOT NULL DEFAULT b'0',
  created_at datetime(6) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  id bigint NOT NULL AUTO_INCREMENT,
  order_id bigint NOT NULL,
  product_id bigint NOT NULL,
  product_name varchar(255) DEFAULT NULL,
  product_image_url varchar(255) DEFAULT NULL,
  quantity int NOT NULL,
  unit_price decimal(15,2) NOT NULL,
  subtotal decimal(15,2) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (order_id) REFERENCES orders (id),
  FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: clean_food_db
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `cart_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cart_item_cart` (`cart_id`),
  KEY `idx_cart_item_product` (`product_id`),
  CONSTRAINT `FK1re40cjegsfvw58xrkdp6bac6` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `FKpcttvuq4mxppo8sxggjtn5i2c` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`),
  CONSTRAINT `cart_items_chk_1` CHECK ((`quantity` >= 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK64t7ox312pqal3p7fg9o503c2` (`user_id`),
  CONSTRAINT `FKb5o626f86h46m4s7ms6ginnop` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,'2026-03-25 17:24:08.967187','2026-03-25 17:24:08.968204',1);
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKt8o6pivur7nn124jehx7cygw5` (`name`),
  KEY `idx_category_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'2026-03-25 20:53:56.307947','Các loại rau lá tươi ngon',NULL,_binary '','Rau sạch'),(2,'2026-03-25 20:53:56.317201','Các loại củ và quả thực phẩm',NULL,_binary '','Củ quả'),(3,'2026-03-25 20:53:56.322353','Trái cây đặc sản vùng miền',NULL,_binary '','Trái cây tươi'),(4,'2026-03-25 20:53:56.327316','Thịt gia súc, gia cầm tươi sống',NULL,_binary '','Thịt sạch');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `discount_percent` int NOT NULL,
  `expiry_date` date NOT NULL,
  `is_active` bit(1) NOT NULL,
  `max_discount_amount` decimal(15,2) DEFAULT NULL,
  `min_order_amount` decimal(15,2) DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `used_count` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKeplt0kkm9yf2of2lnx6c1oy9b` (`code`),
  KEY `idx_coupon_code` (`code`),
  CONSTRAINT `coupons_chk_1` CHECK (((`discount_percent` <= 100) and (`discount_percent` >= 0)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `farms`
--

DROP TABLE IF EXISTS `farms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `farms` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `certification` enum('GLOBAL_GAP','HACCP','NONE','ORGANIC','VIETGAP') NOT NULL,
  `certification_code` varchar(100) DEFAULT NULL,
  `certification_expiry_date` date DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `owner_name` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_farm_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `farms`
--

LOCK TABLES `farms` WRITE;
/*!40000 ALTER TABLE `farms` DISABLE KEYS */;
INSERT INTO `farms` VALUES (1,'123 Đường Mai Anh Đào, Phường 8','VIETGAP','VG-DL-2024-001',NULL,NULL,NULL,'2026-03-25 20:53:56.334057','Chuyên cung cấp rau củ đạt chuẩn VietGAP tại Đà Lạt.',NULL,_binary '',NULL,NULL,'Nông trại Đà Lạt sạch',NULL,'Lâm Đồng','2026-03-25 20:53:56.334057'),(2,'Xã Tản Lĩnh, Huyện Ba Vì','ORGANIC','OR-BV-2024-055',NULL,NULL,NULL,'2026-03-25 20:53:56.340578','Trang trại nông nghiệp hữu cơ lớn nhất khu vực miền Bắc.',NULL,_binary '',NULL,NULL,'Trang trại Ba Vì Organic',NULL,'Hà Nội','2026-03-25 20:53:56.340578');
/*!40000 ALTER TABLE `farms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_item_order` (`order_id`),
  KEY `idx_order_item_product` (`product_id`),
  CONSTRAINT `FKbioxgbv59vetrxe0ejfubep1w` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FKocimc7dtr037rh4ls4l95nlfi` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `order_items_chk_1` CHECK ((`quantity` >= 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `discount_amount` decimal(15,2) DEFAULT NULL,
  `final_amount` decimal(15,2) NOT NULL,
  `is_paid` bit(1) NOT NULL,
  `note` varchar(500) DEFAULT NULL,
  `order_code` varchar(30) NOT NULL,
  `payment_method` enum('BANK_TRANSFER','COD','MOMO','ONLINE','VNPAY') NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `shipping_address` varchar(300) NOT NULL,
  `status` enum('CANCELLED','CONFIRMED','DELIVERED','PACKAGING','PENDING','SHIPPING') NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `coupon_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKdhk2umg8ijjkg4njg6891trit` (`order_code`),
  KEY `idx_order_user` (`user_id`),
  KEY `idx_order_code` (`order_code`),
  KEY `idx_order_status` (`status`),
  KEY `idx_order_created` (`created_at`),
  KEY `FKn1d1gkxckw648m2n2d5gx0yx5` (`coupon_id`),
  CONSTRAINT `FK32ql8ubntj5uh44ph9659tiih` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKn1d1gkxckw648m2n2d5gx0yx5` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_batches`
--

DROP TABLE IF EXISTS `product_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_batches` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `batch_code` varchar(50) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `expiry_date` date NOT NULL,
  `import_date` date NOT NULL,
  `note` varchar(500) DEFAULT NULL,
  `production_date` date DEFAULT NULL,
  `quantity` int NOT NULL,
  `remaining_quantity` int NOT NULL,
  `status` enum('ACTIVE','DISCONTINUED','DISCOUNT','EXPIRED') NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK1b9j88qq6532jubli8r7ywbuh` (`batch_code`),
  KEY `idx_batch_product` (`product_id`),
  KEY `idx_batch_expiry` (`expiry_date`),
  KEY `idx_batch_status` (`status`),
  KEY `idx_batch_code` (`batch_code`),
  CONSTRAINT `FKo2hwf6cltkf4qkdim5w29rbgq` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `product_batches_chk_1` CHECK ((`quantity` >= 0)),
  CONSTRAINT `product_batches_chk_2` CHECK ((`remaining_quantity` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_batches`
--

LOCK TABLES `product_batches` WRITE;
/*!40000 ALTER TABLE `product_batches` DISABLE KEYS */;
INSERT INTO `product_batches` VALUES (1,'BATCH-SL-001','2026-03-25 20:53:56.377513','2026-03-30','2026-03-25',NULL,'2026-03-23',100,100,'ACTIVE',1),(2,'BATCH-SL-002','2026-03-25 20:53:56.414130','2026-03-24','2026-03-25',NULL,'2026-03-23',50,50,'ACTIVE',1),(3,'BATCH-CH-001','2026-03-25 20:53:56.418785','2026-04-01','2026-03-25',NULL,'2026-03-23',80,80,'ACTIVE',2),(4,'BATCH-CH-002','2026-03-25 20:53:56.424023','2026-03-27','2026-03-25',NULL,'2026-03-23',40,40,'ACTIVE',2),(5,'BATCH-TH-001','2026-03-25 20:53:56.428487','2026-03-28','2026-03-25',NULL,'2026-03-23',60,60,'ACTIVE',3);
/*!40000 ALTER TABLE `product_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `name` varchar(200) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `category_id` bigint NOT NULL,
  `farm_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_product_name` (`name`),
  KEY `idx_product_category` (`category_id`),
  KEY `idx_product_farm` (`farm_id`),
  KEY `idx_product_active` (`is_active`),
  CONSTRAINT `FK6u1nuo7vlt4ffm43qduh1ngbu` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`),
  CONSTRAINT `FKog2rp4qthbtt2lfyhfo32lsw9` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'2026-03-25 20:53:56.352348','Súp lơ tươi mới, không thuốc trừ sâu.','https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L2xyL3Y4NjgtYmF0Y2gxLTA0LmpwZw.jpg',_binary '','Súp lơ xanh Đà Lạt',35000.00,'Cái','2026-03-25 20:53:56.352348',1,1),(2,'2026-03-25 20:53:56.363371','Chuối ngọt, thơm, giàu dinh dưỡng.','https://vcdn1-giadinh.vnecdn.net/2021/04/09/chuoi-6754-1617942186.jpg?w=0&h=0&q=100&dpr=2&fit=crop&s=I3oR0O5LAn_m9rAHzvK2wA',_binary '','Chuối tiêu hồng',25000.00,'Nải','2026-03-25 20:53:56.363371',3,2),(3,'2026-03-25 20:53:56.367533','Thịt heo sạch, nuôi theo tiêu chuẩn an toàn.','https://thucphamsachcp.vn/wp-content/uploads/2022/03/thit-ba-chi-heo.jpg',_binary '','Thịt ba chỉ CP',150000.00,'Kg','2026-03-25 20:53:56.368542',4,1);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `comment` text,
  `created_at` datetime(6) DEFAULT NULL,
  `rating` int NOT NULL,
  `product_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_review_product` (`product_id`),
  KEY `idx_review_user` (`user_id`),
  CONSTRAINT `FKcgy7qjc1r99dp117y9en6lxye` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKpl51cejpw4gy5swfar8br9ngi` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `reviews_chk_1` CHECK (((`rating` <= 5) and (`rating` >= 1)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('ROLE_ADMIN','ROLE_USER') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`),
  KEY `idx_user_email` (`email`),
  KEY `idx_user_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'2026-03-25 17:24:08.905543','thanhtoan06092004@gmail.com','DANG THANH TOAN',_binary '','$2a$10$0aGpnIutBKGE/8jw62Ikq.7.DKoY2ybsbh1BHISCiXvkMaedd9Gq6','0869426904','ROLE_USER','2026-03-25 17:24:08.906981','thanhtoan'),(2,NULL,'2026-03-25 20:53:56.184969','admin@cleanfood.com','Quản trị viên Hệ thống',_binary '','$2a$10$R0SnAmWD1UrFwFQZawrnRut1x.Mb7IeF0eh0sZOlcdJ6/plGviwsC','0988888888','ROLE_ADMIN','2026-03-25 20:53:56.184969','admin'),(3,NULL,'2026-03-25 20:53:56.301090','user@gmail.com','Nguyễn Văn Khách',_binary '','$2a$10$2Pdc7csa5LYukVNvzxXEsOsnAcREOrrDRfpqUE2nYLBoObDcVKLlS','0912345678','ROLE_USER','2026-03-25 20:53:56.301090','user');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-25 21:17:19

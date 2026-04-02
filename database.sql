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
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `details` varchar(255) DEFAULT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `is_default` bit(1) DEFAULT NULL,
  `label` varchar(50) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address_detail` varchar(255) NOT NULL,
  `ward` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK1fa36y2oqhao3wgg2rw1pi459` (`user_id`),
  CONSTRAINT `FK1fa36y2oqhao3wgg2rw1pi459` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (1,'Số 12, Ngõ 34, Đường Láng, Quận Đống Đa, Hà Nội','Nguyễn Văn Khách',_binary '','Nhà','0912345678','Số 12, Ngõ 34, Đường Láng, Quận Đống Đa, Hà Nội',NULL,NULL,NULL,3),(2,'Tầng 15, Keangnam Landmark 72, Phạm Hùng, Nam Từ Liêm, Hà Nội','Nguyễn Văn Khách',_binary '\0','Công ty','0912345678','Tầng 15, Keangnam Landmark 72, Phạm Hùng, Nam Từ Liêm, Hà Nội',NULL,NULL,NULL,3),(3,'123 ABC, Xuan Thoi Son, Hoc Mon, Ho Chi Minh','DANG THANH TOAN',_binary '','Nhà','0869426904','123 ABC','Xuan Thoi Son','Hoc Mon','Ho Chi Minh',1),(4,'321 ABC, HCM, Binh Thanh, Ho Chi Minh','DANG THANH TOAN',_binary '\0','Công ty','0869426904','321 ABC','HCM','Binh Thanh','Ho Chi Minh',1);
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_audit_logs`
--

DROP TABLE IF EXISTS `admin_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(255) NOT NULL,
  `admin_username` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `details` varchar(1000) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `resource_id` varchar(255) DEFAULT NULL,
  `resource_type` varchar(255) NOT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_audit_logs`
--

LOCK TABLES `admin_audit_logs` WRITE;
/*!40000 ALTER TABLE `admin_audit_logs` DISABLE KEYS */;
INSERT INTO `admin_audit_logs` VALUES (1,'ADMIN_UPDATE_USER','admin','2026-03-28 00:08:40.220296','Updated staff/user: admin',NULL,'2','User',NULL),(2,'UPDATE','admin','2026-03-28 14:34:15.404683','Modified: GIAM100K',NULL,'4','COUPON',NULL);
/*!40000 ALTER TABLE `admin_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (65,1,1,2);
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,'2026-03-25 17:24:08.967187','2026-03-25 17:24:08.968204',1),(2,'2026-03-26 15:35:30.501817','2026-03-26 15:35:30.501817',2);
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
  `is_active` tinyint(1) DEFAULT '1',
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKt8o6pivur7nn124jehx7cygw5` (`name`),
  UNIQUE KEY `uk_category_slug` (`slug`),
  KEY `idx_category_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'2026-03-25 20:53:56.307947','Các loại rau lá tươi ngon','https://tse4.mm.bing.net/th/id/OIP.cTrs0NrpTIOnHGcS4XdCFwHaE8?pid=Api&P=0&h=180',1,'Rau sạch','rau-sach',NULL),(2,'2026-03-25 20:53:56.317201','Các loại củ và quả thực phẩm','https://up.yimg.com/ib/th/id/OIP.a40H_pi7SikJcS-A0noeWwHaFK?pid=Api&rs=1&c=1&qlt=95&w=142&h=99',1,'Củ quả','cu-qua',NULL),(3,'2026-03-25 20:53:56.322353','Trái cây đặc sản vùng miền','https://up.yimg.com/ib/th/id/OIP.tC46Q6jk5nbzzGTNB6J_8wHaE8?pid=Api&rs=1&c=1&qlt=95&w=155&h=103',1,'Trái cây tươi','trai-cay-tuoi',NULL),(4,'2026-03-25 20:53:56.327316','Thịt gia súc, gia cầm tươi sống','https://tse1.mm.bing.net/th/id/OIP.dYFaL-Kx_Xl-82KAs4UxeAHaEZ?pid=Api&P=0&h=180',1,'Thịt sạch','thit-sach',NULL),(5,'2026-03-31 13:34:42.000000','Hải sản tươi ngon từ các vùng biển','https://tse1.mm.bing.net/th/id/OIP._wleYOnbKPeszRbnLs0k0gHaE7?pid=Api&P=0&h=180',1,'Hải sản tươi sống','hai-san-tuoi-song',NULL),(6,'2026-03-31 13:34:42.000000','Sản phẩm từ trứng và các loại sữa','https://tse2.mm.bing.net/th/id/OIP.amG2WJIgs06wvGvFJPEuTgHaDt?pid=Api&P=0&h=180',1,'Trứng & Sữa','trung-sua',NULL),(7,'2026-03-31 13:34:42.000000','Các loại hạt, đồ khô và gia vị nấu ăn','https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=300&h=200&q=80',1,'Đồ khô & Gia vị','do-kho-gia-vi',NULL),(8,'2026-03-31 13:34:42.000000','Nước trái cây, trà và các loại đồ uống','https://up.yimg.com/ib/th/id/OIP.3OgEhCXX2Ty-VqKBfwM1uQHaE9?pid=Api&rs=1&c=1&qlt=95&w=141&h=94',1,'Đồ uống & Giải khát','do-uong-giai-khat',NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `name` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
INSERT INTO `contact_messages` VALUES (1,'ok','2026-03-28 11:18:00.188886','thanhtoan06092004@gmail.com',1,'DANG THANH TOAN','Hỗ trợ đơn hàng');
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupon_assigned_users`
--

DROP TABLE IF EXISTS `coupon_assigned_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupon_assigned_users` (
  `coupon_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`coupon_id`,`user_id`),
  KEY `fk_cau_user` (`user_id`),
  CONSTRAINT `fk_cau_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`),
  CONSTRAINT `fk_cau_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupon_assigned_users`
--

LOCK TABLES `coupon_assigned_users` WRITE;
/*!40000 ALTER TABLE `coupon_assigned_users` DISABLE KEYS */;
INSERT INTO `coupon_assigned_users` VALUES (6,1);
/*!40000 ALTER TABLE `coupon_assigned_users` ENABLE KEYS */;
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
  `is_active` tinyint(1) DEFAULT '1',
  `max_discount_amount` decimal(15,2) DEFAULT NULL,
  `min_order_amount` decimal(15,2) DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `used_count` int NOT NULL,
  `is_private` tinyint(1) DEFAULT '0',
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKeplt0kkm9yf2of2lnx6c1oy9b` (`code`),
  KEY `idx_coupon_code` (`code`),
  CONSTRAINT `coupons_chk_1` CHECK (((`discount_percent` <= 100) and (`discount_percent` >= 0)))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,'GIAM50K','2026-03-26 21:28:15.372813','Giam 50k cho don tu 100k',100,'2026-04-26',1,50000.00,100000.00,10,1,0,NULL),(2,'TOAN','2026-03-27 14:49:21.364513','Giảm 100k',100,'2026-09-27',1,100000.00,0.00,5,0,0,NULL),(3,'TOANN','2026-03-27 16:18:03.333912','giam gia',100,'2026-04-27',1,50000.00,100000.00,20,0,0,NULL),(4,'GIAM100K','2026-03-27 16:25:46.332772','giam 100k mung sinh nhat',100,'2026-03-28',0,100000.00,100000.00,1,0,0,NULL),(5,'HVHV','2026-03-27 17:03:39.858194','ok',99,'2026-04-26',1,50000.00,100000.00,1,0,1,NULL),(6,'OKOK','2026-03-27 17:10:37.507046','ok',20,'2026-04-26',1,100000.00,100000.00,1,0,1,NULL),(7,'CHGC','2026-03-27 17:14:06.233459','ok',10,'2026-04-26',1,100000.00,1000000.00,1,0,1,NULL),(8,'GXGH','2026-03-27 17:16:51.296456','ok',100,'2026-04-26',1,50000.00,100000.00,1,0,1,NULL),(9,'GVHG','2026-03-27 17:21:19.439321','',10,'2026-04-26',1,99999.00,0.00,1,0,1,NULL);
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
  `is_active` tinyint(1) DEFAULT '1',
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `owner_name` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_farm_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `farms`
--

LOCK TABLES `farms` WRITE;
/*!40000 ALTER TABLE `farms` DISABLE KEYS */;
INSERT INTO `farms` VALUES (1,'123 Đường Mai Anh Đào, Phường 8','VIETGAP','VG-DL-2024-001',NULL,NULL,NULL,'2026-03-25 20:53:56.334057','Chuyên cung cấp rau củ đạt chuẩn VietGAP tại Đà Lạt.','https://tse3.mm.bing.net/th/id/OIP.FtAZOLThYZNuIcwzoSoNjwHaFj?pid=Api&P=0&h=180',1,NULL,NULL,'Nông trại Đà Lạt sạch','TOAN','Lâm Đồng','2026-03-26 08:05:20.121805',NULL),(2,'Xã Tản Lĩnh, Huyện Ba Vì','ORGANIC','OR-BV-2024-055',NULL,NULL,NULL,'2026-03-25 20:53:56.340578','Trang trại nông nghiệp hữu cơ lớn nhất khu vực miền Bắc.','https://tse1.mm.bing.net/th/id/OIP.PChnvZCaBNo3k2rrx5mjtQHaEK?pid=Api&P=0&h=180',1,NULL,NULL,'Trang trại Ba Vì Organic',NULL,'Hà Nội','2026-03-26 08:06:06.249348',NULL);
/*!40000 ALTER TABLE `farms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flash_sale_items`
--

DROP TABLE IF EXISTS `flash_sale_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flash_sale_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `flash_sale_price` decimal(15,2) NOT NULL,
  `quantity_limit` int NOT NULL,
  `sold_quantity` int NOT NULL,
  `flash_sale_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKmr5agn0eu29xqqog30yspa3e3` (`flash_sale_id`),
  KEY `FK5p9e16gsvvhlc28cjyvju7m99` (`product_id`),
  CONSTRAINT `FK5p9e16gsvvhlc28cjyvju7m99` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `FKmr5agn0eu29xqqog30yspa3e3` FOREIGN KEY (`flash_sale_id`) REFERENCES `flash_sales` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flash_sale_items`
--

LOCK TABLES `flash_sale_items` WRITE;
/*!40000 ALTER TABLE `flash_sale_items` DISABLE KEYS */;
INSERT INTO `flash_sale_items` VALUES (1,100000.00,10,0,1,18);
/*!40000 ALTER TABLE `flash_sale_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flash_sales`
--

DROP TABLE IF EXISTS `flash_sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flash_sales` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `end_time` datetime(6) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `name` varchar(255) NOT NULL,
  `start_time` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flash_sales`
--

LOCK TABLES `flash_sales` WRITE;
/*!40000 ALTER TABLE `flash_sales` DISABLE KEYS */;
INSERT INTO `flash_sales` VALUES (1,'2026-03-28 12:42:26.197218','','2026-03-30 10:10:00.000000',0,'Săn Sale ','2026-03-28 10:10:00.000000','2026-03-28 12:42:26.197245');
/*!40000 ALTER TABLE `flash_sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `description` varchar(200) NOT NULL,
  `type` varchar(20) NOT NULL,
  `script` varchar(1000) NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','<< Flyway Baseline >>','BASELINE','<< Flyway Baseline >>',NULL,'root','2026-03-30 01:28:03',0,1),(2,'2','Additional Tables','SQL','V2__Additional_Tables.sql',-851882252,'root','2026-03-30 01:28:03',207,1),(3,'3','System Hardening','SQL','V3__System_Hardening.sql',-554068676,'root','2026-03-30 01:28:05',1317,1),(4,'4','Add Product Slugs and Version','SQL','V4__Add_Product_Slugs_and_Version.sql',133491493,'root','2026-03-30 05:57:56',11020,1),(5,'5','Upgrade Address Structure','SQL','V5__Upgrade_Address_Structure.sql',1818638268,'root','2026-03-31 23:55:17',289,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ip_blocklist`
--

DROP TABLE IF EXISTS `ip_blocklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ip_blocklist` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `blocked_until` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `ip_address` varchar(45) NOT NULL,
  `is_permanent` bit(1) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKehsswfsbyqxi4oc7f0cgr8wv` (`ip_address`),
  KEY `idx_blocked_ip` (`ip_address`),
  KEY `idx_blocked_until` (`blocked_until`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ip_blocklist`
--

LOCK TABLES `ip_blocklist` WRITE;
/*!40000 ALTER TABLE `ip_blocklist` DISABLE KEYS */;
/*!40000 ALTER TABLE `ip_blocklist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `public_id` varchar(255) DEFAULT NULL,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media`
--

LOCK TABLES `media` WRITE;
/*!40000 ALTER TABLE `media` DISABLE KEYS */;
INSERT INTO `media` VALUES (2,'2026-03-27 13:41:35.217294','chuoi.jpg',8436,'image/jpeg','fffj2e1p3puxfnaa36pn','https://res.cloudinary.com/dgl4gge37/image/upload/v1774593694/fffj2e1p3puxfnaa36pn.jpg'),(3,'2026-03-27 15:06:40.622148','2026-03-27 19-39-39.mp4',8468875,'video/mp4','bzlff67cn5eqqbtspqfk','https://res.cloudinary.com/dgl4gge37/video/upload/v1774623998/bzlff67cn5eqqbtspqfk.mp4'),(4,'2026-03-30 11:44:32.986982','tao.jpg',7907,'image/jpeg','mzbsnuz0spg7goslpn0r','https://res.cloudinary.com/dgl4gge37/image/upload/v1774845871/mzbsnuz0spg7goslpn0r.jpg'),(5,'2026-03-30 11:45:22.599129','chuoinentrang.jpg',3903,'image/jpeg','fyyqgoot2viodxq1ol4t','https://res.cloudinary.com/dgl4gge37/image/upload/v1774845921/fyyqgoot2viodxq1ol4t.jpg'),(6,'2026-03-30 11:46:28.485250','tao.jpg',7907,'image/jpeg','y6xu1up0jit4mv7q6j16','https://res.cloudinary.com/dgl4gge37/image/upload/v1774845987/y6xu1up0jit4mv7q6j16.jpg');
/*!40000 ALTER TABLE `media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_subscribers`
--

DROP TABLE IF EXISTS `newsletter_subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_subscribers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `subscribed_at` datetime(6) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKqqdefkuupml4s7190ettcy6jy` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_subscribers`
--

LOCK TABLES `newsletter_subscribers` WRITE;
/*!40000 ALTER TABLE `newsletter_subscribers` DISABLE KEYS */;
INSERT INTO `newsletter_subscribers` VALUES (1,'thanhtoan06092004@gmail.com',1,'2026-03-27 06:56:42.213608',NULL),(2,'nguyennhatquang522004@gmail.com',1,'2026-03-27 19:11:59.234657',NULL);
/*!40000 ALTER TABLE `newsletter_subscribers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `link` varchar(255) DEFAULT NULL,
  `message` varchar(500) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_noti_user` (`user_id`),
  KEY `idx_noti_created` (`created_at`),
  CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'2026-03-27 17:22:59.844408',0,'/coupons','Bạn vừa nhận được một mã giảm giá cá nhân: OKOK','COUPON',1),(2,'2026-03-27 17:23:36.281264',1,'/coupons','Bạn vừa nhận được một mã giảm giá cá nhân: OKOK','COUPON',1),(3,'2026-03-28 00:11:50.416169',1,NULL,'Đăng nhập thành công','LOGIN',2),(4,'2026-03-28 00:15:39.726832',1,NULL,'Đăng nhập thành công','LOGIN',2),(5,'2026-03-28 00:23:01.508737',1,NULL,'Đăng nhập thành công','LOGIN',2),(6,'2026-03-28 00:28:45.158099',1,NULL,'Đăng nhập thành công','LOGIN',2),(7,'2026-03-28 07:35:17.957294',1,NULL,'Đăng nhập thành công','LOGIN',2),(8,'2026-03-28 10:12:25.077590',1,NULL,'Đăng nhập thành công','LOGIN',2),(9,'2026-03-28 11:16:48.279215',1,NULL,'Đăng nhập thành công','LOGIN',2),(10,'2026-03-28 12:00:14.877776',1,NULL,'Đăng nhập thành công','LOGIN',2),(11,'2026-03-30 08:46:00.550784',0,NULL,'Đăng nhập thành công','LOGIN',1),(12,'2026-03-30 08:50:53.669322',0,NULL,'Đăng nhập thành công','LOGIN',2),(13,'2026-03-30 10:23:15.089308',0,NULL,'Đăng nhập thành công','LOGIN',1),(14,'2026-03-30 11:06:17.236862',0,NULL,'Đăng nhập thành công','LOGIN',1),(15,'2026-03-30 11:15:47.551112',0,NULL,'Đăng nhập thành công','LOGIN',2),(16,'2026-03-30 12:49:35.333433',0,NULL,'Đăng nhập thành công','LOGIN',2),(17,'2026-03-31 00:11:37.544221',0,NULL,'Đăng nhập thành công','LOGIN',1),(18,'2026-04-01 07:14:34.509286',0,NULL,'Đăng nhập thành công','LOGIN',1),(19,'2026-04-01 07:59:40.621317',0,NULL,'Đăng nhập thành công','LOGIN',1),(20,'2026-04-01 08:35:13.245431',0,NULL,'Đăng nhập thành công','LOGIN',2),(21,'2026-04-01 12:58:37.314603',0,NULL,'Đăng nhập thành công','LOGIN',2);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
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
  `product_image_url` varchar(255) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `flash_sale_item_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_item_order` (`order_id`),
  KEY `idx_order_item_product` (`product_id`),
  KEY `FKldbxdc9i4j7tnnxcfk6aijahc` (`flash_sale_item_id`),
  CONSTRAINT `FKbioxgbv59vetrxe0ejfubep1w` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FKldbxdc9i4j7tnnxcfk6aijahc` FOREIGN KEY (`flash_sale_item_id`) REFERENCES `flash_sale_items` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FKocimc7dtr037rh4ls4l95nlfi` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `order_items_chk_1` CHECK ((`quantity` >= 1))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,25000.00,25000.00,1,2,'https://tse3.mm.bing.net/th/id/OIP.63ASv80nWiNSO0Rd2DI1zwHaHa?pid=Api&P=0&h=180','Chuối tiêu hồng',NULL),(2,1,150000.00,150000.00,2,3,'https://tse4.mm.bing.net/th/id/OIP.m6sDYIcLZZyYTJZRfm2fMwHaFN?pid=Api&P=0&h=180','Thịt ba chỉ CP',NULL),(3,1,150000.00,150000.00,3,3,'https://tse4.mm.bing.net/th/id/OIP.m6sDYIcLZZyYTJZRfm2fMwHaFN?pid=Api&P=0&h=180','Thịt ba chỉ CP',NULL);
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
  `is_paid` tinyint(1) DEFAULT '0',
  `note` varchar(500) DEFAULT NULL,
  `order_code` varchar(30) NOT NULL,
  `payment_method` enum('BANK_TRANSFER','COD','MOMO','ONLINE','VNPAY') NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `shipping_address` varchar(300) NOT NULL,
  `status` enum('CANCELLED','CONFIRMED','DELIVERED','PACKAGING','PENDING','RETURNED','RETURN_REJECTED','RETURN_REQUESTED','SHIPPING') NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `coupon_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `cancelled_at` datetime(6) DEFAULT NULL,
  `confirmed_at` datetime(6) DEFAULT NULL,
  `delivered_at` datetime(6) DEFAULT NULL,
  `shipped_at` datetime(6) DEFAULT NULL,
  `address_detail` varchar(300) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `estimated_arrival` datetime(6) DEFAULT NULL,
  `is_refunded` bit(1) NOT NULL,
  `packaging_at` datetime(6) DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `receiver_name` varchar(100) DEFAULT NULL,
  `refunded_at` datetime(6) DEFAULT NULL,
  `reject_reason` varchar(500) DEFAULT NULL,
  `return_media` varchar(500) DEFAULT NULL,
  `return_reason` varchar(500) DEFAULT NULL,
  `return_requested_at` datetime(6) DEFAULT NULL,
  `returned_at` datetime(6) DEFAULT NULL,
  `shipping_fee` decimal(15,2) DEFAULT NULL,
  `tracking_number` varchar(50) DEFAULT NULL,
  `ward` varchar(100) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKdhk2umg8ijjkg4njg6891trit` (`order_code`),
  KEY `idx_order_user` (`user_id`),
  KEY `idx_order_code` (`order_code`),
  KEY `idx_order_status` (`status`),
  KEY `idx_order_created` (`created_at`),
  KEY `FKn1d1gkxckw648m2n2d5gx0yx5` (`coupon_id`),
  KEY `idx_order_deleted_at` (`deleted_at`),
  CONSTRAINT `FK32ql8ubntj5uh44ph9659tiih` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKn1d1gkxckw648m2n2d5gx0yx5` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'2026-03-25 22:16:52.385165',0.00,25000.00,1,'ok','ORD-20260325221652-E8AA','COD','0123456789','TTN14','DELIVERED',25000.00,'2026-03-26 15:20:29.513323',NULL,1,NULL,'2026-03-26 15:19:30.894093','2026-03-26 15:20:29.497610','2026-03-26 15:20:06.027163',NULL,NULL,NULL,_binary '\0',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,'2026-03-26 22:19:21.157593',50000.00,100000.00,0,'OK','ORD-20260326221921-EEE6','COD','0869426904','123 ABC, HCM','CANCELLED',150000.00,'2026-03-26 22:19:38.370866',1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,_binary '\0',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,'2026-03-26 22:24:13.094252',50000.00,100000.00,0,'OKKKK','ORD-20260326222413-41F2','BANK_TRANSFER','0869426904','123 ABC, HCM','CANCELLED',150000.00,'2026-03-26 22:38:25.101822',1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,_binary '\0',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `point_transactions`
--

DROP TABLE IF EXISTS `point_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `point_transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `balance_after` bigint DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `points` bigint NOT NULL,
  `source` varchar(50) DEFAULT NULL,
  `source_id` varchar(255) DEFAULT NULL,
  `type` varchar(20) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKcqbvxpskb8p7mko50hokltu5b` (`user_id`),
  CONSTRAINT `FKcqbvxpskb8p7mko50hokltu5b` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `point_transactions`
--

LOCK TABLES `point_transactions` WRITE;
/*!40000 ALTER TABLE `point_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `point_transactions` ENABLE KEYS */;
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
  `deleted_at` datetime(6) DEFAULT NULL,
  `version` bigint DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK1b9j88qq6532jubli8r7ywbuh` (`batch_code`),
  KEY `idx_batch_product` (`product_id`),
  KEY `idx_batch_expiry` (`expiry_date`),
  KEY `idx_batch_status` (`status`),
  KEY `idx_batch_code` (`batch_code`),
  CONSTRAINT `FKo2hwf6cltkf4qkdim5w29rbgq` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `product_batches_chk_1` CHECK ((`quantity` >= 0)),
  CONSTRAINT `product_batches_chk_2` CHECK ((`remaining_quantity` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_batches`
--

LOCK TABLES `product_batches` WRITE;
/*!40000 ALTER TABLE `product_batches` DISABLE KEYS */;
INSERT INTO `product_batches` VALUES (1,'BATCH-SL-001','2026-03-25 20:53:56.377513','2026-03-30','2026-03-25',NULL,'2026-03-23',100,0,'EXPIRED',1,NULL,1),(2,'BATCH-SL-002','2026-03-25 20:53:56.414130','2026-09-24','2026-03-25','','2026-03-23',50,50,'ACTIVE',1,NULL,0),(3,'BATCH-CH-001','2026-03-25 20:53:56.418785','2026-04-01','2026-03-25',NULL,'2026-03-23',80,80,'DISCOUNT',2,NULL,1),(4,'BATCH-CH-002','2026-03-25 20:53:56.424023','2026-04-27','2026-03-25','','2026-03-23',40,39,'ACTIVE',2,NULL,0),(5,'BATCH-TH-001','2026-03-25 20:53:56.428487','2026-06-28','2026-03-25','','2026-03-23',60,58,'DISCOUNT',3,NULL,0),(6,'CSHC-2026-0001','2026-03-26 08:14:03.569776','2026-09-27','2026-03-10','','2026-03-01',300,300,'ACTIVE',1,NULL,0),(7,'CTH-2026-0001','2026-03-26 08:15:47.257461','2026-09-27','2026-03-26','','2026-03-10',150,150,'ACTIVE',2,NULL,0),(8,'NHR-2026-0001','2026-03-26 15:48:41.815650','2026-09-27','2026-03-01','','2026-02-01',200,200,'ACTIVE',33,NULL,0),(9,'BNX-2026-0001','2026-03-26 15:50:59.303870','2026-09-27','2026-03-10','','2026-02-10',400,400,'ACTIVE',11,NULL,0),(10,'TBTN','2026-03-26 15:52:17.085362','2026-09-26','2026-03-26','','2026-02-20',200,200,'ACTIVE',21,NULL,0),(11,'SLXDL-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',1,NULL,0),(12,'TBC-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',3,NULL,0),(13,'RMX-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',4,NULL,0),(14,'CBXDL-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',5,NULL,0),(15,'CCBHC-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',6,NULL,0),(16,'CRB-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',7,NULL,0),(17,'SLX-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',8,NULL,0),(18,'KTV-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',9,NULL,0),(19,'HTT-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',10,NULL,0),(20,'TME-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',12,NULL,0),(21,'DLT-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',14,NULL,0),(22,'BDX-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',15,NULL,0),(23,'XCHL-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',16,NULL,0),(24,'CSCC-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',17,NULL,0),(25,'DTDL-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',18,NULL,0),(26,'NDKH-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',19,NULL,0),(27,'TBRS-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',20,NULL,0),(28,'TBTN-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',21,NULL,0),(29,'GTTV-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',22,NULL,0),(30,'TGHC-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',23,NULL,0),(31,'CHNVPL-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',24,NULL,0),(32,'TSTS-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',25,NULL,0),(33,'GST25-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',26,NULL,0),(34,'MORNC-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',27,NULL,0),(35,'NMNTT-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',28,NULL,0),(36,'HDRM-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',29,NULL,0),(37,'OBS-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',30,NULL,0),(38,'TDDL-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',31,NULL,0),(39,'DXHC-2026-0001','2026-03-27 21:53:59.000000','2026-09-27','2026-03-27',NULL,'2026-03-27',100,100,'ACTIVE',32,NULL,0),(41,'LOT-SUA-01','2026-03-31 13:37:53.000000','2027-12-31','2026-03-31',NULL,'2026-03-31',50,50,'ACTIVE',34,NULL,0),(42,'LOT-SUA-02','2026-03-31 13:37:53.000000','2027-12-31','2026-03-31',NULL,'2026-03-31',100,100,'ACTIVE',35,NULL,0),(43,'LOT-CAM-01','2026-03-31 13:37:53.000000','2027-12-31','2026-03-31',NULL,'2026-03-31',30,30,'ACTIVE',36,NULL,0),(44,'LOT-TRA-01','2026-03-31 13:37:53.000000','2027-12-31','2026-03-31',NULL,'2026-03-31',50,50,'ACTIVE',37,NULL,0),(45,'LOT-CA-01','2026-03-31 13:37:53.000000','2027-12-31','2026-03-31',NULL,'2026-03-31',20,20,'ACTIVE',38,NULL,0);
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
  `is_active` tinyint(1) DEFAULT '1',
  `name` varchar(200) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `category_id` bigint NOT NULL,
  `farm_id` bigint NOT NULL,
  `is_new` tinyint(1) DEFAULT '1',
  `original_price` decimal(15,2) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `version` bigint DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_product_slug` (`slug`),
  KEY `idx_product_name` (`name`),
  KEY `idx_product_category` (`category_id`),
  KEY `idx_product_farm` (`farm_id`),
  KEY `idx_product_active` (`is_active`),
  KEY `idx_product_deleted_at` (`deleted_at`),
  FULLTEXT KEY `idx_product_search` (`name`,`description`),
  CONSTRAINT `FK6u1nuo7vlt4ffm43qduh1ngbu` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`),
  CONSTRAINT `FKog2rp4qthbtt2lfyhfo32lsw9` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'2026-03-25 20:53:56.352348','Súp lơ tươi mới, không thuốc trừ sâu.','https://tse3.mm.bing.net/th/id/OIP.uQoej__RZulLX2na3dGLzwHaFj?pid=Api&P=0&h=180',1,'Súp lơ xanh Đà Lạt',35000.00,'Cái','2026-03-26 14:58:49.656681',1,1,0,NULL,NULL,'sup-lo-xanh-da-lat',0),(2,'2026-03-25 20:53:56.363371','Chuối ngọt, thơm, giàu dinh dưỡng.','https://tse3.mm.bing.net/th/id/OIP.63ASv80nWiNSO0Rd2DI1zwHaHa?pid=Api&P=0&h=180',1,'Chuối tiêu hồng',25000.00,'Nải','2026-03-26 16:08:03.888106',3,2,1,30000.00,NULL,'chuoi-tieu-hong',0),(3,'2026-03-25 20:53:56.367533','Thịt heo sạch, nuôi theo tiêu chuẩn an toàn.','https://tse4.mm.bing.net/th/id/OIP.m6sDYIcLZZyYTJZRfm2fMwHaFN?pid=Api&P=0&h=180',1,'Thịt ba chỉ CP',150000.00,'Kg','2026-03-25 20:53:56.368542',4,1,0,NULL,NULL,'thit-ba-chi-cp',0),(4,'2026-03-26 15:31:52.582271','Sản phẩm Rau muống xanh chất lượng từ Nông trại Đà Lạt sạch. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&w=500&q=80',1,'Rau muống xanh',15000.00,'Bó','2026-03-26 15:31:52.583258',1,1,0,NULL,NULL,'rau-muong-xanh',0),(5,'2026-03-26 15:31:52.638581','Sản phẩm Cải bó xôi Đà Lạt chất lượng từ Nông trại Đà Lạt sạch. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=80',1,'Cải bó xôi Đà Lạt',35000.00,'Kg','2026-03-26 15:31:52.638581',1,1,0,NULL,NULL,'cai-bo-xoi-da-lat',0),(6,'2026-03-26 15:31:52.644470','Sản phẩm Cà chua bi hữu cơ chất lượng từ Nông trại Đà Lạt sạch. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80',1,'Cà chua bi hữu cơ',45000.00,'Hộp 500g','2026-03-26 15:43:31.821855',3,1,0,NULL,NULL,'ca-chua-bi-huu-co',0),(7,'2026-03-26 15:31:52.650203','Sản phẩm Cà rốt baby chất lượng từ Trang trại Ba Vì Organic. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=500&q=80',1,'Cà rốt baby',25000.00,'Bó','2026-03-26 15:44:06.053245',2,2,0,NULL,NULL,'ca-rot-baby',0),(8,'2026-03-26 15:31:52.654776','Sản phẩm Súp lơ xanh chất lượng từ Nông trại Đà Lạt sạch. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://images.unsplash.com/photo-1452948491233-ad8a1ed01085?auto=format&fit=crop&w=500&q=80',1,'Súp lơ xanh',30000.00,'Cây','2026-03-26 15:31:52.654776',1,1,0,NULL,NULL,'sup-lo-xanh',0),(9,'2026-03-26 15:31:52.658910','Sản phẩm Khoai tây vàng chất lượng từ Trang trại Ba Vì Organic. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://tse1.mm.bing.net/th/id/OIP.rp4UAXLodZyF-4HbhZ9OdgHaHa?pid=Api&P=0&h=180',1,'Khoai tây vàng',20000.00,'Kg','2026-03-26 15:43:57.382098',2,2,0,NULL,NULL,'khoai-tay-vang',0),(10,'2026-03-26 15:31:52.664844','Sản phẩm Hành tây tím chất lượng từ Nông trại Đà Lạt sạch. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=500&q=80',1,'Hành tây tím',22000.00,'Kg','2026-03-26 15:43:20.723669',2,1,0,NULL,NULL,'hanh-tay-tim',0),(11,'2026-03-26 15:31:52.669015','Sản phẩm Bí ngòi xanh chất lượng từ Nông trại Đà Lạt sạch. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=500&q=80',1,'Bí ngòi xanh',28000.00,'Kg','2026-03-26 15:44:29.544707',2,1,0,NULL,NULL,'bi-ngoi-xanh',0),(12,'2026-03-26 15:31:52.674181','Sản phẩm Táo Mỹ Envy chất lượng từ Nông trại Đà Lạt sạch. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=500&q=80',1,'Táo Mỹ Envy',120000.00,'Kg','2026-03-26 15:31:52.674181',3,1,0,NULL,NULL,'tao-my-envy',0),(13,'2026-03-26 15:31:52.678689','Sản phẩm Cam sành hữu cơ chất lượng từ Nông trại Đà Lạt sạch. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://tse1.mm.bing.net/th/id/OIP.SBwvl_IVFPqWfaIoGuRcrAHaE7?pid=Api&P=0&h=180',1,'Cam sành hữu cơ',55000.00,'Kg','2026-03-26 15:38:54.573780',3,1,0,NULL,NULL,'cam-sanh-huu-co',0),(14,'2026-03-26 15:31:52.682734','Sản phẩm Dưa lưới tròn chất lượng từ Nông trại Đà Lạt sạch. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://images.unsplash.com/photo-1571575173700-afb9492e6a50?auto=format&fit=crop&w=500&q=80',1,'Dưa lưới tròn',85000.00,'Trái','2026-03-26 15:31:52.682734',3,1,0,NULL,NULL,'dua-luoi-tron',0),(15,'2026-03-26 15:31:52.688419','Sản phẩm Bưởi da xanh chất lượng từ Nông trại Đà Lạt sạch. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://tse2.mm.bing.net/th/id/OIP.8tRCGCAdB-hM0hez75s8CAHaHZ?pid=Api&P=0&h=180',1,'Bưởi da xanh',65000.00,'Kg','2026-03-26 15:39:30.970312',3,1,0,NULL,NULL,'buoi-da-xanh',0),(16,'2026-03-26 15:31:52.692442','Sản phẩm Xoài cát Hòa Lộc chất lượng từ Nông trại Đà Lạt sạch. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=500&q=80',1,'Xoài cát Hòa Lộc',75000.00,'Kg','2026-03-26 15:31:52.692442',3,1,0,NULL,NULL,'xoai-cat-hoa-loc',0),(17,'2026-03-26 15:31:52.698634','Sản phẩm Chuối sứ chín cây chất lượng từ Trang trại Ba Vì Organic. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=500&q=80',1,'Chuối sứ chín cây',18000.00,'Nải','2026-03-26 15:31:52.698634',3,2,0,NULL,NULL,'chuoi-su-chin-cay',0),(18,'2026-03-26 15:31:52.702181','Sản phẩm Dâu tây Đà Lạt chất lượng từ Nông trại Đà Lạt sạch. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://up.yimg.com/ib/th/id/OIP.DmHyZAAMPT9PIon2i7T43wHaFj?pid=Api&rs=1&c=1&qlt=95&w=134&h=100',1,'Dâu tây Đà Lạt',150000.00,'Hộp 500g','2026-03-26 15:39:58.853127',3,1,0,NULL,NULL,'dau-tay-da-lat',0),(19,'2026-03-26 15:31:52.708249','Sản phẩm Nho đen không hạt chất lượng từ Nông trại Đà Lạt sạch. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://tse3.mm.bing.net/th/id/OIP.dNjd4sinzd7ZVydZu_qqDgHaFZ?pid=Api&P=0&h=180',1,'Nho đen không hạt',180000.00,'Kg','2026-03-26 15:40:29.136648',3,1,0,NULL,NULL,'nho-den-khong-hat',0),(20,'2026-03-26 15:31:52.712304','Sản phẩm Thịt ba rọi sạch chất lượng từ Trang trại Ba Vì Organic. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://up.yimg.com/ib/th/id/OIP.KPs2a3VZaP2wVS9pYDTgmAHaEK?pid=Api&rs=1&c=1&qlt=95&w=202&h=113',1,'Thịt ba rọi sạch',165000.00,'Kg','2026-03-26 15:40:54.518477',4,2,0,NULL,NULL,'thit-ba-roi-sach',0),(21,'2026-03-26 15:31:52.716883','Sản phẩm Thịt bò thăn nội chất lượng từ Trang trại Ba Vì Organic. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://up.yimg.com/ib/th/id/OIP.be7JHpF_x_FJ5vs9QPpUeQHaGl?pid=Api&rs=1&c=1&qlt=95&w=125&h=111',1,'Thịt bò thăn nội',380000.00,'Kg','2026-03-26 15:51:38.451639',4,2,0,NULL,NULL,'thit-bo-than-noi',0),(22,'2026-03-26 15:31:52.720885','Sản phẩm Gà ta thả vườn chất lượng từ Trang trại Ba Vì Organic. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=500&q=80',1,'Gà ta thả vườn',220000.00,'Con','2026-03-26 15:31:52.720885',4,2,0,NULL,NULL,'ga-ta-tha-vuon',0),(23,'2026-03-26 15:31:52.725969','Sản phẩm Trứng gà hữu cơ chất lượng từ Trang trại Ba Vì Organic. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=500&q=80',1,'Trứng gà hữu cơ',4500.00,'Quả','2026-03-26 15:31:52.725969',6,2,0,NULL,NULL,'trung-ga-huu-co',0),(24,'2026-03-26 15:31:52.730610','Sản phẩm Cá hồi Na Uy phi lê chất lượng từ Trang trại Ba Vì Organic. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=500&q=80',1,'Cá hồi Na Uy phi lê',550000.00,'Kg','2026-03-26 15:31:52.730610',5,2,0,NULL,NULL,'ca-hoi-na-uy-phi-le',0),(25,'2026-03-26 15:31:52.735737','Sản phẩm Tôm sú tươi sống chất lượng từ Nông trại Đà Lạt sạch. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://tse1.mm.bing.net/th/id/OIP.Qp-6_3CDSNfxHmun-YsfZQHaEL?pid=Api&P=0&h=180',1,'Tôm sú tươi sống',320000.00,'Kg','2026-03-26 15:41:36.668123',5,1,0,NULL,NULL,'tom-su-tuoi-song',0),(26,'2026-03-26 15:31:52.740762','Sản phẩm Gạo ST25 chuẩn vị chất lượng từ Nông trại Đà Lạt sạch. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80',1,'Gạo ST25 chuẩn vị',35000.00,'Kg','2026-03-26 15:45:05.411733',7,1,0,NULL,NULL,'gao-st25-chuan-vi',0),(27,'2026-03-26 15:31:52.744987','Sản phẩm Mật ong rừng nguyên chất chất lượng từ Trang trại Ba Vì Organic. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://up.yimg.com/ib/th/id/OIP.BpAgE22PF3MZjv1FZN-9lwHaHa?pid=Api&rs=1&c=1&qlt=95&w=121&h=121',1,'Mật ong rừng nguyên chất',250000.00,'Chai 500ml','2026-03-26 15:46:44.246465',7,2,0,NULL,NULL,'mat-ong-rung-nguyen-chat',0),(28,'2026-03-26 15:31:52.748278','Sản phẩm Nước mắm nhỉ truyền thống chất lượng từ Nông trại Đà Lạt sạch. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://tse3.mm.bing.net/th/id/OIP.a1biUFllpAbmFBBLGZ2CSQHaHa?pid=Api&P=0&h=180',1,'Nước mắm nhĩ truyền thống',95000.00,'Chai','2026-03-26 15:46:15.464361',7,1,0,NULL,NULL,'nuoc-mam-nhi-truyen-thong',0),(29,'2026-03-26 15:31:52.752175','Sản phẩm Hạt điều rang muối chất lượng từ Trang trại Ba Vì Organic. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://up.yimg.com/ib/th/id/OIP.z055Bv42qOptj2RDS66yCQHaEL?pid=Api&rs=1&c=1&qlt=95&w=194&h=109',1,'Hạt điều rang muối',185000.00,'Hộp 500g','2026-03-26 15:46:52.683966',7,2,0,NULL,NULL,'hat-dieu-rang-muoi',0),(30,'2026-03-26 15:31:52.757710','Sản phẩm Ớt bột sạch chất lượng từ Nông trại Đà Lạt sạch. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://tse1.mm.bing.net/th/id/OIP.CZ8IJ_4KPilimvuRgrsdkAHaE8?pid=Api&P=0&h=180',1,'Ớt bột sạch',15000.00,'Gói','2026-03-26 15:45:39.389296',7,1,0,NULL,NULL,'ot-bot-sach',0),(31,'2026-03-26 15:31:52.761819','Sản phẩm Tiêu đen Đắk Lắk chất lượng từ Nông trại Đà Lạt sạch. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://up.yimg.com/ib/th/id/OIP.7zzgJrFIWla4BsA2ouQ89AHaHT?pid=Api&rs=1&c=1&qlt=95&w=115&h=113',1,'Tiêu đen Đắk Lắk',120000.00,'Kg','2026-03-26 15:47:10.526905',7,1,0,NULL,NULL,'tieu-den-dak-lak',0),(32,'2026-03-26 15:31:52.765387','Sản phẩm Đậu xanh hữu cơ chất lượng từ Trang trại Ba Vì Organic. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://images.unsplash.com/photo-1515942400420-2b98fed1f515?auto=format&fit=crop&w=500&q=80',1,'Đậu xanh hữu cơ',45000.00,'Kg','2026-03-26 15:47:17.273073',7,2,0,NULL,NULL,'dau-xanh-huu-co',0),(33,'2026-03-26 15:31:52.769857','Sản phẩm Nấm hương rừng chất lượng từ Trang trại Ba Vì Organic. Đảm bảo sạch, không thuốc trừ sâu, an toàn cho sức khỏe.','https://up.yimg.com/ib/th/id/OIP.5jvXk4gfieKQj7n3uHroxAHaE8?pid=Api&rs=1&c=1&qlt=95&w=174&h=116',1,'Nấm hương rừng',60000.00,'Gói 100g','2026-03-26 15:47:26.994468',7,2,0,NULL,NULL,'nam-huong-rung',0),(34,'2026-03-31 13:36:19.000000','Sữa tươi thanh trùng nguyên chất từ cao nguyên, đạt chuẩn vệ sinh an toàn thực phẩm.','https://images.unsplash.com/photo-1563636619-e9107d611f32?auto=format&fit=crop&w=500&q=80',1,'Sữa tươi thanh trùng',35000.00,'Chai','2026-03-31 13:36:19.000000',6,2,1,35000.00,NULL,'sua-tuoi-thanh-trung',0),(35,'2026-03-31 13:36:19.000000','Sữa chua hữu cơ thơm ngon, hỗ trợ tiêu hóa tốt, 100% tự nhiên.','https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=500&q=80',1,'Sữa chua hữu cơ',12000.00,'Hộp','2026-03-31 13:36:19.000000',6,2,1,12000.00,NULL,'sua-chua-huu-co',0),(36,'2026-03-31 13:36:19.000000','Nước ép cam nguyên chất giàu Vitamin C, sảng khoái và tự nhiên.','https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=500&q=80',1,'Nước ép cam nguyên chất',45000.00,'Chai','2026-03-31 13:36:19.000000',8,1,1,45000.00,NULL,'nuoc-ep-cam-nguyen-chat',0),(37,'2026-03-31 13:36:19.000000','Trà xanh Thái Nguyên thượng hạng, hương vị truyền thống đậm đà.','https://images.unsplash.com/photo-1544787210-22bb8421f163?auto=format&fit=crop&w=500&q=80',1,'Trà xanh Thái Nguyên',65000.00,'Gói','2026-03-31 13:36:19.000000',8,1,1,65000.00,NULL,'tra-xanh-thai-nguyen',0),(38,'2026-03-31 13:36:19.000000','Cá chẽm tươi sống từ vùng nước sạch, thịt ngọt và chắc.','https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=500&q=80',1,'Cá chẽm tươi sống',185000.00,'Kg','2026-03-31 13:36:19.000000',5,1,1,185000.00,NULL,'ca-chem-tuoi-song',0);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_media`
--

DROP TABLE IF EXISTS `review_media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_media` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `file_type` varchar(255) DEFAULT NULL,
  `url` varchar(255) NOT NULL,
  `review_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK5eeii8rke42oss6yq63k2hrte` (`review_id`),
  CONSTRAINT `FK5eeii8rke42oss6yq63k2hrte` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_media`
--

LOCK TABLES `review_media` WRITE;
/*!40000 ALTER TABLE `review_media` DISABLE KEYS */;
/*!40000 ALTER TABLE `review_media` ENABLE KEYS */;
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
  `admin_reply` text,
  `status` enum('APPROVED','PENDING','REJECTED') NOT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
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
-- Table structure for table `security_logs`
--

DROP TABLE IF EXISTS `security_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `security_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `event_type` varchar(50) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `details` text,
  `severity` varchar(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_security_event` (`event_type`),
  KEY `idx_security_ip` (`ip_address`),
  KEY `idx_security_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_logs`
--

LOCK TABLES `security_logs` WRITE;
/*!40000 ALTER TABLE `security_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `security_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` varchar(255) DEFAULT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKnm18l4pyovtvd8y3b3x0l2y64` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,'Bật/tắt chế độ bảo trì toàn hệ thống','MAINTENANCE_MODE','false','2026-03-26 17:12:50.828238'),(2,'Bắt buộc xác thực 2 bước cho tất cả Admin','2FA_ENFORCED','true','2026-03-26 18:02:55.693508'),(3,'Danh sách IP được phép truy cập Admin (dấu * là cho phép tất cả)','ADMIN_IP_WHITELIST','*','2026-03-30 08:28:05.000000'),(4,'Tên hiển thị của cửa hàng trên Website','STORE_NAME','FreshFood - Cửa hàng thực phẩm sạch',NULL),(5,'Email liên hệ chính thức','STORE_EMAIL','contact@freshfood.com',NULL),(6,'Số điện thoại hỗ trợ khách hàng','STORE_PHONE','0988888888',NULL),(7,'Địa chỉ trụ sở chính','STORE_ADDRESS','Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',NULL),(8,'Dòng chữ bản quyền dưới chân trang','COPYRIGHT_TEXT','© 2026 FreshFood. Tất cả quyền được bảo lưu.',NULL),(9,'Thuế giá trị gia tăng (%)','TAX','0',NULL),(10,'Ký hiệu tiền tệ hiển thị','CURRENCY','VNĐ',NULL),(11,'Phí vận chuyển mặc định cho mọi đơn hàng','SHIPPING_FEE','30000',NULL),(12,'Ngưỡng giá trị đơn hàng để được miễn phí vận chuyển','FREE_SHIPPING_THRESHOLD','500000',NULL),(13,'Liên kết trang Facebook Fanpage','FACEBOOK','https://facebook.com/freshfood',NULL),(14,'Liên kết trang Instagram chính thức','INSTAGRAM','https://instagram.com/freshfood',NULL),(15,'Kênh Youtube của cửa hàng','YOUTUBE','https://youtube.com/c/freshfood',NULL),(16,'Trang Twitter/X của cửa hàng','TWITTER','https://twitter.com/freshfood',NULL),(17,'Tỉ giá tích điểm (VNĐ = 1 điểm)','LOYALTY_RATIO','1000',NULL),(18,'Giá trị 1 điểm quy đổi ra VNĐ khi thanh toán','LOYALTY_POINTS_VALUE','100',NULL);
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_permissions`
--

DROP TABLE IF EXISTS `user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_permissions` (
  `user_id` bigint NOT NULL,
  `permission` varchar(255) DEFAULT NULL,
  UNIQUE KEY `UKdxli1ise4xdn88ku9l0uixg1j` (`user_id`,`permission`),
  KEY `FKkowxl8b2bngrxd1gafh13005u` (`user_id`),
  CONSTRAINT `FKkowxl8b2bngrxd1gafh13005u` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_permissions`
--

LOCK TABLES `user_permissions` WRITE;
/*!40000 ALTER TABLE `user_permissions` DISABLE KEYS */;
INSERT INTO `user_permissions` VALUES (2,'manage:batches'),(2,'manage:categories'),(2,'manage:farms'),(2,'manage:newsletters'),(2,'manage:orders'),(2,'manage:products'),(2,'manage:reviews'),(2,'manage:users'),(2,'view:products'),(2,'view:reports');
/*!40000 ALTER TABLE `user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `full_name` varchar(50) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `password` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `role` enum('ROLE_ADMIN','ROLE_STAFF','ROLE_USER') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `provider` varchar(20) DEFAULT NULL,
  `provider_id` varchar(100) DEFAULT NULL,
  `reset_token` varchar(100) DEFAULT NULL,
  `reset_token_expiry` datetime(6) DEFAULT NULL,
  `is_two_factor_enabled` bit(1) NOT NULL,
  `two_factor_secret` varchar(32) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `email_notifications` bit(1) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `membership_tier` varchar(20) DEFAULT NULL,
  `promo_notifications` bit(1) DEFAULT NULL,
  `email_2fa_code` varchar(6) DEFAULT NULL,
  `email_2fa_code_expiry` datetime(6) DEFAULT NULL,
  `two_factor_method` varchar(10) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `token_version` int NOT NULL,
  `failed_login_attempts` int DEFAULT NULL,
  `available_points` bigint DEFAULT NULL,
  `lifetime_points` bigint DEFAULT NULL,
  `lockout_until` datetime(6) DEFAULT NULL,
  `tier_updated_at` datetime(6) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_user_email` (`email`),
  KEY `idx_user_username` (`username`),
  KEY `idx_user_deleted_at` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'2026-03-25 17:24:08.905543','thanhtoan06092004@gmail.com','DANG THANH TOAN',1,'$2a$10$0aGpnIutBKGE/8jw62Ikq.7.DKoY2ybsbh1BHISCiXvkMaedd9Gq6','0869426904','ROLE_USER','2026-03-31 00:21:39.571303','thanhtoan',NULL,NULL,NULL,NULL,_binary '\0',NULL,'2004-09-06',_binary '','male','bronze',_binary '',NULL,NULL,NULL,'https://res.cloudinary.com/dgl4gge37/image/upload/v1774593893/avatars/aoalwgs5evubwhqzs9bd.jpg',0,0,0,0,NULL,NULL,NULL),(2,'2026-03-25 20:53:56.184969','admin@cleanfood.com','Quản trị viên Hệ thống',1,'$2a$10$R0SnAmWD1UrFwFQZawrnRut1x.Mb7IeF0eh0sZOlcdJ6/plGviwsC','0988888888','ROLE_ADMIN','2026-03-28 00:11:50.563149','admin',NULL,NULL,NULL,NULL,_binary '\0',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,0,NULL,NULL,NULL),(3,'2026-03-25 20:53:56.301090','user@gmail.com','Nguyễn Văn Khách',1,'$2a$10$2Pdc7csa5LYukVNvzxXEsOsnAcREOrrDRfpqUE2nYLBoObDcVKLlS','0912345678','ROLE_USER','2026-03-26 08:11:05.972260','user',NULL,NULL,NULL,NULL,_binary '\0',NULL,NULL,NULL,NULL,'bronze',NULL,NULL,NULL,NULL,NULL,0,0,0,0,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist_items`
--

DROP TABLE IF EXISTS `wishlist_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKtp53unkks741xiqi6m620i7mx` (`user_id`,`product_id`),
  KEY `FKqxj7lncd242b59fb78rqegyxj` (`product_id`),
  CONSTRAINT `FKmmj2k1i459yu449k3h1vx5abp` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKqxj7lncd242b59fb78rqegyxj` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist_items`
--

LOCK TABLES `wishlist_items` WRITE;
/*!40000 ALTER TABLE `wishlist_items` DISABLE KEYS */;
INSERT INTO `wishlist_items` VALUES (1,1,1),(3,2,1),(2,3,1),(4,18,1);
/*!40000 ALTER TABLE `wishlist_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-01 17:21:49

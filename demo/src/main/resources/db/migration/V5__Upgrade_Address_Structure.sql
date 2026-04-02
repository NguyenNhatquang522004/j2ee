-- Update addresses table with structured fields for checkout mapping
ALTER TABLE `addresses` 
ADD COLUMN `address_detail` VARCHAR(255) NOT NULL AFTER `phone`,
ADD COLUMN `ward` VARCHAR(100) AFTER `address_detail`,
ADD COLUMN `district` VARCHAR(100) AFTER `ward`,
ADD COLUMN `province` VARCHAR(100) AFTER `district`;

-- Migrate existing 'details' into 'address_detail' so original data isn't lost
UPDATE `addresses` SET `address_detail` = `details`;

-- Optional: mark the 'details' column as nullable if we want to phase it out or use it for full address display
ALTER TABLE `addresses` MODIFY COLUMN `details` VARCHAR(255) NULL;

-- Elyoo Mobile Store - Database Schema

-- Create Database
CREATE DATABASE IF NOT EXISTS elyoo_mobile_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE elyoo_mobile_store;

-- Brands Table
CREATE TABLE IF NOT EXISTS brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  model VARCHAR(255),
  price DECIMAL(10, 2) NOT NULL,
  specs TEXT,
  stock INT DEFAULT 0,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
  INDEX idx_brand_id (brand_id),
  INDEX idx_name (name),
  INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  items JSON NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order_number (order_number),
  INDEX idx_customer_email (customer_email),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Staff Table
CREATE TABLE IF NOT EXISTS staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff') DEFAULT 'staff',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Log Table (Optional - for tracking changes)
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT,
  action VARCHAR(255),
  table_name VARCHAR(255),
  record_id INT,
  old_values JSON,
  new_values JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL,
  INDEX idx_staff_id (staff_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Sample Data

-- Sample Brands
INSERT INTO brands (name) VALUES
('Apple'),
('Samsung'),
('OnePlus'),
('Xiaomi'),
('OPPO'),
('Realme'),
('Motorola'),
('Nothing');

-- Sample Products
INSERT INTO products (brand_id, name, model, price, specs, stock, image) VALUES
(1, 'iPhone 15 Pro', 'A2848', 999.99, '6.1" OLED, 120Hz, A17 Pro, 48MP Camera, Face ID', 50, '/images/iphone/iphone15pro.jpg'),
(1, 'iPhone 15', 'A2844', 799.99, '6.1" Liquid Retina, 120Hz, A16 Bionic, 48MP Camera', 45, '/images/iphone/iphone15.jpg'),
(2, 'Galaxy S24 Ultra', 'SM-S928B', 1299.99, '6.8" Dynamic AMOLED, 120Hz, Snapdragon 8 Gen 3, 200MP Camera', 35, '/images/samsung/s24ultra.jpg'),
(2, 'Galaxy S24', 'SM-S921B', 799.99, '6.2" Dynamic AMOLED, 120Hz, Snapdragon 8 Gen 3, 50MP Camera', 42, '/images/samsung/s24.jpg'),
(3, 'OnePlus 12', 'CPH2571', 749.99, '6.7" AMOLED, 120Hz, Snapdragon 8 Gen 3, 50MP Camera', 30, '/images/oneplus/12.jpg'),
(4, 'Xiaomi 14 Ultra', 'M2401', 1099.99, '6.73" AMOLED, 120Hz, Snapdragon 8 Gen 3, Leica 50MP', 25, '/images/xiaomi/14ultra.jpg'),
(5, 'OPPO Find X7', 'OPPO', 899.99, '6.78" AMOLED, 120Hz, Snapdragon 8 Gen 3, 50MP Camera', 20, '/images/oppo/findx7.jpg'),
(6, 'Realme GT 6', 'RMX3920', 649.99, '6.78" AMOLED, 120Hz, Snapdragon 8s Gen 3, 50MP Camera', 28, '/images/realme/gt6.jpg');

-- Sample Admin Account (password: admin123)
-- Note: Use bcryptjs to generate hashed password in production
INSERT INTO staff (name, email, password, role, is_active) VALUES
('Admin User', 'admin@elyoo.com', '$2a$10$jg2Xbq3kN0fmXrqzZ5s1o.bYnF9C1jyF6Z3X9M8K3L2J1H0E9P0Ue', 'admin', TRUE),
('Staff User', 'staff@elyoo.com', '$2a$10$ZsD5kL2mN9fX1yQz6qT8p.aYoE8B0iWG7Z2W8L1J0G9F8K1E7O9Qd', 'staff', TRUE);

-- Grant Privileges
-- Uncomment if using separate MySQL user
-- GRANT ALL PRIVILEGES ON elyoo_mobile_store.* TO 'elyoo_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Verify Tables
SHOW TABLES;
SHOW COLUMNS FROM brands;
SHOW COLUMNS FROM products;
SHOW COLUMNS FROM orders;
SHOW COLUMNS FROM staff;

-- Create Database
CREATE DATABASE IF NOT EXISTS cellphone_store;
USE cellphone_store;

-- Admin/User table
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role ENUM('admin', 'staff') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products (Cellphones) table
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    brand_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    model VARCHAR(100),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(255),
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20),
    customer_address TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert default admin user (password: admin123)
INSERT INTO admins (username, password, email, role) VALUES 
('admin', '$2y$10$u8ZK8.c8Zz5K7K3K7K3K7K3K7K3K7K3K7K3K7K3K3K3K3K3K3K3K3', 'admin@cellphonestore.com', 'admin'),
('staff1', '$2y$10$u8ZK8.c8Zz5K7K3K7K3K7K3K7K3K7K3K7K3K7K3K3K3K3K3K3K3K3', 'staff1@cellphonestore.com', 'staff');

-- Insert sample brands
INSERT INTO brands (name, description) VALUES 
('Apple', 'Premium smartphones and devices'),
('Samsung', 'Innovative mobile technology'),
('Xiaomi', 'Value for money smartphones'),
('OnePlus', 'Flagship killer devices'),
('Realme', 'Affordable smartphones'),
('OPPO', 'Photography-focused phones');

-- Insert sample products with REAL product images
INSERT INTO products (brand_id, name, model, description, price, stock, image) VALUES 
-- Apple iPhone models (using local product images)
(1, 'iPhone 15 Pro Max', 'A17 Pro', 'Premium flagship with 6.7" display and advanced cameras', 1439.99, 12, 'images/iphone/iphone15promax.jpg'),
(1, 'iPhone 15 Pro', 'A17 Pro', 'Latest Apple flagship with ProMotion display and dynamic island', 1199.99, 15, 'images/iphone/iphone15pro.jpg'),
(1, 'iPhone 15', 'A16 Bionic', 'Powerful iPhone with dual camera system', 959.99, 20, 'images/iphone/iphone15.jpg'),
(1, 'iPhone 15 Plus', 'A16 Bionic', 'Large screen standard iPhone with all-day battery', 1079.99, 18, 'images/iphone/iphone15plus.jpg'),
(1, 'iPhone 14', 'A15 Bionic', 'Previous generation reliable flagship', 719.99, 22, 'images/iphone/iphone14.jpg'),
(1, 'iPhone 14 Pro', 'A16 Bionic', 'Professional grade smartphone', 1079.99, 16, 'images/iphone/iphone14pro.jpg'),
(1, 'iPhone SE', 'A15 Bionic', 'Compact budget-friendly iPhone', 515.99, 30, 'images/iphone/iphoneSE.webp'),
(1, 'iPhone 13', 'A15 Bionic', 'Excellent value flagship', 599.99, 25, 'images/iphone/ip13.jpg'),

-- Samsung Galaxy models (real product images)
(2, 'Samsung Galaxy S24 Ultra', 'Snapdragon 8 Gen 3', 'Ultimate flagship with S Pen and advanced AI', 1439.99, 12, 'images/samsung/samsungs24ultra.jpg'),
(2, 'Samsung Galaxy S24+', 'Snapdragon 8 Gen 3', 'Premium mid-size flagship', 1199.99, 14, 'images/samsung/samsungs24+.jpg'),
(2, 'Samsung Galaxy S24', 'Snapdragon 8 Gen 3', 'Core flagship with great performance', 959.99, 16, 'images/samsung/samsung24.webp'),
(2, 'Samsung Galaxy A54', 'Exynos 1280', 'Popular mid-range with clean OS', 539.99, 25, 'images/samsung/samsungA54.jpg'),
(2, 'Samsung Galaxy A34', 'Exynos 1280', 'Budget-friendly with good performance', 359.99, 28, 'images/samsung/samsungA34.jpg'),
(2, 'Samsung Galaxy Z Fold5', 'Snapdragon 8 Gen 2', 'Innovative foldable phone', 2159.99, 8, 'images/samsung/samsungZFold5.jpg'),
(2, 'Samsung Galaxy Z Flip5', 'Snapdragon 8 Gen 2', 'Stylish compact foldable', 1199.99, 10, 'images/samsung/samsung Z flip5.jpg'),
(2, 'Samsung Galaxy M35', 'Exynos 1280', 'Budget phone with long battery', 239.99, 32, 'images/samsung/samsungM35.webp'),

-- Xiaomi models (real product images)
(3, 'Xiaomi 14 Ultra', 'Snapdragon 8 Gen 3 Leading', 'Photography focused flagship with Leica lenses', 959.99, 18, 'images/xiaomi/xiaomi14ultra.png'),
(3, 'Xiaomi 14', 'Snapdragon 8 Gen 3', 'Premium flagship with compact design', 839.99, 20, 'images/xiaomi/xiaomi14.jpeg'),
(3, 'Xiaomi 13T Pro', 'Snapdragon 8 Gen 2', 'Flagship with 144W charging', 779.99, 16, 'images/xiaomi/xiaomi13T.png'),
(3, 'Xiaomi Redmi Note 13 Pro', 'Snapdragon 7s Gen 2', 'Mid-range with 120W charging', 419.99, 24, 'images/xiaomi/xiaomieredme13 pro.jpg'),
(3, 'Xiaomi Redmi Note 13', 'MediaTek Helio G99', 'Budget-friendly gaming phone', 239.99, 35, 'images/xiaomi/xiaomieredmi note13.jpg'),
(3, 'Xiaomi Redmi 13', 'MediaTek Helio G88', 'Entry-level reliable phone', 179.99, 40, 'images/xiaomi/xiaomiredme13.png'),
(3, 'Xiaomi 13', 'Snapdragon 8 Gen 2', 'Compact flagship experience', 719.99, 18, 'images/xiaomi/xiaomi13.png'),
(3, 'Xiaomi Pad 5', 'Snapdragon 870', 'Budget tablet by Xiaomi', 419.99, 15, 'images/xiaomi/xiaomipad13.jpg'),

-- OnePlus models (real product images)
(4, 'OnePlus 12', 'Snapdragon 8 Gen 3', 'Flagship killer with fast performance', 959.99, 14, 'images/oneplus/oneplus12.png'),
(4, 'OnePlus 12R', 'Snapdragon 8 Gen 2', 'Value flagship variant', 719.99, 18, 'images/oneplus/oneplus12R.png'),
(4, 'OnePlus Open', 'Snapdragon 8 Gen 2', 'Premium foldable experience', 1559.99, 6, 'images/oneplus/oneplusOpen.webp'),
(4, 'OnePlus 11 5G', 'Snapdragon 8 Gen 1', 'Previous flagship still powerful', 599.99, 16, 'images/oneplus/oneplus115g.jpg'),
(4, 'OnePlus Nord 3', 'MediaTek Dimensity 7050', 'Mid-range with fast charging', 479.99, 20, 'images/oneplus/oneplusnord3.jpg'),
(4, 'OnePlus Nord CE 3', 'Snapdragon 695', 'Affordable with clean OS', 359.99, 22, 'images/oneplus/oneplusnordCE3.jpg'),
(4, 'OnePlus 11', 'Snapdragon 8 Gen 2', 'Gaming-focused flagship', 659.99, 14, 'images/oneplus/oneplus11.jpg'),

-- Realme models (real product images)
(5, 'Realme GT 5 Pro', 'Snapdragon 8 Gen 2', 'Gaming flagship killer', 719.99, 16, 'images/realme/realme-gt5-pro.jpg'),
(5, 'Realme 12 Pro+', 'Snapdragon 7s Gen 2', 'Premium mid-range flagship', 419.99, 20, 'images/realme/CEL-REALME-12-PRO-PLUS-5G-_12GB_512GB_-N.BEIGE-1.webp'),
(5, 'Realme 12', 'Snapdragon 685', 'Mid-range reliable phone', 299.99, 24, 'images/realme/CEL-REALME-12-5G-_8GB_256GB_-W.GREEN-1.webp'),
(5, 'Realme 12 Pro', 'Snapdragon 6 Gen 1', 'Affordable performance phone', 359.99, 22, 'images/realme/CEL-REALME-12-PRO-PLUS-5G-_12GB_512GB_-N.BEIGE-1 (1).webp'),
(5, 'Realme 11', 'Snapdragon 680', 'Budget phone with decent features', 203.99, 30, 'images/realme/realme11.jpg'),
(5, 'Realme C65', 'Unisoc T612', 'Ultra-budget smartphone', 155.99, 35, 'images/realme/CEL-REALME-C65-_8GB_256GB_-S.-BLACK-1_af1d2145-a763-4ea5-a587-fff0dbf759c9.webp'),
(5, 'Realme 11x', 'Snapdragon 695', 'Gaming budget phone', 263.99, 20, 'images/realme/Realme11xBlack_510x.webp'),

-- OPPO models (real product images)
(6, 'OPPO Find X7', 'Snapdragon 8 Gen 3', 'Premium flagship with camera prowess', 1079.99, 10, 'images/oppo/oppofindx7.jpg'),
(6, 'OPPO Find X7 Ultra', 'Snapdragon 8 Gen 3', 'Ultimate photography phone', 1199.99, 8, 'images/oppo/oppofindx7ultra.jpg'),
(6, 'OPPO Reno 11 Pro', 'Snapdragon 8 Gen 1', 'Stylish flagship phone', 779.99, 14, 'images/oppo/opporeno11pro.png'),
(6, 'OPPO A79', 'MediaTek Helio G88', 'Budget phone with long battery', 299.99, 30, 'images/oppo/oppoA79.png'),
(6, 'OPPO A78', 'MediaTek Helio G85', 'Affordable daily driver', 239.99, 28, 'images/oppo/oppoA78.png'),
(6, 'OPPO Reno 11', 'Snapdragon 778G+', 'Mid-range with portrait mode', 539.99, 16, 'images/oppo/opporeno11.jpg'),
(6, 'OPPO A58', 'MediaTek Helio G77', 'Budget entry-level phone', 155.99, 35, 'images/oppo/oppoA58.jpg'),
(6, 'OPPO A78 5G', 'Snapdragon 695 5G', 'Affordable 5G phone', 335.99, 20, 'images/oppo/oppo A78 5g.png');

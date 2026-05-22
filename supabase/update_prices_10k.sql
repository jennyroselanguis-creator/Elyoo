-- Update existing product prices to PHP ₱10,000+ (run once in Supabase SQL Editor)

UPDATE products SET price = 89990, updated_at = NOW() WHERE name = 'iPhone 15 Pro Max';
UPDATE products SET price = 74990, updated_at = NOW() WHERE name = 'iPhone 15 Pro';
UPDATE products SET price = 54990, updated_at = NOW() WHERE name = 'iPhone 15';
UPDATE products SET price = 42990, updated_at = NOW() WHERE name = 'iPhone 14';
UPDATE products SET price = 79990, updated_at = NOW() WHERE name = 'Samsung Galaxy S24 Ultra';
UPDATE products SET price = 54990, updated_at = NOW() WHERE name = 'Samsung Galaxy S24';
UPDATE products SET price = 19990, updated_at = NOW() WHERE name = 'Samsung Galaxy A54';
UPDATE products SET price = 49990, updated_at = NOW() WHERE name = 'Xiaomi 14 Ultra';
UPDATE products SET price = 12990, updated_at = NOW() WHERE name = 'Xiaomi Redmi Note 13 Pro';
UPDATE products SET price = 44990, updated_at = NOW() WHERE name = 'OnePlus 12';
UPDATE products SET price = 11990, updated_at = NOW() WHERE name = 'OnePlus Nord 3';
UPDATE products SET price = 32990, updated_at = NOW() WHERE name = 'Realme GT 5 Pro';
UPDATE products SET price = 64990, updated_at = NOW() WHERE name = 'OPPO Find X7 Ultra';
UPDATE products SET price = 29990, updated_at = NOW() WHERE name = 'OPPO Reno 11 Pro';

-- Catch any other rows still under ₱10k
UPDATE products SET price = 10000, updated_at = NOW() WHERE price < 10000;

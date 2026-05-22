<?php
/**
 * Unified catalog loader: Supabase first, then MySQL fallback, then static seed
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/supabase.php';

function getLocalSeedCatalog(int $brandId = 0): array {
    $brands = [
        ['id' => 1, 'name' => 'Apple'],
        ['id' => 2, 'name' => 'Samsung'],
        ['id' => 3, 'name' => 'Xiaomi'],
        ['id' => 4, 'name' => 'OnePlus'],
        ['id' => 5, 'name' => 'Realme'],
        ['id' => 6, 'name' => 'OPPO'],
    ];
    $products = [
        ['id' => 1, 'brand_id' => 1, 'brand_name' => 'Apple', 'name' => 'iPhone 15 Pro Max', 'model' => 'A17 Pro', 'description' => 'Premium flagship', 'price' => 1439.99, 'stock' => 12, 'image' => '/images/iphone/iphone15promax.jpg'],
        ['id' => 2, 'brand_id' => 2, 'brand_name' => 'Samsung', 'name' => 'Samsung Galaxy S24 Ultra', 'model' => 'SD8G3', 'description' => 'Ultimate flagship', 'price' => 1439.99, 'stock' => 12, 'image' => '/images/samsung/samsungs24ultra.jpg'],
        ['id' => 3, 'brand_id' => 3, 'brand_name' => 'Xiaomi', 'name' => 'Xiaomi 14 Ultra', 'model' => 'SD8G3', 'description' => 'Camera flagship', 'price' => 959.99, 'stock' => 18, 'image' => '/images/xiaomi/xiaomi14ultra.png'],
        ['id' => 4, 'brand_id' => 4, 'brand_name' => 'OnePlus', 'name' => 'OnePlus 12', 'model' => 'SD8G3', 'description' => 'Flagship killer', 'price' => 959.99, 'stock' => 14, 'image' => '/images/oneplus/oneplus12.png'],
    ];
    if ($brandId > 0) {
        $products = array_values(array_filter($products, fn($p) => (int)$p['brand_id'] === $brandId));
    }
    return ['brands' => $brands, 'products' => $products];
}

function loadCatalog(int $brandId = 0): array {
    $supabase = getSupabaseCatalog($brandId);
    if ($supabase && !empty($supabase['products'])) {
        return $supabase;
    }

    if (file_exists(__DIR__ . '/db.php')) {
        @include_once __DIR__ . '/db.php';
        if (isset($conn) && !$conn->connect_error) {
            $brands_result = $conn->query("SELECT * FROM brands ORDER BY name");
            $brands = $brands_result ? $brands_result->fetch_all(MYSQLI_ASSOC) : [];
            if ($brandId > 0) {
                $stmt = $conn->prepare("SELECT p.*, b.name as brand_name FROM products p JOIN brands b ON p.brand_id = b.id WHERE p.brand_id = ? ORDER BY p.name");
                $stmt->bind_param('i', $brandId);
                $stmt->execute();
                $products = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            } else {
                $products_result = $conn->query("SELECT p.*, b.name as brand_name FROM products p JOIN brands b ON p.brand_id = b.id ORDER BY p.name");
                $products = $products_result ? $products_result->fetch_all(MYSQLI_ASSOC) : [];
            }
            if (!empty($products)) {
                return ['brands' => $brands, 'products' => $products];
            }
        }
    }

    return getLocalSeedCatalog($brandId);
}

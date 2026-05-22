/** Offline fallback catalog when Supabase is not configured — prices in PHP (₱10,000+) */
export const seedBrands = [
  { id: 1, name: 'Apple', description: 'Premium smartphones and devices' },
  { id: 2, name: 'Samsung', description: 'Innovative mobile technology' },
  { id: 3, name: 'Xiaomi', description: 'Value for money smartphones' },
  { id: 4, name: 'OnePlus', description: 'Flagship killer devices' },
  { id: 5, name: 'Realme', description: 'Affordable smartphones' },
  { id: 6, name: 'OPPO', description: 'Photography-focused phones' },
];

const products = [
  [1, 'iPhone 15 Pro Max', 'A17 Pro', 'Premium flagship with 6.7" display and advanced cameras', 89990, 12, '/images/iphone/iphone15promax.jpg', true],
  [1, 'iPhone 15 Pro', 'A17 Pro', 'Latest Apple flagship with ProMotion display', 74990, 15, '/images/iphone/iphone15pro.jpg', true],
  [1, 'iPhone 15', 'A16 Bionic', 'Powerful iPhone with dual camera system', 54990, 20, '/images/iphone/iphone15.jpg', false],
  [1, 'iPhone 14', 'A15 Bionic', 'Previous generation reliable flagship', 42990, 22, '/images/iphone/iphone14.jpg', false],
  [2, 'Samsung Galaxy S24 Ultra', 'Snapdragon 8 Gen 3', 'Ultimate flagship with S Pen and advanced AI', 79990, 12, '/images/samsung/samsungs24ultra.jpg', true],
  [2, 'Samsung Galaxy S24', 'Snapdragon 8 Gen 3', 'Core flagship with great performance', 54990, 16, '/images/samsung/samsung24.webp', true],
  [2, 'Samsung Galaxy A54', 'Exynos 1280', 'Popular mid-range with clean OS', 19990, 25, '/images/samsung/samsungA54.jpg', false],
  [3, 'Xiaomi 14 Ultra', 'Snapdragon 8 Gen 3', 'Photography focused flagship with Leica lenses', 49990, 18, '/images/xiaomi/xiaomi14ultra.png', true],
  [3, 'Xiaomi Redmi Note 13 Pro', 'Snapdragon 7s Gen 2', 'Mid-range with 120W charging', 12990, 24, '/images/xiaomi/xiaomieredme13 pro.jpg', false],
  [4, 'OnePlus 12', 'Snapdragon 8 Gen 3', 'Flagship killer with fast performance', 44990, 14, '/images/oneplus/oneplus12.png', true],
  [4, 'OnePlus Nord 3', 'MediaTek Dimensity 7050', 'Mid-range with fast charging', 11990, 20, '/images/oneplus/oneplusnord3.jpg', false],
  [5, 'Realme GT 5 Pro', 'Snapdragon 8 Gen 2', 'Gaming flagship killer', 32990, 16, '/images/realme/realme-gt5-pro.jpg', false],
  [6, 'OPPO Find X7 Ultra', 'Snapdragon 8 Gen 3', 'Ultimate photography phone', 64990, 8, '/images/oppo/oppofindx7ultra.jpg', true],
  [6, 'OPPO Reno 11 Pro', 'Snapdragon 8 Gen 1', 'Stylish flagship phone', 29990, 14, '/images/oppo/opporeno11pro.png', false],
];

export const MIN_PRODUCT_PRICE = 10000;
export const MAX_CATALOG_PRICE = 100000;

export const seedProducts = products.map(([brand_id, name, model, description, price, stock, image, featured], index) => {
  const brand = seedBrands.find((b) => b.id === brand_id);
  return {
    id: index + 1,
    brand_id,
    name,
    model,
    description,
    specs: description,
    price,
    stock,
    image,
    featured,
    brand_name: brand?.name || '',
  };
});

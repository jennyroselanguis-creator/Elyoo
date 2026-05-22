<?php
session_start();
require_once 'includes/catalog.php';

$selected_brand = isset($_GET['brand']) ? intval($_GET['brand']) : 0;
$catalog = loadCatalog($selected_brand);
$brands = $catalog['brands'];
$products = $catalog['products'];
$data_source = USE_SUPABASE ? 'Supabase' : (count($products) > 4 ? 'Database' : 'Demo');

// Handle add to cart
if (isset($_POST['add_to_cart'])) {
    $product_id = intval($_POST['product_id']);
    $quantity = intval($_POST['quantity']);
    $productName = '';
    
    // Get product name
    foreach ($products as $product) {
        if ($product['id'] == $product_id) {
            $productName = htmlspecialchars($product['name']);
            break;
        }
    }
    
    if (!isset($_SESSION['cart'])) {
        $_SESSION['cart'] = [];
    }
    
    if (isset($_SESSION['cart'][$product_id])) {
        $_SESSION['cart'][$product_id] += $quantity;
    } else {
        $_SESSION['cart'][$product_id] = $quantity;
    }
    
    $_SESSION['message'] = "$productName added to cart!";
    $_SESSION['notifyType'] = 'success';
}

// Get cart count
$cart_count = isset($_SESSION['cart']) ? count($_SESSION['cart']) : 0;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Elyoo Mobile Devices - Authentic Smartphones & Premium Electronics</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div id="notification-container" class="notification-container"></div>

    <header>
        <div class="header-container">
            <div class="logo-section">
                <h1>📱 Elyoo Mobile Devices</h1>
                <p class="tagline">Authentic Smartphones · <?php echo htmlspecialchars($data_source); ?> Connected</p>
            </div>
            <nav>
                <a href="index.php" class="nav-link active">Home</a>
                <a href="cart.php" class="nav-link cart-link">🛒 Cart (<?php echo $cart_count; ?>)</a>
                <a href="track-order.php" class="nav-link">📦 Track Order</a>
                <a href="admin/" class="nav-link">Admin</a>
            </nav>
        </div>
    </header>

    <!-- Hero Banner -->
    <section class="hero-banner">
        <div class="hero-content">
            <div class="hero-badge">⭐ Trusted by Thousands · 100% Authentic</div>
            <h2 class="hero-title">Find Your Perfect Smartphone Today</h2>
            <p class="hero-subtitle">Premium devices from the world's top brands. Authentic products, guaranteed quality, and exclusive prices you won't find elsewhere.</p>
            <a href="#products" class="hero-cta">Shop All Devices</a>
        </div>
        <div class="hero-background">
            <div class="hero-gradient"></div>
            <div class="hero-shapes">
                <div class="shape shape-1"></div>
                <div class="shape shape-2"></div>
                <div class="shape shape-3"></div>
            </div>
        </div>
    </section>

    <div class="container">
        <div class="products-header">
            <div>
                <h2><span class="collection-accent">🏆</span> Elyoo's Exclusive Smartphone Collection <span class="collection-accent">🏆</span></h2>
                <p class="section-subtitle">Explore <?php echo count($products); ?> authentic smartphones from Samsung, Apple, OnePlus, Xiaomi, Realme & OPPO with verified authenticity</p>
            </div>
        </div>

        <?php if (isset($_SESSION['message'])): ?>
            <script>
                // Store message for toast notification
                window.toastMessage = '<?php echo $_SESSION['message']; ?>';
                window.toastType = '<?php echo isset($_SESSION['notifyType']) ? $_SESSION['notifyType'] : 'success'; ?>';
            </script>
            <?php unset($_SESSION['message']); unset($_SESSION['notifyType']); ?>
        <?php endif; ?>

        <div class="filter-section">
            <div class="filter-wrapper">
                <label for="brand_filter" class="filter-label">Filter by Brand:</label>
                <select id="brand_filter" class="filter-select" onchange="window.location.href='index.php?brand=' + this.value">
                    <option value="">🌍 All Brands</option>
                    <?php foreach ($brands as $brand): ?>
                        <option value="<?php echo $brand['id']; ?>" 
                                <?php echo ($selected_brand == $brand['id']) ? 'selected' : ''; ?>>
                            <?php echo htmlspecialchars($brand['name']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
        </div>

        <div id="products" class="grid grid-3">
            <?php foreach ($products as $product): ?>
                <div class="card product-card">
                    <div class="card-image-wrapper">
                        <div style="background: linear-gradient(135deg, #f0f4f8 0%, #e8eef7 100%); height: 300px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
                            <?php if (!empty($product['image'])): ?>
                                <img src="<?php echo htmlspecialchars($product['image']); ?>" alt="<?php echo htmlspecialchars($product['name']); ?>" class="product-image">
                            <?php else: ?>
                                <div style="text-align: center; color: #999;">
                                    <div style="font-size: 64px; opacity: 0.6;">📱</div>
                                </div>
                            <?php endif; ?>
                        </div>
                        <div class="card-badge"><?php echo htmlspecialchars($product['brand_name']); ?></div>
                        <?php if ($product['stock'] < 5 && $product['stock'] > 0): ?>
                            <div class="stock-badge limited">Only <?php echo $product['stock']; ?> left!</div>
                        <?php elseif ($product['stock'] == 0): ?>
                            <div class="stock-badge out-of-stock">Out of Stock</div>
                        <?php endif; ?>
                    </div>
                
                    <div class="card-body">
                        <h3 class="product-name"><?php echo htmlspecialchars($product['name']); ?></h3>
                        <p class="product-model"><?php echo htmlspecialchars($product['model']); ?></p>
                        <div class="product-specs">
                            <?php 
                                $specs = htmlspecialchars($product['description']);
                                // Extract key specs from description
                                if (strlen($specs) > 50) {
                                    echo substr($specs, 0, 60) . '...';
                                } else {
                                    echo $specs;
                                }
                            ?>
                        </div>
                    
                        <div class="price-section">
                            <div class="product-price">₱<?php echo number_format($product['price'], 2); ?></div>
                            <div class="stock-indicator <?php echo ($product['stock'] > 0) ? 'in-stock' : 'out-of-stock'; ?>">
                                <?php echo ($product['stock'] > 0) ? $product['stock'] . ' left' : 'Out'; ?>
                            </div>
                        </div>
                        
                        <?php if ($product['stock'] > 0): ?>
                            <form method="POST" class="add-to-cart-form">
                                <input type="hidden" name="product_id" value="<?php echo $product['id']; ?>">
                                <div class="quantity-selector">
                                    <button type="button" class="qty-btn qty-minus">−</button>
                                    <input type="number" name="quantity" value="1" min="1" max="<?php echo $product['stock']; ?>" class="qty-input">
                                    <button type="button" class="qty-btn qty-plus">+</button>
                                </div>
                                <button type="submit" name="add_to_cart" class="btn btn-primary btn-add-cart">
                                    Add to Cart
                                </button>
                            </form>
                        <?php else: ?>
                            <button class="btn btn-secondary btn-block" disabled>Out of Stock</button>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <?php if (empty($products)): ?>
            <div class="alert alert-info">
                No products found. Please try a different filter.
            </div>
        <?php endif; ?>
    </div>

    <footer>
        <div class="footer-content">
            <p>&copy; 2024 Cellphone Store. All rights reserved.</p>
            <p class="footer-subtitle">Authentic Devices • Expert Support • 100% Satisfaction Guaranteed</p>
        </div>
    </footer>

    <script>
        // Toast notification function
        function showToast(message, type = 'success', duration = 3000) {
            const container = document.getElementById('notification-container');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            const icons = {
                success: '✓',
                error: '✕',
                info: 'ℹ'
            };
            
            toast.innerHTML = `
                <span class="toast-icon">${icons[type] || '✓'}</span>
                <span class="toast-message">${message}</span>
                <button type="button" class="toast-close">×</button>
            `;
            
            container.appendChild(toast);
            
            // Close button functionality
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => {
                toast.classList.add('removing');
                setTimeout(() => toast.remove(), 300);
            });
            
            // Auto-dismiss
            const timeout = setTimeout(() => {
                if (toast.parentNode) {
                    toast.classList.add('removing');
                    setTimeout(() => toast.remove(), 300);
                }
            }, duration);
            
            // Clear timeout if manually closed
            closeBtn.addEventListener('click', () => clearTimeout(timeout));
        }

        // Show toast if message exists from session
        if (typeof window.toastMessage !== 'undefined' && window.toastMessage) {
            setTimeout(() => {
                showToast(window.toastMessage, window.toastType || 'success', 3000);
            }, 300);
        }

        // Restore scroll position on page load
        window.addEventListener('load', function() {
            const scrollPosition = sessionStorage.getItem('scrollPosition');
            if (scrollPosition !== null) {
                window.scrollTo(0, parseInt(scrollPosition));
                sessionStorage.removeItem('scrollPosition');
            }
        });

        // Save scroll position before page navigation
        window.addEventListener('beforeunload', function() {
            sessionStorage.setItem('scrollPosition', window.scrollY);
        });

        // Save scroll position for filter changes
        document.getElementById('brand_filter').addEventListener('change', function() {
            sessionStorage.setItem('scrollPosition', window.scrollY);
        });

        // Save scroll position for add to cart form submissions
        document.querySelectorAll('.add-to-cart-form').forEach(form => {
            form.addEventListener('submit', function() {
                sessionStorage.setItem('scrollPosition', window.scrollY);
            });
        });

        // Smooth click animation for product cards
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', function(e) {
                if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
                    this.style.animation = 'none';
                    setTimeout(() => {
                        this.style.animation = '';
                        this.style.animation = 'cardClick 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), cardClickRipple 0.6s ease-out';
                    }, 10);
                }
            });
        });

        // Enhanced button click animation (fixed to not glitch)
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Create ripple effect
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');

                this.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);

                // Submit form after ripple starts
                setTimeout(() => {
                    this.form.submit();
                }, 100);
            });
        });

        // Quantity selector handlers
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const form = this.closest('.add-to-cart-form');
                const input = form.querySelector('.qty-input');
                const max = parseInt(input.getAttribute('max'));
                let current = parseInt(input.value) || 1;

                if (this.classList.contains('qty-minus')) {
                    current = Math.max(1, current - 1);
                } else if (this.classList.contains('qty-plus')) {
                    current = Math.min(max, current + 1);
                }

                input.value = current;
            });
        });
    </script>

    <style>
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        }

        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    </style>
</body>
</html>

<?php
session_start();
include 'includes/db.php';

// Get cart count
$cart_count = isset($_SESSION['cart']) ? count($_SESSION['cart']) : 0;

// Handle remove from cart
if (isset($_GET['remove'])) {
    $product_id = intval($_GET['remove']);
    unset($_SESSION['cart'][$product_id]);
    $_SESSION['message'] = "Product removed from cart!";
    header("Location: cart.php");
    exit;
}

// Handle update quantity
if (isset($_POST['update_cart'])) {
    foreach ($_POST['quantities'] as $product_id => $quantity) {
        $quantity = intval($quantity);
        if ($quantity <= 0) {
            unset($_SESSION['cart'][$product_id]);
        } else {
            $_SESSION['cart'][$product_id] = $quantity;
        }
    }
    $_SESSION['message'] = "Cart updated!";
}

// Handle checkout
if (isset($_POST['checkout'])) {
    $customer_name = htmlspecialchars($_POST['customer_name']);
    $customer_email = htmlspecialchars($_POST['customer_email']);
    $customer_phone = htmlspecialchars($_POST['customer_phone']);
    $customer_address = htmlspecialchars($_POST['customer_address']);
    
    if (empty($customer_name) || empty($customer_email) || empty($customer_address)) {
        $_SESSION['error'] = "Please fill all required fields!";
    } else if (empty($_SESSION['cart'])) {
        $_SESSION['error'] = "Your cart is empty!";
    } else {
        // Calculate total
        $total = 0;
        $cart_data = [];
        
        foreach ($_SESSION['cart'] as $product_id => $quantity) {
            $product_result = $conn->query("SELECT * FROM products WHERE id = $product_id");
            $product = $product_result->fetch_assoc();
            $total += $product['price'] * $quantity;
            $cart_data[$product_id] = ['quantity' => $quantity, 'price' => $product['price']];
        }
        
        // Insert order
        $stmt = $conn->prepare("INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, total_amount) 
                               VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssd", $customer_name, $customer_email, $customer_phone, $customer_address, $total);
        $stmt->execute();
        $order_id = $stmt->insert_id;
        $stmt->close();
        
        // Insert order items
        foreach ($cart_data as $product_id => $data) {
            $stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) 
                                   VALUES (?, ?, ?, ?)");
            $stmt->bind_param("iiii", $order_id, $product_id, $data['quantity'], $data['price']);
            $stmt->execute();
            $stmt->close();
            
            // Update stock
            $conn->query("UPDATE products SET stock = stock - {$data['quantity']} WHERE id = $product_id");
        }
        
        // Clear cart
        unset($_SESSION['cart']);
        $_SESSION['message'] = "Order placed successfully! Order #" . $order_id;
    }
}

// Get cart items with product details
$cart_items = [];
$total = 0;

if (isset($_SESSION['cart'])) {
    foreach ($_SESSION['cart'] as $product_id => $quantity) {
        $result = $conn->query("SELECT p.*, b.name as brand_name FROM products p 
                               JOIN brands b ON p.brand_id = b.id WHERE p.id = $product_id");
        $product = $result->fetch_assoc();
        $subtotal = $product['price'] * $quantity;
        $total += $subtotal;
        $cart_items[] = [
            'id' => $product_id,
            'product' => $product,
            'quantity' => $quantity,
            'subtotal' => $subtotal
        ];
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shopping Cart - Elyoo Mobile Devices</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header>
        <div class="header-container">
            <div class="logo-section">
                <h1>📱 Elyoo Mobile Devices</h1>
                <p class="tagline">Authentic Smartphones & Premium Electronics</p>
            </div>
            <nav>
                <a href="index.php" class="nav-link">Home</a>
                <a href="cart.php" class="nav-link cart-link active">🛒 Cart (<?php echo $cart_count; ?>)</a>
                <a href="admin/" class="nav-link">Admin</a>
            </nav>
        </div>
    </header>

    <div class="container">
        <div style="margin-bottom: 40px;">
            <h2 style="margin: 0 0 8px 0; font-size: 36px;">Shopping Cart</h2>
            <p class="section-subtitle">Review and manage your items</p>
        </div>

        <?php if (isset($_SESSION['message'])): ?>
            <div class="alert alert-success">
                <span class="alert-icon">✓</span> <?php echo $_SESSION['message']; unset($_SESSION['message']); ?>
            </div>
        <?php endif; ?>

        <?php if (isset($_SESSION['error'])): ?>
            <div class="alert alert-danger">
                <span class="alert-icon">✗</span> <?php echo $_SESSION['error']; unset($_SESSION['error']); ?>
            </div>
        <?php endif; ?>

        <?php if (empty($cart_items)): ?>
            <div class="alert alert-info">
                Your cart is empty. <a href="index.php" style="color: var(--info-color); font-weight: 600; text-decoration: underline;">Continue shopping</a>
            </div>
        <?php else: ?>
            <div style="display: grid; grid-template-columns: 1fr 380px; gap: 30px;">
                <div>
                    <form method="POST" class="cart-form">
                        <table style="background: white; overflow: hidden;">
                            <thead>
                                <tr style="background: linear-gradient(135deg, #2563eb, #3b82f6); color: white;">
                                    <th style="text-align: left; padding: 16px;">Product</th>
                                    <th style="text-align: center; padding: 16px;">Price</th>
                                    <th style="text-align: center; padding: 16px;">Quantity</th>
                                    <th style="text-align: center; padding: 16px;">Subtotal</th>
                                    <th style="text-align: center; padding: 16px;">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($cart_items as $item): ?>
                                    <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.3s ease;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                                        <td style="padding: 16px;">
                                            <strong style="color: #1e293b; display: block; margin-bottom: 4px;"><?php echo htmlspecialchars($item['product']['name']); ?></strong>
                                            <small style="color: #64748b; font-size: 13px;"><?php echo htmlspecialchars($item['product']['brand_name']); ?></small>
                                        </td>
                                        <td style="padding: 16px; text-align: center; color: #475569;">₱<?php echo number_format($item['product']['price'], 2); ?></td>
                                        <td style="padding: 16px; text-align: center;">
                                            <input type="number" name="quantities[<?php echo $item['id']; ?>]" 
                                                   value="<?php echo $item['quantity']; ?>" min="1" 
                                                   max="<?php echo $item['product']['stock'] + $item['quantity']; ?>"
                                                   style="width: 70px; padding: 8px; border: 2px solid #e2e8f0; border-radius: 6px; text-align: center; font-size: 14px;">
                                        </td>
                                        <td style="padding: 16px; text-align: center; color: #2563eb; font-weight: 700;">₱<?php echo number_format($item['subtotal'], 2); ?></td>
                                        <td style="padding: 16px; text-align: center;">
                                            <a href="cart.php?remove=<?php echo $item['id']; ?>" class="btn btn-danger" 
                                               style="padding: 8px 14px; font-size: 12px; display: inline-block;">Remove</a>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                        <button type="submit" name="update_cart" class="btn btn-secondary" style="margin-top: 20px; width: 100%; padding: 12px">Update Cart</button>
                    </form>
                </div>

                <div class="cart-summary" style="background: white; padding: 28px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); height: fit-content; position: sticky; top: 100px;">
                    <h3 style="margin-top: 0; margin-bottom: 24px; font-size: 22px; font-weight: 700; font-family: 'Poppins', sans-serif; color: #1e293b;">Order Summary</h3>
                    <div class="cart-item" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 15px;">
                        <span>Subtotal:</span>
                        <span style="font-weight: 600;">₱<?php echo number_format($total, 2); ?></span>
                    </div>
                    <div class="cart-item" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 15px;">
                        <span>Shipping:</span>
                        <span style="font-weight: 600;">$0.00</span>
                    </div>
                    <div class="cart-item" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 15px;">
                        <span>Tax:</span>
                        <span style="font-weight: 600;">$0.00</span>
                    </div>
                    <div class="cart-total" style="display: flex; justify-content: space-between; align-items: center; font-size: 20px; font-weight: 700; margin-top: 16px; padding-top: 16px; border-top: 2px solid #2563eb; color: #2563eb; margin-bottom: 24px;">
                        <span>Total:</span>
                        <span>₱<?php echo number_format($total, 2); ?></span>
                    </div>

                    <form method="POST">
                        <h4 style="margin: 0 0 20px 0; font-size: 16px; font-weight: 700; color: #1e293b; font-family: 'Poppins', sans-serif;">Customer Information</h4>
                        
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b; font-family: 'Poppins', sans-serif; font-size: 14px;">Full Name <span style="color: #ef4444;">*</span></label>
                            <input type="text" name="customer_name" required style="width: 100%; padding: 10px 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px; transition: all 0.3s ease;" onfocus="this.style.borderColor='#2563eb'; this.style.boxShadow='0 0 0 4px rgba(37, 99, 235, 0.1)';" onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';">
                        </div>

                        <div class="form-group">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b; font-family: 'Poppins', sans-serif; font-size: 14px;">Email <span style="color: #ef4444;">*</span></label>
                            <input type="email" name="customer_email" required style="width: 100%; padding: 10px 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px; transition: all 0.3s ease;" onfocus="this.style.borderColor='#2563eb'; this.style.boxShadow='0 0 0 4px rgba(37, 99, 235, 0.1)';" onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';">
                        </div>

                        <div class="form-group">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b; font-family: 'Poppins', sans-serif; font-size: 14px;">Phone Number</label>
                            <input type="tel" name="customer_phone" style="width: 100%; padding: 10px 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px; transition: all 0.3s ease;" onfocus="this.style.borderColor='#2563eb'; this.style.boxShadow='0 0 0 4px rgba(37, 99, 235, 0.1)';" onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';">
                        </div>

                        <div class="form-group">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b; font-family: 'Poppins', sans-serif; font-size: 14px;">Delivery Address <span style="color: #ef4444;">*</span></label>
                            <textarea name="customer_address" required style="width: 100%; padding: 10px 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 100px; resize: vertical; transition: all 0.3s ease; font-family: 'Inter', sans-serif;" onfocus="this.style.borderColor='#2563eb'; this.style.boxShadow='0 0 0 4px rgba(37, 99, 235, 0.1)';" onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';"></textarea>
                        </div>

                        <button type="submit" name="checkout" class="btn btn-success" style="width: 100%; padding: 14px; font-size: 15px; font-weight: 700; margin-top: 20px;">
                            Place Order
                        </button>
                    </form>
                </div>
            </div>
        <?php endif; ?>
    </div>

    <footer>
        <div class="footer-content">
            <p>&copy; 2024 Cellphone Store. All rights reserved.</p>
            <p class="footer-subtitle">Authentic Devices • Expert Support • 100% Satisfaction Guaranteed</p>
        </div>
    </footer>
</body>
</html>

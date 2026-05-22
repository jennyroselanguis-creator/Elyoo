<?php
session_start();
include 'includes/db.php';

// Get buyer email from session (set after checkout)

// Handle email form submission
if (isset($_POST['lookup_email'])) {
    $entered_email = trim($_POST['lookup_email']);
    if (filter_var($entered_email, FILTER_VALIDATE_EMAIL)) {
        $_SESSION['buyer_email'] = $entered_email;
        $buyer_email = $entered_email;
    } else {
        $_SESSION['error'] = 'Please enter a valid email address.';
        $buyer_email = '';
    }
} else {
    $buyer_email = isset($_SESSION['buyer_email']) ? $_SESSION['buyer_email'] : '';
}

$orders = [];
// AJAX cancel order request
if (isset($_POST['ajax_cancel_order']) && isset($_POST['order_id'])) {
    $order_id = intval($_POST['order_id']);
    $response = ['success' => false, 'msg' => ''];
    $stmt = $conn->prepare("SELECT * FROM orders WHERE id = ? AND customer_email = ? AND status = 'pending'");
    $stmt->bind_param("is", $order_id, $buyer_email);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $conn->query("UPDATE orders SET status = 'cancelled_by_user' WHERE id = $order_id");
        $response['success'] = true;
        $response['msg'] = "Order #$order_id cancelled.";
    } else {
        $response['msg'] = "Unable to cancel this order.";
    }
    $stmt->close();
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

if ($buyer_email) {
    $orders_sql = "SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC";
    $stmt = $conn->prepare($orders_sql);
    $stmt->bind_param("s", $buyer_email);
    $stmt->execute();
    $result = $stmt->get_result();
    $orders = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Orders - Elyoo Mobile Devices</title>
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
                <a href="cart.php" class="nav-link cart-link">🛒 Cart (<?php echo isset($_SESSION['cart']) ? count($_SESSION['cart']) : 0; ?>)</a>
                <a href="my_orders.php" class="nav-link active">Order</a>
                <a href="admin/" class="nav-link">Admin</a>
            </nav>
        </div>
    </header>
    <div class="container">
        <h2 style="margin: 30px 0 20px 0;">My Orders</h2>
        <?php if (isset($_SESSION['message'])): ?>
            <div class="alert alert-success"><?php echo $_SESSION['message']; unset($_SESSION['message']); ?></div>
        <?php endif; ?>
        <?php if (isset($_SESSION['error'])): ?>
            <div class="alert alert-danger"><?php echo $_SESSION['error']; unset($_SESSION['error']); ?></div>
        <?php endif; ?>
        <form method="POST" style="margin-bottom: 25px; background: #101111; padding: 18px 20px; border-radius: 8px; max-width: 400px;">
            <label for="lookup_email" style="font-weight: 500;">Enter your email to view your orders:</label><br>
            <input type="email" name="lookup_email" id="lookup_email" value="<?php echo htmlspecialchars($buyer_email); ?>" required style="padding: 7px 10px; border-radius: 4px; border: 1px solid #ccc; width: 70%; margin-top: 7px;">
            <button type="submit" style="padding: 7px 18px; border-radius: 4px; background: #2563eb; color: #fff; border: none; margin-left: 8px;">Lookup</button>
        </form>
        <?php if (!$buyer_email): ?>
            <div class="alert alert-info">Please enter your email to view your orders.</div>
        <?php elseif (empty($orders)): ?>
            <div class="alert alert-info">No orders found for your email (<?php echo htmlspecialchars($buyer_email); ?>).</div>
        <?php else: ?>
            <table style="width:100%; background: white; border-radius: 10px; overflow: hidden;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #2563eb, #3b82f6); color: white;">
                        <th style="padding: 12px;">Order #</th>
                        <th style="padding: 12px;">Date</th>
                        <th style="padding: 12px;">Total</th>
                        <th style="padding: 12px;">Status</th>
                        <th style="padding: 12px;">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($orders as $order): ?>
                        <tr style="border-bottom: 1px solid #e2e8f0; color: #111;">
                            <td style="padding: 12px; color: #111;">#<?php echo $order['id']; ?></td>
                            <td style="padding: 12px; color: #111;"><?php echo date('M d, Y H:i', strtotime($order['created_at'])); ?></td>
                            <td style="padding: 12px; color: #111;">₱<?php echo number_format($order['total_amount'], 2); ?></td>
                            <td style="padding: 12px; text-transform: capitalize; color: #111;">
                                <?php 
                                    if ($order['status'] === 'cancelled_by_user') {
                                        echo 'Cancelled by You';
                                    } else {
                                        echo htmlspecialchars($order['status']);
                                    }
                                ?>
                            </td>
                            <td style="padding: 12px; color: #111;">
                                <?php if ($order['status'] === 'pending'): ?>
                                    <button type="button" class="btn btn-danger cancel-order-btn" data-order-id="<?php echo $order['id']; ?>" style="padding: 6px 14px; font-size: 13px;">Cancel</button>
                                <?php else: ?>
                                    —
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
    <footer>
        <div class="footer-content">
            <p>&copy; 2024 Cellphone Store. All rights reserved.</p>
            <p class="footer-subtitle">Authentic Devices • Expert Support • 100% Satisfaction Guaranteed</p>
        </div>
    </footer>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.cancel-order-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (!confirm('Are you sure you want to cancel this order?')) return;
                var orderId = this.getAttribute('data-order-id');
                var row = this.closest('tr');
                var statusCell = row.querySelector('td:nth-child(4)');
                var actionCell = row.querySelector('td:nth-child(5)');
                fetch('my_orders.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'ajax_cancel_order=1&order_id=' + encodeURIComponent(orderId)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        statusCell.textContent = 'Cancelled by You';
                        actionCell.textContent = '—';
                        alert(data.msg);
                    } else {
                        alert(data.msg);
                    }
                });
            });
        });
    });
    </script>
</body>
</html>

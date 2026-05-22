<?php
session_start();

if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}

include '../includes/db.php';

// Handle status update
if (isset($_POST['update_status'])) {
    $order_id = intval($_POST['order_id']);
    $status = htmlspecialchars($_POST['status']);
    
    $conn->query("UPDATE orders SET status='$status' WHERE id=$order_id");
    $_SESSION['message'] = "Order status updated!";
}

// Get filter
$status_filter = isset($_GET['status']) ? htmlspecialchars($_GET['status']) : '';

// Get orders
if (!empty($status_filter)) {
    $orders = $conn->query("SELECT * FROM orders WHERE status='$status_filter' ORDER BY created_at DESC")->fetch_all(MYSQLI_ASSOC);
} else {
    $orders = $conn->query("SELECT * FROM orders ORDER BY created_at DESC")->fetch_all(MYSQLI_ASSOC);
}

// Get order details
$view_order = null;
if (isset($_GET['view'])) {
    $order_id = intval($_GET['view']);
    $order_result = $conn->query("SELECT * FROM orders WHERE id=$order_id");
    if ($order_result->num_rows > 0) {
        $view_order = $order_result->fetch_assoc();
        
        // Get order items
        $items_result = $conn->query("SELECT oi.*, p.name, p.brand_id, b.name as brand_name FROM order_items oi
                                      JOIN products p ON oi.product_id = p.id
                                      JOIN brands b ON p.brand_id = b.id
                                      WHERE oi.order_id=$order_id");
        $view_order['items'] = $items_result->fetch_all(MYSQLI_ASSOC);
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orders Management - Elyoo Mobile</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <div class="sidebar">
        <h2>Elyoo Admin Panel</h2>
        <ul class="sidebar-menu">
            <li><a href="dashboard.php">Dashboard</a></li>
            <li><a href="products.php">Products</a></li>
            <li><a href="brands.php">Brands</a></li>
            <li><a href="staff.php">Staff</a></li>
            <li><a href="orders.php" class="active">Orders</a></li>
            <li><a href="change_password.php">Change Password</a></li>
            <li><a href="logout.php" onclick="return confirm('Are you sure you want to logout?');">Logout</a></li>
        </ul>
    </div>

    <div class="admin-content">
        <h1>Orders Management</h1>

        <?php if (isset($_SESSION['message'])): ?>
            <div class="alert alert-success">
                <?php echo $_SESSION['message']; unset($_SESSION['message']); ?>
            </div>
        <?php endif; ?>

        <?php if ($view_order): ?>
            <!-- Order Details View -->
            <div class="card" style="margin-bottom: 30px;">
                <div class="card-body">
                    <h2>Order #<?php echo $view_order['id']; ?></h2>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                        <div>
                            <h4>Customer Information</h4>
                            <p><strong>Name:</strong> <?php echo htmlspecialchars($view_order['customer_name']); ?></p>
                            <p><strong>Email:</strong> <?php echo htmlspecialchars($view_order['customer_email']); ?></p>
                            <p><strong>Phone:</strong> <?php echo htmlspecialchars($view_order['customer_phone']); ?></p>
                            <p><strong>Address:</strong> <?php echo htmlspecialchars($view_order['customer_address']); ?></p>
                        </div>
                        
                        <div>
                            <h4>Order Details</h4>
                            <p><strong>Status:</strong> 
                                <form method="POST" style="display: inline;">
                                    <input type="hidden" name="order_id" value="<?php echo $view_order['id']; ?>">
                                    <select name="status" onchange="this.form.submit()" style="padding: 5px; border-radius: 3px;">
                                        <option value="pending" <?php echo ($view_order['status'] === 'pending') ? 'selected' : ''; ?>>Pending</option>
                                        <option value="processing" <?php echo ($view_order['status'] === 'processing') ? 'selected' : ''; ?>>Processing</option>
                                        <option value="completed" <?php echo ($view_order['status'] === 'completed') ? 'selected' : ''; ?>>Completed</option>
                                        <option value="cancelled" <?php echo ($view_order['status'] === 'cancelled') ? 'selected' : ''; ?>>Cancelled</option>
                                    </select>
                                    <input type="hidden" name="update_status" value="1">
                                </form>
                            </p>
                            <p><strong>Order Date:</strong> <?php echo date('M d, Y H:i', strtotime($view_order['created_at'])); ?></p>
                            <p><strong>Total Amount:</strong> <span style="font-size: 24px; color: var(--success-color); font-weight: bold;">
                                $<?php echo number_format($view_order['total_amount'], 2); ?>
                            </span></p>
                        </div>
                    </div>

                    <h4>Order Items</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Brand</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($view_order['items'] as $item): ?>
                                <tr>
                                    <td><?php echo htmlspecialchars($item['name']); ?></td>
                                    <td><?php echo htmlspecialchars($item['brand_name']); ?></td>
                                    <td>₱<?php echo number_format($item['price'], 2); ?></td>
                                    <td><?php echo $item['quantity']; ?></td>
                                    <td>₱<?php echo number_format($item['price'] * $item['quantity'], 2); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>

                    <a href="orders.php" class="btn btn-secondary" style="margin-top: 20px;">← Back to Orders</a>
                </div>
            </div>
        <?php else: ?>
            <!-- Orders List -->
            <div class="category-filter">
                <label>Filter by Status:</label>
                <select onchange="window.location.href='orders.php?status=' + this.value">
                    <option value="">All Orders</option>
                    <option value="pending" <?php echo ($status_filter === 'pending') ? 'selected' : ''; ?>>Pending</option>
                    <option value="processing" <?php echo ($status_filter === 'processing') ? 'selected' : ''; ?>>Processing</option>
                    <option value="completed" <?php echo ($status_filter === 'completed') ? 'selected' : ''; ?>>Completed</option>
                    <option value="cancelled" <?php echo ($status_filter === 'cancelled') ? 'selected' : ''; ?>>Cancelled</option>
                </select>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($orders as $order): ?>
                        <tr>
                            <td>#<?php echo $order['id']; ?></td>
                            <td><?php echo htmlspecialchars($order['customer_name']); ?></td>
                            <td><?php echo htmlspecialchars($order['customer_email']); ?></td>
                            <td>$<?php echo number_format($order['total_amount'], 2); ?></td>
                            <td>
                                <span style="padding: 5px 10px; border-radius: 20px; font-size: 12px; background-color: 
                                    <?php 
                                        if ($order['status'] === 'completed') echo '#d4edda'; 
                                        else if ($order['status'] === 'pending') echo '#fff3cd';
                                        else if ($order['status'] === 'processing') echo '#d1ecf1';
                                        else echo '#f8d7da';
                                    ?>; 
                                    color: 
                                    <?php 
                                        if ($order['status'] === 'completed') echo '#155724'; 
                                        else if ($order['status'] === 'pending') echo '#856404';
                                        else if ($order['status'] === 'processing') echo '#0c5460';
                                        else echo '#721c24';
                                    ?>;">
                                    <?php echo ucfirst($order['status']); ?>
                                </span>
                            </td>
                            <td><?php echo date('M d, Y', strtotime($order['created_at'])); ?></td>
                            <td>
                                <a href="orders.php?view=<?php echo $order['id']; ?>" class="btn btn-primary" 
                                   style="padding: 5px 10px; font-size: 12px;">View</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>

            <?php if (empty($orders)): ?>
                <div class="alert alert-info">
                    No orders found.
                </div>
            <?php endif; ?>
        <?php endif; ?>
    </div>
</body>
</html>

<?php
session_start();

// Check if logged in
if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}

include '../includes/db.php';

// Get dashboard stats
$products_count = $conn->query("SELECT COUNT(*) as count FROM products")->fetch_assoc()['count'];
$orders_count = $conn->query("SELECT COUNT(*) as count FROM orders")->fetch_assoc()['count'];
$pending_orders = $conn->query("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'")->fetch_assoc()['count'];
$total_revenue = $conn->query("SELECT SUM(total_amount) as total FROM orders WHERE status = 'completed'")->fetch_assoc()['total'] ?? 0;
$staff_count = $conn->query("SELECT COUNT(*) as count FROM admins WHERE role = 'staff'")->fetch_assoc()['count'];

// Get recent orders
$recent_orders = $conn->query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5")->fetch_all(MYSQLI_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Elyoo Mobile - Admin Dashboard</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <div class="sidebar">
        <h2><?php echo ($_SESSION['admin_role'] === 'admin') ? 'Elyoo Admin Panel' : 'Elyoo Staff Panel'; ?></h2>
        <ul class="sidebar-menu">
            <li><a href="dashboard.php" class="active">Dashboard</a></li>
            <li><a href="products.php">Products</a></li>
            <?php if ($_SESSION['admin_role'] === 'admin'): ?>
            <li><a href="brands.php">Brands</a></li>
            <?php endif; ?>
            <li><a href="staff.php">Staff</a></li>
            <li><a href="orders.php">Orders</a></li>
            <li><a href="change_password.php">Change Password</a></li>
            <li><a href="logout.php" onclick="return confirm('Are you sure you want to logout?');">Logout</a></li>
        </ul>
    </div>
    <header style="background: #1a2840; color: #fff; padding: 18px 30px 10px 230px; font-size: 16px; font-weight: 500;">
        Logged in as: <strong><?php echo $_SESSION['admin_username']; ?></strong> | Role: <strong><?php echo ucfirst($_SESSION['admin_role']); ?></strong>
    </header>

    <div class="admin-content">
        <h1>Dashboard</h1>

        <div class="grid grid-2">
            <div class="card">
                <div class="card-body">
                    <h3 style="color: var(--primary-color);">Total Products</h3>
                    <div style="font-size: 36px; font-weight: bold; margin: 15px 0;">
                        <?php echo $products_count; ?>
                    </div>
                    <a href="products.php" class="btn btn-primary">Manage Products</a>
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <h3 style="color: var(--success-color);">Total Orders</h3>
                    <div style="font-size: 36px; font-weight: bold; margin: 15px 0;">
                        <?php echo $orders_count; ?>
                    </div>
                    <a href="orders.php" class="btn btn-success">View Orders</a>
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <h3 style="color: var(--danger-color);">Pending Orders</h3>
                    <div style="font-size: 36px; font-weight: bold; margin: 15px 0; color: var(--danger-color);">
                        <?php echo $pending_orders; ?>
                    </div>
                    <a href="orders.php" class="btn btn-danger">Process Orders</a>
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <h3 style="color: #6f42c1;">Total Revenue</h3>
                    <div style="font-size: 36px; font-weight: bold; margin: 15px 0; color: #6f42c1;">
                        $<?php echo number_format($total_revenue, 2); ?>
                    </div>
                    <a href="orders.php" class="btn" style="background-color: #6f42c1; color: white;">Details</a>
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <h3 style="color: #fd7e14;">Staff Members</h3>
                    <div style="font-size: 36px; font-weight: bold; margin: 15px 0; color: #fd7e14;">
                        <?php echo $staff_count; ?>
                    </div>
                    <a href="staff.php" class="btn" style="background-color: #fd7e14; color: white;">Manage Staff</a>
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <h3 style="color: #17a2b8;">Brands</h3>
                    <div style="font-size: 36px; font-weight: bold; margin: 15px 0; color: #17a2b8;">
                        6
                    </div>
                    <a href="brands.php" class="btn" style="background-color: #17a2b8; color: white;">Manage Brands</a>
                </div>
            </div>
        </div>

        <h2 style="margin-top: 40px; margin-bottom: 20px;">Recent Orders</h2>
        <table>
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($recent_orders as $order): ?>
                    <tr>
                        <td>#<?php echo $order['id']; ?></td>
                        <td><?php echo htmlspecialchars($order['customer_name']); ?></td>
                        <td>$<?php echo number_format($order['total_amount'], 2); ?></td>
                        <td>
                            <span style="padding: 5px 10px; border-radius: 20px; font-size: 12px; background-color: 
                                <?php echo ($order['status'] === 'completed') ? '#d4edda' : (($order['status'] === 'pending') ? '#fff3cd' : '#f8d7da'); ?>; 
                                color: 
                                <?php echo ($order['status'] === 'completed') ? '#155724' : (($order['status'] === 'pending') ? '#856404' : '#721c24'); ?>;">
                                <?php echo ucfirst($order['status']); ?>
                            </span>
                        </td>
                        <td><?php echo date('M d, Y', strtotime($order['created_at'])); ?></td>
                        <td>
                            <a href="orders.php?view=<?php echo $order['id']; ?>" class="btn btn-primary" style="padding: 5px 10px; font-size: 12px;">View</a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</body>
</html>

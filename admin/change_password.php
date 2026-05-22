<?php
session_start();

if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}

include '../includes/db.php';

$message = '';
$error = '';

// Handle password change
if (isset($_POST['change_password'])) {
    $current_password = $_POST['current_password'];
    $new_password = $_POST['new_password'];
    $confirm_password = $_POST['confirm_password'];
    $admin_id = intval($_SESSION['admin_id']);
    
    // Get current admin password
    $result = $conn->query("SELECT password FROM admins WHERE id=$admin_id");
    $admin = $result->fetch_assoc();
    
    // Verify current password
    $password_match = false;
    if (password_verify($current_password, $admin['password'])) {
        $password_match = true;
    } elseif ($current_password === 'admin123' && $_SESSION['admin_username'] === 'admin') {
        // Demo password fallback for admin
        $password_match = true;
    } elseif ($current_password === 'staff123' && $_SESSION['admin_username'] === 'staff1') {
        // Demo password fallback for staff
        $password_match = true;
    }
    
    if (!$password_match) {
        $error = 'Current password is incorrect!';
    } else if (empty($new_password) || empty($confirm_password)) {
        $error = 'All fields are required!';
    } else if (strlen($new_password) < 6) {
        $error = 'New password must be at least 6 characters!';
    } else if ($new_password !== $confirm_password) {
        $error = 'Passwords do not match!';
    } else {
        // Update password
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
        $conn->query("UPDATE admins SET password='$hashed_password' WHERE id=$admin_id");
        $message = '<div class="alert alert-success">Password changed successfully!</div>';
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Change Password - Elyoo Mobile</title>
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
            <li><a href="orders.php">Orders</a></li>
            <li><a href="change_password.php" class="active">Change Password</a></li>
            <li><a href="logout.php" onclick="return confirm('Are you sure you want to logout?');">Logout</a></li>
        </ul>
    </div>

    <div class="admin-content">
        <h1>Change Password</h1>

        <?php echo $message . $error; ?>

        <div style="max-width: 500px;">
            <div class="card">
                <div class="card-body" style="padding: 30px;">
                    <form method="POST">
                        <div class="form-group">
                            <label>Current Password *</label>
                            <input type="password" name="current_password" required>
                        </div>

                        <div class="form-group">
                            <label>New Password *</label>
                            <input type="password" name="new_password" required placeholder="Min 6 characters">
                        </div>

                        <div class="form-group">
                            <label>Confirm New Password *</label>
                            <input type="password" name="confirm_password" required placeholder="Re-enter new password">
                        </div>

                        <button type="submit" name="change_password" class="btn btn-primary btn-block">
                            Change Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</body>
</html>

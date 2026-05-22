<?php
session_start();

if (!isset($_SESSION['admin_id']) || !isset($_SESSION['force_password_reset']) || $_SESSION['force_password_reset'] !== true) {
    header("Location: login.php");
    exit;
}

include '../includes/db.php';

$error = '';
$success = '';

if (isset($_POST['set_password'])) {
    $new_password = $_POST['new_password'];
    $confirm_password = $_POST['confirm_password'];
    
    if (empty($new_password) || empty($confirm_password)) {
        $error = 'All fields are required!';
    } else if (strlen($new_password) < 6) {
        $error = 'Password must be at least 6 characters!';
    } else if ($new_password !== $confirm_password) {
        $error = 'Passwords do not match!';
    } else {
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
        $admin_id = intval($_SESSION['admin_id']);
        $conn->query("UPDATE admins SET password='$hashed_password' WHERE id=$admin_id");
        
        $success = 'Password set successfully! Redirecting to dashboard...';
        unset($_SESSION['force_password_reset']);
        header("refresh:2;url=dashboard.php");
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Set New Password - Elyoo Mobile</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body style="background: linear-gradient(135deg, #0a0e27 0%, #0f1a35 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center;">
    <div class="login-container">
        <h2>Set New Password</h2>
        
        <div style="background-color: #e3f2fd; padding: 12px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2196F3;">
            <p style="color: #1e293b; margin: 0; font-size: 14px;">
                <strong>Your password has been reset by the admin.</strong><br>
                Please set a new password to continue.
            </p>
        </div>

        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <?php if ($success): ?>
            <div class="alert alert-success"><?php echo htmlspecialchars($success); ?></div>
        <?php else: ?>
        <form method="POST">
            <div class="form-group">
                <label>New Password *</label>
                <input type="password" name="new_password" required placeholder="Min 6 characters">
            </div>

            <div class="form-group">
                <label>Confirm Password *</label>
                <input type="password" name="confirm_password" required placeholder="Re-enter password">
            </div>

            <button type="submit" name="set_password" class="btn btn-primary btn-block">
                Set Password
            </button>
        </form>
        <?php endif; ?>
    </div>
</body>
</html>

<?php
session_start();

// If already logged in, redirect to dashboard
if (isset($_SESSION['admin_id'])) {
    header("Location: dashboard.php");
    exit;
}

include '../includes/db.php';

$error = '';

if (isset($_POST['login'])) {
    $username = htmlspecialchars($_POST['username']);
    $password = $_POST['password'];
    
    $result = $conn->query("SELECT * FROM admins WHERE username = '$username'");
    
    if ($result->num_rows > 0) {
        $admin = $result->fetch_assoc();
        
        // Verify password using password_verify (for hashed passwords)
        $password_match = false;
        if (password_verify($password, $admin['password'])) {
            $password_match = true;
        } elseif ($username === 'admin' && $password === 'admin123') {
            // Demo login fallback
            $password_match = true;
        } elseif ($username === 'staff1' && $password === 'staff123') {
            // Demo login fallback
            $password_match = true;
        }
        
        if ($password_match) {
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_username'] = $admin['username'];
            $_SESSION['admin_role'] = $admin['role'];
            header("Location: dashboard.php");
            exit;
        } else {
            $error = "Invalid credentials!";
        }
    } else {
        $error = "User not found!";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - Elyoo Mobile Devices</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body style="background-color: #f8f9fa;">
    <div class="login-container">
        <h2>Elyoo Admin Panel</h2>
        
        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo $error; ?></div>
        <?php endif; ?>

        <form method="POST">
            <div class="form-group">
                <label>Username</label>
                <input type="text" name="username" required autofocus>
            </div>

            <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" required>
            </div>

            <button type="submit" name="login" class="btn btn-primary btn-block">
                Login
            </button>
        </form>

        <div style="margin-top: 30px; padding: 15px; background-color: #e3f2fd; border-radius: 8px; border-left: 4px solid var(--primary-color); text-align: center;">
            <p style="color: #1e293b; margin: 0; font-size: 13px;">
                <strong>Default Login:</strong> Use username and password: <strong>password123</strong>
            </p>
        </div>

        <div style="text-align: center; margin-top: 20px;">
            <a href="../index.php" class="btn btn-secondary" style="display: inline-block; padding: 12px 24px; font-size: 14px; text-decoration: none; color: white; border-radius: 8px;">
                ← Back to Store
            </a>
        </div>
    </div>
</body>
</html>

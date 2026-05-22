<?php
session_start();

if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}

include '../includes/db.php';

$message = '';

// Only admins can perform these actions
if ($_SESSION['admin_role'] === 'admin') {
    // Handle add/edit staff
    if (isset($_POST['save_staff'])) {
        $username = htmlspecialchars($_POST['username']);
        $email = htmlspecialchars($_POST['email']);
        $role = htmlspecialchars($_POST['role']);
        $staff_id = isset($_POST['staff_id']) ? intval($_POST['staff_id']) : 0;

        if (empty($username) || empty($email)) {
            $message = '<div class="alert alert-danger">Username and email are required!</div>';
        } else {
            if ($staff_id > 0) {
                $conn->query("UPDATE admins SET username='$username', email='$email', role='$role' WHERE id=$staff_id");
                $message = '<div class="alert alert-success">Staff updated successfully!</div>';
            } else {
                // Check if username exists
                $check = $conn->query("SELECT id FROM admins WHERE username='$username'")->num_rows;
                if ($check > 0) {
                    $message = '<div class="alert alert-danger">Username already exists!</div>';
                } else {
                    // Get password from form or use default
                    $password_input = isset($_POST['password']) && !empty($_POST['password']) ? htmlspecialchars($_POST['password']) : 'password123';
                    if (strlen($password_input) < 6) {
                        $message = '<div class="alert alert-danger">Password must be at least 6 characters!</div>';
                    } else {
                        $password = password_hash($password_input, PASSWORD_DEFAULT);
                        $conn->query("INSERT INTO admins (username, email, role, password) 
                                   VALUES ('$username', '$email', '$role', '$password')");
                        $message = '<div class="alert alert-success">Staff added successfully!</div>';
                    }
                }
            }
        }
    }

    // Handle reset password
    if (isset($_GET['reset_password'])) {
        $staff_id = intval($_GET['reset_password']);
        if ($staff_id != $_SESSION['admin_id']) { // Don't allow resetting own password this way
            $default_password = password_hash('password123', PASSWORD_DEFAULT);
            $conn->query("UPDATE admins SET password='$default_password' WHERE id=$staff_id AND role='staff'");
            $_SESSION['message'] = '<div class="alert alert-success">Password reset to default! Staff can login with username and password: password123</div>';
            header("Location: staff.php");
            exit;
        }
    }

    // Handle delete staff
    if (isset($_GET['delete'])) {
        $staff_id = intval($_GET['delete']);
        if ($staff_id != $_SESSION['admin_id']) { // Don't allow deleting self
            $conn->query("DELETE FROM admins WHERE id=$staff_id AND role='staff'");
            header("Location: staff.php");
            exit;
        }
    }

    // Get staff to edit
    $edit_staff = null;
    if (isset($_GET['edit'])) {
        $staff_id = intval($_GET['edit']);
        $result = $conn->query("SELECT id, username, email, role FROM admins WHERE id=$staff_id");
        $edit_staff = $result->fetch_assoc();
    }
}

// Get all staff
$staff = $conn->query("SELECT id, username, email, role, created_at FROM admins WHERE role = 'staff' ORDER BY created_at DESC")->fetch_all(MYSQLI_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php if ($_SESSION['admin_role'] === 'admin'): ?>
            <title>Staff Management - Elyoo Mobile</title>
            <link rel="stylesheet" href="../css/style.css">
    <?php else: ?>
            <title>Staff Management - Elyoo Mobile</title>
            <link rel="stylesheet" href="../css/style.css">
    <?php endif; ?>
</head>
<body>
    <div class="sidebar">
        <h2><?php echo ($_SESSION['admin_role'] === 'admin') ? 'Elyoo Admin Panel' : 'Elyoo Staff Panel'; ?></h2>
        <ul class="sidebar-menu">
            <li><a href="dashboard.php">Dashboard</a></li>
            <li><a href="products.php">Products</a></li>
            <?php if ($_SESSION['admin_role'] === 'admin'): ?>
            <li><a href="brands.php">Brands</a></li>
            <?php endif; ?>
            <li><a href="staff.php" class="active">Staff</a></li>
            <li><a href="orders.php">Orders</a></li>
            <li><a href="change_password.php">Change Password</a></li>
            <li><a href="logout.php" onclick="return confirm('Are you sure you want to logout?');">Logout</a></li>
        </ul>
    </div>

    <div class="admin-content">
        <h1><?php if ($_SESSION['admin_role'] === 'admin'): echo isset($edit_staff) ? 'Edit Staff Member' : 'Add New Staff'; else: echo 'Staff Members'; endif; ?></h1>

        <?php 
        echo $message;
        if (isset($_SESSION['message'])) {
            echo $_SESSION['message'];
            unset($_SESSION['message']);
        }
        ?>

        <?php if ($_SESSION['admin_role'] === 'admin'): ?>
        <div style="max-width: 900px;">
            <!-- Form -->
            <form method="POST">
                <input type="hidden" name="role" value="staff">

                <div class="form-group">
                    <label>Username *</label>
                    <input type="text" name="username" required value="<?php echo isset($edit_staff) ? htmlspecialchars($edit_staff['username']) : ''; ?>">
                </div>

                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" required value="<?php echo isset($edit_staff) ? htmlspecialchars($edit_staff['email']) : ''; ?>">
                </div>

                <?php if (!isset($edit_staff)): ?>
                <div class="form-group">
                    <label>Password *</label>
                    <input type="password" name="password" placeholder="Enter password (min 6 characters)" value="">
                    <small style="color: #666; display: block; margin-top: 5px;">Leave empty to use default: password123</small>
                </div>
                <div style="background-color: #f0f0f0; padding: 10px; border-radius: 4px; margin-bottom: 15px; font-size: 12px;">
                    <strong>Note:</strong> Password will be set to your input above, or "password123" if left empty
                </div>
                <?php endif; ?>

                <button type="submit" name="save_staff" class="btn btn-success btn-block">
                    <?php echo isset($edit_staff) ? 'Update Staff' : 'Add Staff'; ?>
                </button>

                <?php if (isset($edit_staff)): ?>
                    <a href="staff.php" class="btn btn-secondary btn-block" style="margin-top: 10px;">Cancel</a>
                <?php endif; ?>
            </form>
        </div>
        <?php endif; ?>

        <!-- Staff List - Visible to everyone -->
        <div style="max-width: 900px;">
            <!-- Staff List -->
            <div style="margin-top: 40px;">
                <h2>Staff Members</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <?php if ($_SESSION['admin_role'] === 'admin'): ?>
                            <th>Actions</th>
                            <?php endif; ?>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($staff as $member): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($member['username']); ?></td>
                                <td><?php echo htmlspecialchars($member['email']); ?></td>
                                <td>
                                    <span style="padding: 4px 8px; border-radius: 3px; background-color: 
                                        <?php echo ($member['role'] === 'admin') ? '#cce5ff' : '#e7f3ff'; ?>; font-size: 12px; color: #1e293b; font-weight: 600;">
                                        <?php echo ucfirst($member['role']); ?>
                                    </span>
                                </td>
                                <td><?php echo date('M d, Y', strtotime($member['created_at'])); ?></td>
                                <?php if ($_SESSION['admin_role'] === 'admin'): ?>
                                <td>
                                    <a href="staff.php?edit=<?php echo $member['id']; ?>" class="btn btn-primary" 
                                       style="padding: 5px 10px; font-size: 12px;">Edit</a>
                                    <?php if ($member['id'] != $_SESSION['admin_id']): ?>
                                        <a href="staff.php?reset_password=<?php echo $member['id']; ?>" class="btn btn-warning" 
                                           style="padding: 5px 10px; font-size: 12px;" 
                                           onclick="return confirm('Reset password for this staff? They will need to set a new password on next login.');">Reset Password</a>
                                        <a href="staff.php?delete=<?php echo $member['id']; ?>" class="btn btn-danger" 
                                           style="padding: 5px 10px; font-size: 12px;" 
                                           onclick="return confirm('Are you sure?');">Delete</a>
                                    <?php endif; ?>
                                </td>
                                <?php endif; ?>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>

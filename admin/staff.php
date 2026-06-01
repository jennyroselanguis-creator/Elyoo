<?php
session_start();

if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}

include '../includes/db.php';
require_once '../includes/supabase.php';

$message = '';

// Only admins can perform these actions
if ($_SESSION['admin_role'] === 'admin') {
    // Handle add/edit staff
    if (isset($_POST['save_staff'])) {
        $username = htmlspecialchars($_POST['username']);
        $email = htmlspecialchars($_POST['email']);
        $staff_id = isset($_POST['staff_id']) ? intval($_POST['staff_id']) : 0;

        // Ensure role cannot be elevated via form tampering.
        if ($staff_id > 0) {
            $r = $conn->query("SELECT role FROM admins WHERE id=$staff_id");
            $row = $r ? $r->fetch_assoc() : null;
            $role = $row['role'] ?? 'staff';
        } else {
            // New accounts created from this page are always staff
            $role = 'staff';
        }

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
                        $insert_id = $conn->insert_id;

                        // Try to create the user in Supabase when available and service role key is configured
                        if (defined('USE_SUPABASE') && USE_SUPABASE) {
                            $serviceKey = getenv('SUPABASE_SERVICE_ROLE_KEY') ?: ($_ENV['SUPABASE_SERVICE_ROLE_KEY'] ?? '');
                            if (!empty($serviceKey)) {
                                try {
                                    $client = new SupabaseClient();
                                    $supResp = $client->adminCreateUser($email, $password_input, $username, 'staff');
                                    if (isset($supResp['error'])) {
                                        $message = '<div class="alert alert-warning">Staff added locally, but Supabase: ' . htmlspecialchars($supResp['error']) . '</div>';
                                    } else {
                                        $message = '<div class="alert alert-success">Staff added successfully and synced to Supabase!</div>';
                                    }
                                } catch (Exception $e) {
                                    $message = '<div class="alert alert-warning">Staff added locally, but Supabase error: ' . htmlspecialchars($e->getMessage()) . '</div>';
                                }
                            } else {
                                $message = '<div class="alert alert-success">Staff added locally (Supabase service key not configured).</div>';
                            }
                        } else {
                            $message = '<div class="alert alert-success">Staff added successfully!</div>';
                        }
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
$staff = $conn->query("SELECT id, username, email, role, created_at FROM admins ORDER BY created_at DESC")->fetch_all(MYSQLI_ASSOC);

// Also load recent orders to display on this page (prefer Supabase if configured)
$orders = [];
if (defined('USE_SUPABASE') && USE_SUPABASE) {
    try {
        $backendUrl = 'http://localhost:3001/api/supabase/orders';
        $ch = curl_init($backendUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [ 'Content-Type: application/json' ],
            CURLOPT_TIMEOUT => 15,
        ]);
        $resp = curl_exec($ch);
        $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($resp !== false && $http < 400) {
            $rows = json_decode($resp, true);
            if (is_array($rows)) {
                $orders = $rows;
            }
        }
    } catch (Exception $e) {
        $orders = [];
    }
}

// Fallback to local DB if no supabase rows
if (empty($orders)) {
    try {
        $orders = $conn->query("SELECT id, order_number, customer_name, customer_email, total_amount, status, created_at FROM orders ORDER BY created_at DESC")->fetch_all(MYSQLI_ASSOC);
    } catch (Exception $e) {
        $orders = [];
    }
}

// Group orders by status for display
$orders_by_status = [];
foreach ($orders as $o) {
    $st = isset($o['status']) && $o['status'] !== '' ? $o['status'] : 'pending';
    if (!isset($orders_by_status[$st])) $orders_by_status[$st] = [];
    $orders_by_status[$st][] = $o;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff Management - Elyoo Mobile</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <div class="sidebar">
        <h2>Elyoo Admin Panel</h2>
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
            <div class="card">
                <div class="card-body" style="padding: 30px;">
                    <form method="POST">
                        <?php if ($edit_staff): ?>
                            <input type="hidden" name="staff_id" value="<?php echo $edit_staff['id']; ?>">
                        <?php endif; ?>

                        <div class="form-group">
                            <label>Username *</label>
                            <input type="text" name="username" required 
                                   value="<?php echo isset($edit_staff) ? htmlspecialchars($edit_staff['username']) : ''; ?>">
                        </div>

                        <div class="form-group">
                            <label>Email *</label>
                            <input type="email" name="email" required 
                                   value="<?php echo isset($edit_staff) ? htmlspecialchars($edit_staff['email']) : ''; ?>">
                        </div>

                        <input type="hidden" name="role" value="staff">

                        <?php if (!isset($edit_staff)): ?>
                        <div class="form-group">
                            <label>Password *</label>
                            <input type="password" name="password" placeholder="Enter password (min 6 characters)" value="">
                            <small style="color: #666; display: block; margin-top: 5px;">Leave empty to use default: password123</small>
                        </div>
                        <?php endif; ?>

                        <?php if (!isset($edit_staff)): ?>
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
            </div>
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
        
                <!-- Orders List - grouped by status -->
                <div style="max-width: 900px; margin-top: 40px;">
                    <h2>Orders by Status</h2>
                    <?php
                    $statusOrder = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'cancelled_by_user'];
                    foreach ($statusOrder as $st):
                        if (!isset($orders_by_status[$st]) || empty($orders_by_status[$st])) continue;
                    ?>
                        <div style="margin-top: 20px;">
                            <h3 style="margin-bottom:10px; text-transform: capitalize;"><?php echo htmlspecialchars($st); ?> (<?php echo count($orders_by_status[$st]); ?>)</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order #</th>
                                        <th>Customer</th>
                                        <th>Email</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                        <?php if ($_SESSION['admin_role'] === 'admin'): ?>
                                        <th>Actions</th>
                                        <?php endif; ?>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($orders_by_status[$st] as $o): ?>
                                        <tr>
                                            <td>#<?php echo htmlspecialchars($o['order_number'] ?? $o['id']); ?></td>
                                            <td><?php echo htmlspecialchars($o['customer_name'] ?? ($o['name'] ?? '')); ?></td>
                                            <td><?php echo htmlspecialchars($o['customer_email'] ?? ($o['email'] ?? '')); ?></td>
                                            <td>₱<?php echo number_format(floatval($o['total_amount'] ?? 0), 2); ?></td>
                                            <td><?php echo date('M d, Y', strtotime($o['created_at'] ?? ($o['created_at'] ?? ''))); ?></td>
                                            <?php if ($_SESSION['admin_role'] === 'admin'): ?>
                                            <td>
                                                <a href="orders.php?view=<?php echo intval($o['id'] ?? 0); ?>" class="btn btn-primary" style="padding: 5px 10px; font-size: 12px;">View</a>
                                            </td>
                                            <?php endif; ?>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php endforeach; ?>
                </div>
    </div>
</body>
</html>

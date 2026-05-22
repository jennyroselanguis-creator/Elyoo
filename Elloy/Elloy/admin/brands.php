<?php
session_start();
include '../includes/db.php';
// ...existing code...
// The sidebar and all HTML output should be inside the HTML section below, not here.
// ...existing code...

// Only allow admin to delete brands
if (isset($_GET['delete']) && isset($_SESSION['admin_role']) && $_SESSION['admin_role'] === 'admin') {
    $brand_id = intval($_GET['delete']);
    $conn->query("DELETE FROM brands WHERE id=$brand_id");
    header("Location: brands.php");
    exit;
}

// Get brand to edit
$edit_brand = null;
if (isset($_GET['edit'])) {
    $brand_id = intval($_GET['edit']);
    $result = $conn->query("SELECT * FROM brands WHERE id=$brand_id");
    $edit_brand = $result->fetch_assoc();
}

// Get all brands
$brands = $conn->query("SELECT b.*, COUNT(p.id) as product_count FROM brands b 
                       LEFT JOIN products p ON b.id = p.brand_id 
                       GROUP BY b.id ORDER BY b.name")->fetch_all(MYSQLI_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Brands Management - Elyoo Mobile</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
<?php if (!isset($_SESSION['admin_role']) || $_SESSION['admin_role'] !== 'admin'): ?>
    <div class="alert alert-danger" style="margin: 30px;">You do not have permission to manage brands.</div>
    <?php exit; ?>
<?php else: ?>
    <div class="sidebar">
        <h2><?php echo ($_SESSION['admin_role'] === 'admin') ? 'Elyoo Admin Panel' : 'Elyoo Staff Panel'; ?></h2>
        <ul class="sidebar-menu">
            <li><a href="dashboard.php">Dashboard</a></li>
            <li><a href="products.php">Products</a></li>
            <?php if ($_SESSION['admin_role'] === 'admin'): ?>
            <li><a href="brands.php" class="active">Brands</a></li>
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
        <h1><?php echo isset($edit_brand) ? 'Edit Brand' : 'Add New Brand'; ?></h1>

        <?php echo isset($message) ? $message : ''; ?>

        <div style="max-width: 900px;">
            <!-- Form -->
            <?php if (isset($_SESSION['admin_role']) && $_SESSION['admin_role'] === 'admin'): ?>
            <div class="card">
                <div class="card-body" style="padding: 30px;">
                    <form method="POST">
                        <?php if ($edit_brand): ?>
                            <input type="hidden" name="brand_id" value="<?php echo $edit_brand['id']; ?>">
                        <?php endif; ?>

                        <div class="form-group">
                            <label>Brand Name *</label>
                            <input type="text" name="name" required 
                                   value="<?php echo isset($edit_brand) ? htmlspecialchars($edit_brand['name']) : ''; ?>">
                        </div>

                        <div class="form-group">
                            <label>Description</label>
                            <textarea name="description"><?php echo isset($edit_brand) ? htmlspecialchars($edit_brand['description']) : ''; ?></textarea>
                        </div>

                        <button type="submit" name="save_brand" class="btn btn-success btn-block">
                            <?php echo isset($edit_brand) ? 'Update Brand' : 'Add Brand'; ?>
                        </button>

                        <?php if (isset($edit_brand)): ?>
                            <a href="brands.php" class="btn btn-secondary btn-block" style="margin-top: 10px;">Cancel</a>
                        <?php endif; ?>
                    </form>
                </div>
            </div>
            <?php endif; ?>

            <!-- Brands List -->
            <div style="margin-top: 40px;">
                <h2>Brands List</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Products</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($brands as $brand): ?>
                            <tr>
                                <td><strong><?php echo htmlspecialchars($brand['name']); ?></strong></td>
                                <td><?php echo strlen($brand['description']) > 50 ? substr(htmlspecialchars($brand['description']), 0, 50) . '...' : htmlspecialchars($brand['description']); ?></td>
                                <td><?php echo $brand['product_count']; ?></td>
                                <td>
                                    <a href="brands.php?edit=<?php echo $brand['id']; ?>" class="btn btn-primary" 
                                       style="padding: 5px 10px; font-size: 12px;">Edit</a>
                                    <a href="brands.php?delete=<?php echo $brand['id']; ?>" class="btn btn-danger" 
                                       style="padding: 5px 10px; font-size: 12px;" 
                                       onclick="return confirm('Are you sure? This will delete the brand.');">Delete</a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
<?php endif; ?>
</html>

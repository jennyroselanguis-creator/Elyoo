<?php
session_start();

if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}

include '../includes/db.php';

// Handle add/edit product
$message = '';
if (isset($_POST['save_product'])) {
    $brand_id = intval($_POST['brand_id']);
    $name = htmlspecialchars($_POST['name']);
    $model = htmlspecialchars($_POST['model']);
    $description = htmlspecialchars($_POST['description']);
    $price = floatval($_POST['price']);
    $stock = intval($_POST['stock']);
    $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;

    if (empty($name) || $price <= 0 || $stock < 0) {
        $message = '<div class="alert alert-danger">Invalid input!</div>';
    } else {
        if ($product_id > 0) {
            // Update
            $conn->query("UPDATE products SET brand_id=$brand_id, name='$name', model='$model', 
                         description='$description', price=$price, stock=$stock WHERE id=$product_id");
            $message = '<div class="alert alert-success">Product updated successfully!</div>';
        } else {
            // Insert
            $conn->query("INSERT INTO products (brand_id, name, model, description, price, stock) 
                         VALUES ($brand_id, '$name', '$model', '$description', $price, $stock)");
            $message = '<div class="alert alert-success">Product added successfully!</div>';
        }
    }
}

// Handle delete product
if (isset($_GET['delete'])) {
    $product_id = intval($_GET['delete']);
    $conn->query("DELETE FROM products WHERE id=$product_id");
    header("Location: products.php");
    exit;
}

// Get product to edit
$edit_product = null;
if (isset($_GET['edit'])) {
    $product_id = intval($_GET['edit']);
    $result = $conn->query("SELECT * FROM products WHERE id=$product_id");
    $edit_product = $result->fetch_assoc();
}

// Get all brands
$brands = $conn->query("SELECT * FROM brands ORDER BY name")->fetch_all(MYSQLI_ASSOC);

// Get all products
$products = $conn->query("SELECT p.*, b.name as brand_name FROM products p 
                         JOIN brands b ON p.brand_id = b.id ORDER BY p.created_at DESC")->fetch_all(MYSQLI_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products Management - Elyoo Mobile</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <div class="sidebar">
        <h2>Elyoo Admin Panel</h2>
        <ul class="sidebar-menu">
            <li><a href="dashboard.php">Dashboard</a></li>
            <li><a href="products.php" class="active">Products</a></li>
            <?php if ($_SESSION['admin_role'] === 'admin'): ?>
            <li><a href="brands.php">Brands</a></li>
            <?php endif; ?>
            <li><a href="staff.php">Staff</a></li>
            <li><a href="orders.php">Orders</a></li>
            <li><a href="change_password.php">Change Password</a></li>
            <li><a href="logout.php" onclick="return confirm('Are you sure you want to logout?');">Logout</a></li>
        </ul>
    </div>

    <div class="admin-content">
        <h1><?php echo isset($edit_product) ? 'Edit Product' : 'Add New Product'; ?></h1>

        <?php echo $message; ?>

        <div style="max-width: 900px;">
            <!-- Form -->
            <div class="card">
                <div class="card-body" style="padding: 30px;">
                    <form method="POST">
                        <?php if ($edit_product): ?>
                            <input type="hidden" name="product_id" value="<?php echo $edit_product['id']; ?>">
                        <?php endif; ?>

                        <div class="form-group">
                            <label>Brand *</label>
                            <select name="brand_id" class="brand-select" required>
                                <option value="">Select Brand</option>
                                <?php foreach ($brands as $brand): ?>
                                    <option value="<?php echo $brand['id']; ?>" 
                                            <?php echo (isset($edit_product) && $edit_product['brand_id'] == $brand['id']) ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($brand['name']); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Product Name *</label>
                            <input type="text" name="name" required 
                                   value="<?php echo isset($edit_product) ? htmlspecialchars($edit_product['name']) : ''; ?>">
                        </div>

                        <div class="form-group">
                            <label>Model</label>
                            <input type="text" name="model" 
                                   value="<?php echo isset($edit_product) ? htmlspecialchars($edit_product['model']) : ''; ?>">
                        </div>

                        <div class="form-group">
                            <label>Description</label>
                            <textarea name="description"><?php echo isset($edit_product) ? htmlspecialchars($edit_product['description']) : ''; ?></textarea>
                        </div>

                        <div class="form-group">
                            <label>Price (₱) *</label>
                            <input type="number" name="price" step="0.01" required 
                                   value="<?php echo isset($edit_product) ? $edit_product['price'] : ''; ?>">
                        </div>

                        <div class="form-group">
                            <label>Stock Quantity *</label>
                            <input type="number" name="stock" min="0" required 
                                   value="<?php echo isset($edit_product) ? $edit_product['stock'] : '0'; ?>">
                        </div>

                        <button type="submit" name="save_product" class="btn btn-success btn-block">
                            <?php echo isset($edit_product) ? 'Update Product' : 'Add Product'; ?>
                        </button>

                        <?php if (isset($edit_product)): ?>
                            <a href="products.php" class="btn btn-secondary btn-block" style="margin-top: 10px;">Cancel</a>
                        <?php endif; ?>
                    </form>
                </div>
            </div>

            <!-- Products List -->
            <div style="margin-top: 40px;">
                <h2>Products List</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Brand</th>
                            <th>Model</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($products as $product): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($product['name']); ?></td>
                                <td><?php echo htmlspecialchars($product['brand_name']); ?></td>
                                <td><?php echo htmlspecialchars($product['model']); ?></td>
                                <td>₱<?php echo number_format($product['price'], 2); ?></td>
                                <td><?php echo $product['stock']; ?></td>
                                <td>
                                    <a href="products.php?edit=<?php echo $product['id']; ?>" class="btn btn-primary" 
                                       style="padding: 5px 10px; font-size: 12px;">Edit</a>
                                    <a href="products.php?delete=<?php echo $product['id']; ?>" class="btn btn-danger" 
                                       style="padding: 5px 10px; font-size: 12px;" 
                                       onclick="return confirm('Are you sure?');">Delete</a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>

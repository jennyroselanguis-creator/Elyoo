<?php
/**
 * Database Setup Helper
 * This file helps import the database schema if not already done
 */

session_start();

$setup_complete = false;
$error_message = '';
$success_message = '';

// Check if database exists
$localhost = 'localhost';
$username = 'root';
$password = '';

$connection = new mysqli($localhost, $username, $password);

if ($connection->connect_error) {
    $error_message = "Cannot connect to MySQL: " . $connection->connect_error;
} else {
    // Handle reset database request
    if (isset($_POST['reset_database'])) {
        // Drop existing database
        if ($connection->query("DROP DATABASE IF EXISTS cellphone_store")) {
            // Recreate database by importing SQL file
            $sql_file = file_get_contents('database.sql');
            $statements = array_filter(array_map('trim', explode(';', $sql_file)));
            
            $errors = [];
            foreach ($statements as $statement) {
                if (!empty($statement)) {
                    if (!$connection->multi_query($statement . ";")) {
                        $errors[] = $connection->error;
                    }
                }
            }
            
            if (empty($errors)) {
                $setup_complete = true;
                $success_message = "Database reset and recreated successfully with all new products!";
            } else {
                $error_message = "Reset errors: " . implode(", ", $errors);
            }
        } else {
            $error_message = "Failed to drop existing database: " . $connection->error;
        }
    }
    
    // Check if database exists
    $db_check = $connection->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'cellphone_store'");
    
    if ($db_check && $db_check->num_rows > 0 && !$setup_complete) {
        $setup_complete = true;
        if (!$success_message) {
            $success_message = "Database 'cellphone_store' already exists!";
        }
    } else if (!$setup_complete) {
        if (isset($_POST['setup_database'])) {
            // Read and execute SQL file
            $sql_file = file_get_contents('database.sql');
            
            // Split by semicolon and execute each statement
            $statements = array_filter(array_map('trim', explode(';', $sql_file)));
            
            $errors = [];
            foreach ($statements as $statement) {
                if (!empty($statement)) {
                    if (!$connection->multi_query($statement . ";")) {
                        $errors[] = $connection->error;
                    }
                }
            }
            
            if (empty($errors)) {
                $setup_complete = true;
                $success_message = "Database setup completed successfully!";
            } else {
                $error_message = "Setup errors: " . implode(", ", $errors);
            }
        }
    }
}

$connection->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cellphone Store - Setup</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body style="background-color: #f8f9fa;">
    <div class="container" style="max-width: 600px; margin: 50px auto;">
        <div class="card">
            <div class="card-body">
                <h1 style="text-align: center; color: var(--primary-color); margin-bottom: 20px;">
                    🛠️ Cellphone Store Setup
                </h1>

                <?php if ($error_message): ?>
                    <div class="alert alert-danger">
                        <?php echo $error_message; ?>
                    </div>
                <?php endif; ?>

                <?php if ($success_message): ?>
                    <div class="alert alert-success">
                        <?php echo $success_message; ?>
                    </div>
                <?php endif; ?>

                <?php if ($setup_complete): ?>
                    <div style="text-align: center; padding: 20px;">
                        <h2 style="color: var(--success-color);">✓ Setup Complete!</h2>
                        <p style="margin: 20px 0;">Your cellphone store database is ready to use.</p>
                        
                        <h3>Next Steps:</h3>
                        <ol style="text-align: left; display: inline-block;">
                            <li>
                                <a href="index.php" style="color: var(--primary-color); font-weight: bold;">Visit the Store</a>
                                - Browse and purchase cellphones
                            </li>
                            <li>
                                <a href="admin/" style="color: var(--primary-color); font-weight: bold;">Admin Panel</a>
                                - Manage products, orders, and staff
                            </li>
                        </ol>

                        <div style="background-color: #1a2847; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: left; border-left: 4px solid var(--primary-color);">
                            <h4 style="color: var(--primary-color); margin-bottom: 12px;">Demo Credentials:</h4>
                            <p style="color: #e2e8f0; margin: 8px 0;"><strong>Admin:</strong> admin / admin123</p>
                            <p style="color: #e2e8f0; margin: 8px 0;"><strong>Staff:</strong> staff1 / staff123</p>
                        </div>

                        <hr style="margin: 25px 0; border: none; border-top: 2px solid var(--border-color);">

                        <div style="text-align: center;">
                            <p style="margin-bottom: 15px; color: #666; font-size: 14px;">
                                Want to reset the database and reload with updated products?
                            </p>
                            <form method="POST" style="display: inline;">
                                <button type="submit" name="reset_database" class="btn btn-danger" 
                                        style="padding: 12px 24px;" 
                                        onclick="return confirm('⚠️ This will DELETE all existing data and recreate the database. Are you sure?');">
                                    🔄 Reset & Reload Database
                                </button>
                            </form>
                        </div>
                    </div>
                <?php else: ?>
                    <form method="POST">
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
                            <strong>⚠️ Setup Required</strong>
                            <p>This will create the database and tables for the cellphone store.</p>
                        </div>

                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                            <h4>Prerequisites:</h4>
                            <ul style="margin-bottom: 0;">
                                <li>XAMPP is running (Apache + MySQL)</li>
                                <li>MySQL user 'root' with no password</li>
                                <li>database.sql file exists in project root</li>
                            </ul>
                        </div>

                        <button type="submit" name="setup_database" class="btn btn-success btn-block" 
                                style="padding: 15px; font-size: 16px; font-weight: bold;">
                            Create Database & Tables
                        </button>

                        <p style="text-align: center; margin-top: 15px; color: #666;">
                            Or manually import <code>database.sql</code> via PhpMyAdmin
                        </p>
                    </form>
                <?php endif; ?>
            </div>
        </div>

        <!-- Products Management Section -->
        <div class="card" style="margin-top: 30px;">
            <div class="card-body">
                <h2 style="color: var(--primary-color); margin-bottom: 20px; font-family: 'Poppins', sans-serif; font-size: 24px; font-weight: 700;">
                    📦 Manage Products
                </h2>

                <p style="margin-bottom: 20px; color: #666;">Learn how to add, edit, and manage cellphone products in two ways:</p>

                <!-- Method 1: Admin Panel -->
                <div style="background-color: #ecf9ff; padding: 20px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #06b6d4;">
                    <h3 style="color: #06b6d4; margin-bottom: 15px; font-family: 'Poppins', sans-serif; font-weight: 600;">
                        ✨ Method 1: Admin Panel (Easiest)
                    </h3>
                    
                    <ol style="margin-left: 20px; line-height: 1.8; color: #333;">
                        <li><strong>Login to Admin:</strong> Go to <a href="admin/login.php" style="color: #06b6d4; font-weight: 600;" target="_blank">Admin Panel</a></li>
                        <li><strong>Credentials:</strong>
                            <ul style="margin: 8px 0 8px 20px;">
                                <li>Username: <code style="background: #fff; padding: 3px 8px; border-radius: 4px;">admin</code></li>
                                <li>Password: <code style="background: #fff; padding: 3px 8px; border-radius: 4px;">admin123</code></li>
                            </ul>
                        </li>
                        <li><strong>Navigate to Products:</strong> Click "Products" in the sidebar menu</li>
                        <li><strong>Add New Product:</strong> 
                            <ul style="margin: 8px 0 8px 20px; font-family: monospace; font-size: 13px;">
                                <li>Brand: Select from dropdown</li>
                                <li>Product Name: e.g., "iPhone 16 Pro"</li>
                                <li>Model: e.g., "A18 Pro"</li>
                                <li>Description: Add details about the phone</li>
                                <li>Price: Enter in dollars (e.g., 999.99)</li>
                                <li>Stock Quantity: Number available</li>
                            </ul>
                        </li>
                        <li><strong>Click "Add Product"</strong> button to save</li>
                    </ol>

                    <div style="background: #fff; padding: 12px; border-radius: 8px; margin-top: 15px; border: 1px solid #cff0f9;">
                        <strong>✅ Advantages:</strong>
                        <ul style="margin: 8px 0 0 20px; color: #0c5460;">
                            <li>User-friendly interface</li>
                            <li>No SQL knowledge needed</li>
                            <li>Easy to edit later</li>
                            <li>Real-time validation</li>
                        </ul>
                    </div>
                </div>

                <!-- Method 2: Direct Database Insert -->
                <div style="background-color: #fef2f2; padding: 20px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #ef4444;">
                    <h3 style="color: #ef4444; margin-bottom: 15px; font-family: 'Poppins', sans-serif; font-weight: 600;">
                        ⚡ Method 2: Direct Database Insert (Advanced)
                    </h3>

                    <ol style="margin-left: 20px; line-height: 1.8; color: #333;">
                        <li><strong>Open PhpMyAdmin:</strong> <a href="http://localhost/phpmyadmin" style="color: #ef4444; font-weight: 600;" target="_blank">PhpMyAdmin</a></li>
                        <li><strong>Select Database:</strong> Click on "cellphone_store"</li>
                        <li><strong>Open Products Table:</strong> Click on "products" table</li>
                        <li><strong>Insert New Row:</strong> Click "Insert" tab</li>
                        <li><strong>Fill in the fields:</strong>
                            <table style="width: 100%; margin: 10px 0; border-collapse: collapse; font-size: 12px;">
                                <tr style="background: #fce4ec;">
                                    <th style="padding: 8px; border: 1px solid #fbcfe8; text-align: left;"><strong>Field</strong></th>
                                    <th style="padding: 8px; border: 1px solid #fbcfe8; text-align: left;"><strong>Example Value</strong></th>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; border: 1px solid #fbcfe8;"><code>brand_id</code></td>
                                    <td style="padding: 8px; border: 1px solid #fbcfe8;">1 (for Apple)</td>
                                </tr>
                                <tr style="background: #fff5f5;">
                                    <td style="padding: 8px; border: 1px solid #fbcfe8;"><code>name</code></td>
                                    <td style="padding: 8px; border: 1px solid #fbcfe8;">iPhone 16 Pro Max</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; border: 1px solid #fbcfe8;"><code>model</code></td>
                                    <td style="padding: 8px; border: 1px solid #fbcfe8;">A18 Pro</td>
                                </tr>
                                <tr style="background: #fff5f5;">
                                    <td style="padding: 8px; border: 1px solid #fbcfe8;"><code>description</code></td>
                                    <td style="padding: 8px; border: 1px solid #fbcfe8;">Premium flagship with advanced features</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; border: 1px solid #fbcfe8;"><code>price</code></td>
                                    <td style="padding: 8px; border: 1px solid #fbcfe8;">1199.99</td>
                                </tr>
                                <tr style="background: #fff5f5;">
                                    <td style="padding: 8px; border: 1px solid #fbcfe8;"><code>stock</code></td>
                                    <td style="padding: 8px; border: 1px solid #fbcfe8;">20</td>
                                </tr>
                            </table>
                        </li>
                        <li><strong>Click "Go" or "Save"</strong> to insert the product</li>
                    </ol>

                    <div style="background: #fff; padding: 12px; border-radius: 8px; margin-top: 15px; border: 1px solid #fecaca;">
                        <strong>⚠️ Important Notes:</strong>
                        <ul style="margin: 8px 0 0 20px; color: #7f1d1d;">
                            <li>Brand IDs must exist in brands table (1-6)</li>
                            <li>Use decimal for prices: 999.99</li>
                            <li>Stock must be a whole number</li>
                            <li>Leave ID and timestamps empty (auto-generated)</li>
                        </ul>
                    </div>
                </div>

                <!-- SQL Insert Template -->
                <div style="background-color: #ecfdf5; padding: 20px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #10b981;">
                    <h3 style="color: #10b981; margin-bottom: 15px; font-family: 'Poppins', sans-serif; font-weight: 600;">
                        🗄️ SQL Insert Template (Copy & Paste)
                    </h3>

                    <p style="margin-bottom: 10px; color: #666; font-size: 13px;">
                        <strong>Step 1:</strong> Copy the SQL below
                    </p>

                    <textarea readonly style="width: 100%; padding: 12px; border: 2px solid #d1fae5; border-radius: 8px; font-family: monospace; font-size: 12px; height: 180px; background: #f0fdf4; color: #065f46; resize: none;">-- Insert new products into products table
INSERT INTO products (brand_id, name, model, description, price, stock) VALUES
(1, 'iPhone 16 Pro', 'A18 Pro', 'Latest Apple flagship', 999.99, 20),
(1, 'iPhone 16', 'A18', 'Standard iPhone 16', 799.99, 25),
(2, 'Samsung Galaxy S25', 'Snapdragon 8 Gen 4', 'Next gen Samsung flagship', 1099.99, 18),
(3, 'Xiaomi 15', 'Snapdragon 8 Gen 3 Leading', 'Premium Xiaomi phone', 699.99, 22),
(4, 'OnePlus 13', 'Snapdragon 8 Gen 3', 'Fast flagship killer', 799.99, 16),
(5, 'Realme 13 Pro', 'Snapdragon 7s Gen 2', 'Affordable flagship', 349.99, 20),
(6, 'OPPO Find X8', 'Snapdragon 8 Gen 3', 'Photography phone', 899.99, 15);</textarea>

                    <p style="margin: 12px 0; color: #666; font-size: 13px;">
                        <strong>Step 2:</strong> Go to PhpMyAdmin → cellphone_store → SQL tab
                    </p>

                    <p style="margin: 12px 0; color: #666; font-size: 13px;">
                        <strong>Step 3:</strong> Paste the SQL and click "Execute"
                    </p>

                    <div style="background: #fff; padding: 12px; border-radius: 8px; margin-top: 15px; border: 1px solid #a7f3d0;">
                        <strong>✅ Brand IDs Reference:</strong>
                        <ul style="margin: 8px 0 0 20px; color: #065f46; font-size: 13px;">
                            <li><strong>1</strong> = Apple</li>
                            <li><strong>2</strong> = Samsung</li>
                            <li><strong>3</strong> = Xiaomi</li>
                            <li><strong>4</strong> = OnePlus</li>
                            <li><strong>5</strong> = Realme</li>
                            <li><strong>6</strong> = OPPO</li>
                        </ul>
                    </div>
                </div>

                <!-- Quick Links -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <a href="admin/products.php" style="display: block; padding: 15px; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; text-decoration: none; border-radius: 10px; text-align: center; font-weight: 600; transition: all 0.3s;">
                        ➕ Admin Panel Products
                    </a>
                    <a href="http://localhost/phpmyadmin" target="_blank" style="display: block; padding: 15px; background: linear-gradient(135deg, #7c3aed, #a78bfa); color: white; text-decoration: none; border-radius: 10px; text-align: center; font-weight: 600; transition: all 0.3s;">
                        🗄️ PhpMyAdmin
                    </a>
                </div>
            </div>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #666;">
            <p>Cellphone Store v1.0</p>
            <p><a href="README.md" style="color: var(--primary-color);">View Documentation</a></p>
        </div>
    </div>
</body>
</html>

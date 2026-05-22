<?php
session_start();
session_unset();
session_destroy();

header("Location: login.php");
exit;
?>
<div class="sidebar">
	<h2><?php echo ($_SESSION['admin_role'] === 'admin') ? 'Elyoo Admin Panel' : 'Elyoo Staff Panel'; ?></h2>
	<ul class="sidebar-menu">
		<li><a href="dashboard.php">Dashboard</a></li>
		<li><a href="products.php">Products</a></li>
		<?php if ($_SESSION['admin_role'] === 'admin'): ?>
		<li><a href="brands.php">Brands</a></li>
		<?php endif; ?>
		<li><a href="staff.php">Staff</a></li>
		<li><a href="orders.php">Orders</a></li>
		<li><a href="change_password.php">Change Password</a></li>
		<li><a href="logout.php" class="active">Logout</a></li>
	</ul>
</div>
<header style="background: #1a2840; color: #fff; padding: 18px 30px 10px 230px; font-size: 16px; font-weight: 500;">
	Logged in as: <strong><?php echo $_SESSION['admin_username']; ?></strong> | Role: <strong><?php echo ucfirst($_SESSION['admin_role']); ?></strong>
</header>

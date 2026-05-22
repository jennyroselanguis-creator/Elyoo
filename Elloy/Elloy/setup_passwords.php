<?php
include 'includes/db.php';

$hash = password_hash('password123', PASSWORD_DEFAULT);

$conn->query("UPDATE admins SET password='$hash' WHERE username='admin'");
$conn->query("UPDATE admins SET password='$hash' WHERE username='staff1'");

echo "Passwords updated successfully!";
?>

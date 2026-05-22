<?php
// Database connection for cellphone_store
$servername = "localhost";
$username = "root";
$password = ""; // Update if your MySQL password is not empty
$dbname = "cellphone_store";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>

<?php
// Database connection
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'cellphone_store';

// Create connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset
$conn->set_charset("utf8");

// Function to execute queries safely
function executeQuery($sql, $types = "", $params = []) {
    global $conn;
    if (empty($types)) {
        $result = $conn->query($sql);
    } else {
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            return null;
        }
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        $stmt->close();
    }
    return $result;
}
?>

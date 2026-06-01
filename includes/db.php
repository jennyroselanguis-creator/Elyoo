<?php
require_once __DIR__ . '/config.php';

// If Supabase is in use, skip creating a local MySQL connection entirely.
if (defined('USE_SUPABASE') && USE_SUPABASE) {
    $conn = null; // indicate no local DB available
} else {
    // Database connection (local MySQL)
    $host = getenv('DB_HOST') ?: 'localhost';
    $username = getenv('DB_USER') ?: 'root';
    $password = getenv('DB_PASS') ?: '';
    $database = getenv('DB_NAME') ?: 'cellphone_store';

    // Create connection (suppress warnings; handle errors gracefully)
    try {
        $conn = @new mysqli($host, $username, $password, $database);
        if ($conn->connect_error) {
            // Failed to connect — don't fatal here; callers will fall back to Supabase or seed data
            $conn = null;
        } else {
            $conn->set_charset('utf8');
        }
    } catch (Throwable $e) {
        $conn = null;
    }
}

// Function to execute queries safely against local MySQL when available
function executeQuery($sql, $types = "", $params = []) {
    global $conn;
    if (!isset($conn) || $conn === null) return null;

    if (empty($types)) {
        return $conn->query($sql);
    }

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        return null;
    }
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    $stmt->close();
    return $result;
}
?>

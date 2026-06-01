<?php
// Script to create staff user 'jai' with password '212121' locally and in Supabase (if service key configured).
chdir(__DIR__ . '/..'); // ensure project root
require_once 'includes/db.php';
require_once 'includes/supabase.php';

$username = 'jai';
$password = '212121';
$email = 'jai@elyoo.com';

echo "Creating staff account: $username\n";

// Check if exists
$stmt = $conn->prepare('SELECT id FROM admins WHERE username = ?');
$stmt->bind_param('s', $username);
$stmt->execute();
$res = $stmt->get_result();
if ($res && $res->num_rows > 0) {
    echo "Local account already exists.\n";
    exit(0);
}

$hashed = password_hash($password, PASSWORD_DEFAULT);
$ins = $conn->prepare('INSERT INTO admins (username, password, email, role) VALUES (?, ?, ?, "staff")');
$ins->bind_param('sss', $username, $hashed, $email);
if ($ins->execute()) {
    echo "Inserted local staff account '$username'.\n";
} else {
    echo "Failed to insert local account: " . $conn->error . "\n";
    exit(1);
}

// Try to create in Supabase via service role key
try {
    $client = new SupabaseClient();
    $resp = $client->adminCreateUser($email, $password, $username, 'staff');
    if (isset($resp['error'])) {
        echo "Supabase user creation warning/error: " . $resp['error'] . "\n";
    } else {
        echo "Supabase user created or synced.\n";
    }
} catch (Exception $e) {
    echo "Supabase creation failed: " . $e->getMessage() . "\n";
}

echo "Done.\n";

?>

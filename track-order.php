<?php
session_start();
require_once 'includes/catalog.php';
require_once 'includes/supabase.php';

$order = null;
$error = '';
$orders_list = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? 'track';
    $email = trim($_POST['email'] ?? '');

    if ($action === 'my_orders' && $email) {
        $_SESSION['tracker_email'] = $email;
        if (USE_SUPABASE) {
            $client = new SupabaseClient();
            $ch = curl_init(rtrim(SUPABASE_URL, '/') . '/rest/v1/rpc/get_orders_by_email');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode(['p_email' => $email]),
                CURLOPT_HTTPHEADER => [
                    'apikey: ' . SUPABASE_ANON_KEY,
                    'Authorization: Bearer ' . SUPABASE_ANON_KEY,
                    'Content-Type: application/json',
                ],
            ]);
            $response = curl_exec($ch);
            curl_close($ch);
            $orders_list = json_decode($response, true) ?: [];
        }
    } elseif ($action === 'track') {
        $order_number = trim($_POST['order_number'] ?? '');
        if ($order_number && $email && USE_SUPABASE) {
            $ch = curl_init(rtrim(SUPABASE_URL, '/') . '/rest/v1/rpc/track_order');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode([
                    'p_order_number' => $order_number,
                    'p_email' => $email,
                ]),
                CURLOPT_HTTPHEADER => [
                    'apikey: ' . SUPABASE_ANON_KEY,
                    'Authorization: Bearer ' . SUPABASE_ANON_KEY,
                    'Content-Type: application/json',
                ],
            ]);
            $response = curl_exec($ch);
            curl_close($ch);
            $data = json_decode($response, true);
            if (!empty($data[0])) {
                $order = $data[0];
            } else {
                $error = 'Order not found. Check your order number and email.';
            }
        } else {
            $error = 'Enter order number and email.';
        }
    }
}

$saved_email = $_SESSION['tracker_email'] ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Track Order - Elyoo Mobile</title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        .track-box { max-width: 700px; margin: 2rem auto; padding: 2rem; background: #1a2847; border-radius: 12px; border: 1px solid rgba(0,217,255,0.3); }
        .track-box input { width: 100%; padding: 12px; margin: 8px 0 16px; border-radius: 8px; border: 1px solid #00d9ff55; background: #0f0f1e; color: #fff; }
        .status-pill { display: inline-block; padding: 6px 12px; border-radius: 20px; background: #00d9ff33; color: #00d9ff; font-weight: bold; }
        .order-item { padding: 8px 0; border-bottom: 1px solid #ffffff11; }
    </style>
</head>
<body>
    <header>
        <div class="header-container">
            <div class="logo-section"><h1>📱 Elyoo Mobile Devices</h1></div>
            <nav>
                <a href="index.php" class="nav-link">Home</a>
                <a href="cart.php" class="nav-link">Cart</a>
                <a href="track-order.php" class="nav-link active">Track Order</a>
            </nav>
        </div>
    </header>
    <div class="container track-box">
        <h2>Track Your Order</h2>
        <?php if ($error): ?><p style="color:#f87171;"><?php echo htmlspecialchars($error); ?></p><?php endif; ?>

        <form method="POST">
            <input type="hidden" name="action" value="track">
            <label>Order Number</label>
            <input type="text" name="order_number" placeholder="ELY-..." required>
            <label>Email</label>
            <input type="email" name="email" value="<?php echo htmlspecialchars($saved_email); ?>" required>
            <button type="submit" class="btn btn-primary">Track Order</button>
        </form>

        <?php if ($order): ?>
            <hr style="margin:2rem 0;border-color:#00d9ff33;">
            <h3><?php echo htmlspecialchars($order['order_number']); ?></h3>
            <p><span class="status-pill"><?php echo htmlspecialchars($order['status']); ?></span></p>
            <p>Total: $<?php echo number_format($order['total_amount'], 2); ?></p>
            <p><?php echo htmlspecialchars($order['customer_address'] ?? ''); ?></p>
            <?php
            $items = is_string($order['items']) ? json_decode($order['items'], true) : $order['items'];
            if ($items): foreach ($items as $item): ?>
                <div class="order-item"><?php echo htmlspecialchars($item['name']); ?> × <?php echo (int)$item['quantity']; ?></div>
            <?php endforeach; endif; ?>
        <?php endif; ?>

        <p style="margin-top:2rem;"><a href="index.php">← Back to shop</a> · <a href="http://localhost:3000/track">React app tracker</a></p>
    </div>
</body>
</html>

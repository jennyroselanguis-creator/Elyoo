<?php
require_once __DIR__ . '/config.php';

/**
 * Supabase REST API client for PHP storefront
 */
class SupabaseClient {
    private string $url;
    private string $key;

    public function __construct() {
        $this->url = rtrim(SUPABASE_URL, '/');
        $this->key = SUPABASE_ANON_KEY;
    }

    private function request(string $method, string $table, array $query = [], $body = null): array {
        $endpoint = $this->url . '/rest/v1/' . $table;
        if (!empty($query)) {
            $endpoint .= '?' . http_build_query($query);
        }

        $ch = curl_init($endpoint);
        $headers = [
            'apikey: ' . $this->key,
            'Authorization: Bearer ' . $this->key,
            'Content-Type: application/json',
        ];
        if ($method === 'GET') {
            $headers[] = 'Accept: application/json';
        } else {
            $headers[] = 'Prefer: return=representation';
        }

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 15,
        ]);

        if ($body !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response === false || $httpCode >= 400) {
            return [];
        }

        $data = json_decode($response, true);
        return is_array($data) ? $data : [];
    }

    public function getBrands(): array {
        return $this->request('GET', 'brands', [
            'select' => '*',
            'order' => 'name.asc',
        ]);
    }

    public function getProducts(int $brandId = 0): array {
        $query = [
            'select' => '*,brands(name)',
            'order' => 'name.asc',
        ];
        if ($brandId > 0) {
            $query['brand_id'] = 'eq.' . $brandId;
        }
        $rows = $this->request('GET', 'products', $query);
        return array_map(function ($row) {
            $row['brand_name'] = $row['brands']['name'] ?? '';
            unset($row['brands']);
            if (!empty($row['image']) && !str_starts_with($row['image'], '/') && !str_starts_with($row['image'], 'http')) {
                $row['image'] = '/' . ltrim($row['image'], '/');
            }
            return $row;
        }, $rows);
    }

    public function createOrder(array $order): array {
        return $this->request('POST', 'orders', [], $order);
    }

    /**
     * Create a new Supabase Auth user using the Service Role key and
     * create a matching profile row with role (admin|staff).
     * Returns array with 'user' and 'profile' on success or ['error'=>msg]
     */
    public function adminCreateUser(string $email, string $password, string $full_name = '', string $role = 'staff'): array {
        $serviceKey = getenv('SUPABASE_SERVICE_ROLE_KEY') ?: ($_ENV['SUPABASE_SERVICE_ROLE_KEY'] ?? '');
        if (empty($serviceKey)) {
            return ['error' => 'Supabase service role key not configured'];
        }

        $adminUrl = rtrim($this->url, '/') . '/auth/v1/admin/users';
        $ch = curl_init($adminUrl);
        $headers = [
            'Content-Type: application/json',
            'apikey: ' . $serviceKey,
            'Authorization: Bearer ' . $serviceKey,
        ];

        $body = [
            'email' => $email,
            'password' => $password,
            'email_confirm' => true,
            'user_metadata' => ['full_name' => $full_name],
        ];

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($body),
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 15,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response === false) {
            return ['error' => 'Supabase request failed'];
        }

        $user = json_decode($response, true);
        if ($httpCode >= 400 || !is_array($user) || empty($user['id'])) {
            $msg = $user['message'] ?? ($user['msg'] ?? 'Failed to create Supabase user');
            return ['error' => is_string($msg) ? $msg : json_encode($user)];
        }

        // Create profile row
        $profileEndpoint = rtrim($this->url, '/') . '/rest/v1/profiles';
        $ch2 = curl_init($profileEndpoint);
        $profileHeaders = [
            'Content-Type: application/json',
            'apikey: ' . $serviceKey,
            'Authorization: Bearer ' . $serviceKey,
            'Prefer: return=representation',
        ];
        $profileBody = [
            'id' => $user['id'],
            'email' => $email,
            'full_name' => $full_name,
            'role' => $role,
        ];

        curl_setopt_array($ch2, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($profileBody),
            CURLOPT_HTTPHEADER => $profileHeaders,
            CURLOPT_TIMEOUT => 15,
        ]);

        $profileResp = curl_exec($ch2);
        $profileHttp = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
        curl_close($ch2);

        $profile = [];
        if ($profileResp !== false && $profileHttp < 400) {
            $profile = json_decode($profileResp, true);
        } else {
            // Non-fatal: user created but profile insert failed
            $profile = ['warning' => 'Profile insert failed', 'response' => $profileResp];
        }

        return ['user' => $user, 'profile' => $profile];
    }
}

function getSupabaseCatalog(int $brandId = 0): ?array {
    if (!USE_SUPABASE) return null;
    try {
        $client = new SupabaseClient();
        return [
            'brands' => $client->getBrands(),
            'products' => $client->getProducts($brandId),
        ];
    } catch (Exception $e) {
        return null;
    }
}

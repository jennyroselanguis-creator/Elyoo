<?php
/**
 * Load environment from .env file in project root
 */
function loadEnv($path) {
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) continue;
        if (!str_contains($line, '=')) continue;
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value, " \t\"'");
        if (!getenv($key)) {
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
}

$projectRoot = dirname(__DIR__);

loadEnv($projectRoot . '/.env');

function loadSupabaseConnectionJson(string $root): void {
    $candidates = [
        $root . '/supabase.connection.json',
        $root . '/public/supabase.connection.json',
    ];
    foreach ($candidates as $file) {
        if (!file_exists($file)) {
            continue;
        }
        $data = json_decode(file_get_contents($file), true);
        if (!is_array($data)) {
            continue;
        }
        $url = $data['url'] ?? $data['supabaseUrl'] ?? '';
        $key = $data['anonKey'] ?? $data['anon_key'] ?? '';
            $service = $data['serviceRoleKey'] ?? $data['service_role_key'] ?? $data['service_key'] ?? $data['serviceRole'] ?? '';
        if ($url !== '' && !getenv('SUPABASE_URL')) {
            putenv('SUPABASE_URL=' . $url);
            putenv('REACT_APP_SUPABASE_URL=' . $url);
            $_ENV['SUPABASE_URL'] = $url;
        }
        if ($key !== '' && !getenv('SUPABASE_ANON_KEY')) {
            putenv('SUPABASE_ANON_KEY=' . $key);
            putenv('REACT_APP_SUPABASE_ANON_KEY=' . $key);
            $_ENV['SUPABASE_ANON_KEY'] = $key;
        }
            if ($service !== '' && !getenv('SUPABASE_SERVICE_ROLE_KEY')) {
                putenv('SUPABASE_SERVICE_ROLE_KEY=' . $service);
                $_ENV['SUPABASE_SERVICE_ROLE_KEY'] = $service;
            }
        break;
    }
}

loadSupabaseConnectionJson($projectRoot);

define('SUPABASE_URL', getenv('SUPABASE_URL') ?: getenv('REACT_APP_SUPABASE_URL') ?: '');
define('SUPABASE_ANON_KEY', getenv('SUPABASE_ANON_KEY') ?: getenv('REACT_APP_SUPABASE_ANON_KEY') ?: '');
define('SUPABASE_SERVICE_ROLE_KEY', getenv('SUPABASE_SERVICE_ROLE_KEY') ?: '');
define('USE_SUPABASE', SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '' && str_contains(SUPABASE_URL, 'supabase'));

<?php
// cors.php — single source of truth for CORS handling.

$allowed_origins = [
    'https://fitness-synergy.infinityfreeapp.com',
    'http://localhost:5173',
    'http://localhost:3000',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origin = in_array($origin, $allowed_origins, true)
    ? $origin
    : 'https://fitness-synergy.infinityfreeapp.com';

header("Access-Control-Allow-Origin: $allowed_origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Auth-Token");

// Short-circuit preflight: no PHP work needed beyond the CORS headers above.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

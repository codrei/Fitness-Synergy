<?php
// cors.php

// 1. IMMEDIATELY handle preflight before session checks or inclusion protocols can execute
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    $allowed_origins = [
        'https://fitness-synergy.infinityfreeapp.com',
        'http://localhost:5173',
        'http://localhost:3000',
    ];
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (!empty($origin) && in_array($origin, $allowed_origins, true)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header("Access-Control-Allow-Origin: https://fitness-synergy.infinityfreeapp.com");
    }

    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Auth-Token");
    http_response_code(200);
    exit;
}

// 2. Normal headers for GET/POST requests continue below
$allowed_origins = [
    'https://fitness-synergy.infinityfreeapp.com',
    'http://localhost:5173',
    'http://localhost:3000',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($origin) && in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: https://fitness-synergy.infinityfreeapp.com");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Auth-Token");
?>

<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'auth_check.php';
requireAuth();

$key = $_GET['key'] ?? '';
if (!$key || !preg_match('/^[a-zA-Z0-9_]+$/', $key)) {
    echo json_encode(["value" => null]);
    exit;
}

$file = __DIR__ . '/settings.json';
$settings = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
echo json_encode(["value" => $settings[$key] ?? null]);
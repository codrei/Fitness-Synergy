<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'auth_check.php';
requireAuth();

$data = json_decode(file_get_contents("php://input"));
$key   = $data->key   ?? '';
$value = $data->value ?? null;

if (!$key || !preg_match('/^[a-zA-Z0-9_]+$/', $key)) {
    echo json_encode(["success" => false, "error" => "Invalid key."]);
    exit;
}

$file     = __DIR__ . '/settings.json';
$settings = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
$settings[$key] = $value;

if (file_put_contents($file, json_encode($settings)) !== false) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => "Could not write settings file."]);
}

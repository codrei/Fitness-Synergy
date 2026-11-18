<?php
require_once __DIR__ . '/../lib/cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth_check.php';
requireAuth();

$data  = json_decode(file_get_contents("php://input"));
$key   = $data->key   ?? '';
$value = $data->value ?? null;

if (!$key || !preg_match('/^[a-zA-Z0-9_]+$/', $key)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid key."]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)");
$stmt->execute([$key, json_encode($value)]);
echo json_encode(["success" => true]);

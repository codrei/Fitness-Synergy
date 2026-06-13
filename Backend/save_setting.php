<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data  = json_decode(file_get_contents("php://input"));
$key   = $data->key   ?? '';
$value = $data->value ?? null;

if (!$key || !preg_match('/^[a-zA-Z0-9_]+$/', $key)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid key."]);
    exit;
}

$file     = __DIR__ . '/settings.json';
$lockFile = $file . '.lock';

// Exclusive lock so concurrent saves can't interleave reads/writes.
$lockHandle = fopen($lockFile, 'c');
if ($lockHandle === false || !flock($lockHandle, LOCK_EX)) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Could not acquire settings lock."]);
    exit;
}

try {
    $settings = file_exists($file)
        ? (json_decode(file_get_contents($file), true) ?: [])
        : [];
    $settings[$key] = $value;

    $written = file_put_contents($file, json_encode($settings, JSON_PRETTY_PRINT));
    if ($written === false) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Could not write settings file."]);
        exit;
    }

    echo json_encode(["success" => true]);
} finally {
    flock($lockHandle, LOCK_UN);
    fclose($lockHandle);
}

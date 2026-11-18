<?php
require_once __DIR__ . '/../lib/cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth_check.php';
requireAuth();

$key = $_GET['key'] ?? '';
if (!$key || !preg_match('/^[a-zA-Z0-9_]+$/', $key)) {
    echo json_encode(["value" => null]);
    exit;
}

$stmt = $conn->prepare("SELECT v FROM settings WHERE k = ?");
$stmt->execute([$key]);
$raw = $stmt->fetchColumn();
echo json_encode(["value" => $raw === false ? null : json_decode($raw)]);

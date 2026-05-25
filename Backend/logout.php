<?php
require_once 'cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once 'db.php';

$authHeader = null;
if (function_exists('getallheaders')) {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
    }
}
if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
}

$token = null;
if ($authHeader && preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
    $token = $matches[1];
}

header("Content-Type: application/json");

if ($token) {
    try {
        $stmt = $conn->prepare("DELETE FROM sessions WHERE session_token = :token");
        $stmt->execute([':token' => $token]);
    } catch (PDOException $e) {
        // Silently ignore — client is logging out regardless
    }
}

echo json_encode(["success" => true]);

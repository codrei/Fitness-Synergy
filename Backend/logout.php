<?php
require_once 'cors.php';
require_once 'db.php';

$token = null;

// Primary: X-Auth-Token header
if (!empty($_SERVER['HTTP_X_AUTH_TOKEN'])) {
    $token = trim($_SERVER['HTTP_X_AUTH_TOKEN']);
}

// Fallback: Authorization: Bearer header
if (!$token) {
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
    if (!$authHeader && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    if ($authHeader && preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
        $token = $matches[1];
    }
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

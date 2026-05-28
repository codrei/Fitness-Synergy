<?php
// auth_check.php

function requireAuth() {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        return;
    }

    global $conn;

    $token = null;

    // Primary: X-Auth-Token header (not stripped by InfinityFree/LiteSpeed proxy)
    if (!empty($_SERVER['HTTP_X_AUTH_TOKEN'])) {
        $token = trim($_SERVER['HTTP_X_AUTH_TOKEN']);
    }

    // Fallback: Authorization: Bearer header (may be stripped by some hosts)
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

    if (!$token) {
        header("Content-Type: application/json");
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "Unauthorized. Please log in."]);
        exit();
    }

    try {
        $stmt = $conn->prepare("SELECT admin_id FROM sessions WHERE session_token = :token AND expires_at > NOW()");
        $stmt->execute([':token' => $token]);
        $session = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$session) {
            header("Content-Type: application/json");
            http_response_code(401);
            echo json_encode(["success" => false, "error" => "Session expired. Please log in again."]);
            exit();
        }

        return $session;

    } catch (PDOException $e) {
        header("Content-Type: application/json");
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Auth check failed."]);
        exit();
    }
}
?>

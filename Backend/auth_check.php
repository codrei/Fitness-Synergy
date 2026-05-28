<?php
// auth_check.php

function requireAuth() {
    // 🔐 CORS PREFLIGHT BYPASS: Allow layout validations to pass through without token screening
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        return; 
    }

    global $conn;

    // Compatible header extraction for Apache, Nginx, and LiteSpeed
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

    $token = null;
    if ($authHeader && preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
        $token = $matches[1];
    }

    if (!$token) {
        header("Content-Type: application/json");
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "Unauthorized. Please log in."]);
        exit();
    }

    try {
        // Notice: This matches the PDO connection setup configured in this file
        $stmt = $conn->prepare("SELECT admin_id FROM sessions WHERE session_token = :token AND expires_at > NOW()");
        $stmt->execute([':token' => $token]);
        $session = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$session) {
            header("Content-Type: application/json");
            http_response_code(401);
            echo json_encode(["success" => false, "error" => "Session expired. Please log in again."]);
            exit();
        }
        
        // Return the active session metadata down to the caller file context script
        return $session;

    } catch (PDOException $e) {
        header("Content-Type: application/json");
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Auth check failed."]);
        exit();
    }
}
?>
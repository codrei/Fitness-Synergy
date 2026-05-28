<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

try {
    $query = $conn->query("SELECT * FROM plans");
    echo json_encode($query->fetchAll(PDO::FETCH_ASSOC));
} catch (PDOException $e) {
    error_log('[get_plans] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Failed to load plans."]);
}
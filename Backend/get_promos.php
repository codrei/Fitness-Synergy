<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

try {
    $all = isset($_GET['all']) && $_GET['all'] === '1';
    $sql = $all
        ? "SELECT * FROM promos ORDER BY is_active DESC, created_at DESC"
        : "SELECT * FROM promos WHERE is_active = 1 ORDER BY created_at DESC";
    echo json_encode($conn->query($sql)->fetchAll(PDO::FETCH_ASSOC));
} catch (PDOException $e) {
    error_log('[get_promos] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Failed to load promos."]);
}

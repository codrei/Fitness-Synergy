<?php
require_once 'cors.php';
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
    echo json_encode(["error" => $e->getMessage()]);
}

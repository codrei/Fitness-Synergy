<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->promo_id)) {
    echo json_encode(["success" => false, "error" => "Promo ID required."]);
    exit;
}

try {
    $conn->prepare("DELETE FROM promos WHERE promo_id = :id")->execute([':id' => (int)$data->promo_id]);
    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    error_log('[delete_promo] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to delete promo."]);
}

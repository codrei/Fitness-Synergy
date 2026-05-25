<?php
require_once 'cors.php';
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
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

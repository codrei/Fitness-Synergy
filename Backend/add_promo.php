<?php
require_once 'cors.php';
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->promo_name)) {
    echo json_encode(["success" => false, "error" => "Promo name is required."]);
    exit;
}

try {
    $conn->prepare("
        INSERT INTO promos (promo_name, bonus_days, description, is_active)
        VALUES (:name, :days, :desc, 1)
    ")->execute([
        ':name' => trim($data->promo_name),
        ':days' => isset($data->bonus_days) ? (int)$data->bonus_days : 0,
        ':desc' => !empty($data->description) ? trim($data->description) : null,
    ]);
    echo json_encode(["success" => true, "promo_id" => $conn->lastInsertId()]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

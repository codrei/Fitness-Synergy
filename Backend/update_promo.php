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
    $conn->prepare("
        UPDATE promos SET
            promo_name      = :name,
            bonus_days      = :days,
            discount_amount = :discount,
            is_free         = :is_free,
            description     = :desc,
            is_active       = :active
        WHERE promo_id = :id
    ")->execute([
        ':id'       => (int)$data->promo_id,
        ':name'     => trim($data->promo_name),
        ':days'     => isset($data->bonus_days)      ? (int)$data->bonus_days              : 0,
        ':discount' => isset($data->discount_amount) ? (float)$data->discount_amount       : 0,
        ':is_free'  => !empty($data->is_free)        ? 1                                   : 0,
        ':desc'     => !empty($data->description)    ? trim($data->description)            : null,
        ':active'   => isset($data->is_active)       ? (int)$data->is_active               : 1,
    ]);
    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

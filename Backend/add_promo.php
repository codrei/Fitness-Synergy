<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
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
        INSERT INTO promos (promo_name, bonus_days, discount_amount, is_free, description, is_active)
        VALUES (:name, :days, :discount, :is_free, :desc, 1)
    ")->execute([
        ':name'     => trim($data->promo_name),
        ':days'     => isset($data->bonus_days)      ? (int)$data->bonus_days              : 0,
        ':discount' => isset($data->discount_amount) ? (float)$data->discount_amount       : 0,
        ':is_free'  => !empty($data->is_free)        ? 1                                   : 0,
        ':desc'     => !empty($data->description)    ? trim($data->description)            : null,
    ]);
    echo json_encode(["success" => true, "promo_id" => $conn->lastInsertId()]);
} catch (PDOException $e) {
    error_log('[add_promo] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to add promo."]);
}

<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->plan_id) || empty($data->plan_name) || !isset($data->price) || !isset($data->duration_days)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Plan ID, name, price, and duration are required."]);
    exit;
}

$price = (float)$data->price;
$days  = (int)$data->duration_days;

if ($price < 0 || $days < 1) {
    http_response_code(422);
    echo json_encode([
        "success" => false,
        "error"   => "Price must be ≥ 0 and duration must be at least 1 day.",
    ]);
    exit;
}

try {
    $conn->prepare("
        UPDATE plans SET plan_name = :name, price = :price, duration_days = :days
        WHERE plan_id = :id
    ")->execute([
        ':id'    => (int)$data->plan_id,
        ':name'  => trim($data->plan_name),
        ':price' => $price,
        ':days'  => $days,
    ]);
    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    error_log('[update_plan] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to update plan."]);
}

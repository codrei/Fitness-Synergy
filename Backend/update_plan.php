<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->plan_id) || empty($data->plan_name) || !isset($data->price) || !isset($data->duration_days)) {
    echo json_encode(["success" => false, "error" => "Plan ID, name, price, and duration are required."]);
    exit;
}

try {
    $conn->prepare("
        UPDATE plans SET plan_name = :name, price = :price, duration_days = :days
        WHERE plan_id = :id
    ")->execute([
        ':id'    => (int)$data->plan_id,
        ':name'  => trim($data->plan_name),
        ':price' => (float)$data->price,
        ':days'  => (int)$data->duration_days,
    ]);
    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

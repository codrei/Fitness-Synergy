<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->plan_name) || !isset($data->price) || !isset($data->duration_days)) {
    echo json_encode(["success" => false, "error" => "Plan name, price, and duration are required."]);
    exit;
}

try {
    $conn->prepare("
        INSERT INTO plans (plan_name, price, duration_days)
        VALUES (:name, :price, :days)
    ")->execute([
        ':name'  => trim($data->plan_name),
        ':price' => (float)$data->price,
        ':days'  => (int)$data->duration_days,
    ]);
    echo json_encode(["success" => true, "plan_id" => $conn->lastInsertId()]);
} catch (PDOException $e) {
    error_log('[add_plan] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to add plan."]);
}
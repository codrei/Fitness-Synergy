<?php
require_once 'cors.php';
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->plan_id)) {
    echo json_encode(["success" => false, "error" => "Plan ID required."]);
    exit;
}

$id = (int)$data->plan_id;

try {
    // Prevent deleting the walk-in daily plan
    if ($id === 1) {
        echo json_encode(["success" => false, "error" => "The Walk-in / Daily Plan cannot be deleted."]);
        exit;
    }

    // Prevent deleting a plan that active members are on
    $check = $conn->prepare("SELECT COUNT(*) FROM members WHERE plan_id = :id");
    $check->execute([':id' => $id]);
    if ((int)$check->fetchColumn() > 0) {
        echo json_encode(["success" => false, "error" => "Cannot delete — members are currently on this plan. Reassign them first."]);
        exit;
    }

    $conn->prepare("DELETE FROM plans WHERE plan_id = :id")->execute([':id' => $id]);
    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

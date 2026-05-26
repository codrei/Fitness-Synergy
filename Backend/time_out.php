<?php
require_once 'cors.php';
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data = json_decode(file_get_contents("php://input"));
$log_id = isset($data->log_id) ? (int)$data->log_id : 0;

if ($log_id <= 0) {
    echo json_encode(["success" => false, "error" => "Invalid log ID."]);
    exit;
}

try {
    $stmt = $conn->prepare("UPDATE attendance SET time_out = NOW() WHERE log_id = :id AND time_out IS NULL");
    $stmt->execute([':id' => $log_id]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => true, "message" => "Time out recorded."]);
    } else {
        echo json_encode(["success" => false, "error" => "Log not found or already timed out."]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Failed to record time out."]);
}

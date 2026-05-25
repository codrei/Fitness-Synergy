<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->member_id)) {
    try {
        $stmt = $conn->prepare("
            UPDATE attendance
            SET time_out = NOW()
            WHERE member_id = :id
            AND DATE(time_in) = CURRENT_DATE()
            AND time_out IS NULL
            ORDER BY time_in DESC
            LIMIT 1
        ");
        $stmt->execute([':id' => $data->member_id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(["success" => true, "message" => "Time out successful."]);
        } else {
            echo json_encode(["success" => false, "error" => "No active session found."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "error" => "No member ID provided."]);
}

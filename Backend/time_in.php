<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';
require_once 'auth_check.php';
requireAuth();
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->member_id)) {
    try {
        $check_stmt = $conn->prepare("SELECT log_id FROM attendance WHERE member_id = :id AND DATE(time_in) = CURRENT_DATE() LIMIT 1");
        $check_stmt->execute([':id' => $data->member_id]);

        if ($check_stmt->rowCount() > 0) {
            echo json_encode(["success" => false, "error" => "Member is already timed in."]);
        } else {
            $stmt = $conn->prepare("INSERT INTO attendance (member_id, time_in) VALUES (:id, NOW())");
            $stmt->execute([':id' => $data->member_id]);
            echo json_encode(["success" => true, "message" => "Time in successful."]);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "error" => "No member ID provided."]);
}
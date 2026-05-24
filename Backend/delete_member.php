<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight "OPTIONS" requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';
$data = json_decode(file_get_contents("php://input"));

if (isset($data->member_id)) {
    try {
        $conn->beginTransaction();

        $clearLogs = $conn->prepare("DELETE FROM attendance WHERE member_id = :id");
        $clearLogs->execute([':id' => $data->member_id]);

        $clearPayments = $conn->prepare("DELETE FROM payments WHERE member_id = :id");
        $clearPayments->execute([':id' => $data->member_id]);

        $deleteMember = $conn->prepare("DELETE FROM members WHERE member_id = :id");
        $deleteMember->execute([':id' => $data->member_id]);

        $conn->commit();
        echo json_encode(["success" => true, "message" => "Member deleted!"]);
    } catch (PDOException $e) {
        $conn->rollBack();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
<?php
require_once 'cors.php';


require_once 'db.php';
require_once 'auth_check.php';
requireAuth();
$data = json_decode(file_get_contents("php://input"));

$id = isset($data->member_id) ? (int)$data->member_id : 0;

if ($id > 0) {
    try {
        $conn->beginTransaction();

        $clearLogs = $conn->prepare("DELETE FROM attendance WHERE member_id = :id");
        $clearLogs->execute([':id' => $id]);

        $clearPayments = $conn->prepare("DELETE FROM payments WHERE member_id = :id");
        $clearPayments->execute([':id' => $id]);

        $deleteMember = $conn->prepare("DELETE FROM members WHERE member_id = :id");
        $deleteMember->execute([':id' => $id]);

        if ($deleteMember->rowCount() === 0) {
            $conn->rollBack();
            echo json_encode(["success" => false, "error" => "Member not found."]);
        } else {
            $conn->commit();
            echo json_encode(["success" => true, "message" => "Member deleted!"]);
        }
    } catch (PDOException $e) {
        $conn->rollBack();
        echo json_encode(["success" => false, "error" => "Delete failed."]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Invalid member ID."]);
}
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"));

if (isset($data->member_id)) {
    try {
        $conn = new PDO("mysql:host=sql303.infinityfree.com;dbname=if0_41873855_ironforgegym;charset=utf8mb4", "if0_41873855", "NK92T3vwsKKoXp");
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // 1. Delete their attendance logs first
        $clearLogs = $conn->prepare("DELETE FROM attendance WHERE member_id = :id");
        $clearLogs->execute([':id' => $data->member_id]);

        // 2. NEW: Delete their payment records to clear the second Foreign Key!
        $clearPayments = $conn->prepare("DELETE FROM payments WHERE member_id = :id");
        $clearPayments->execute([':id' => $data->member_id]);

        // 3. Now it is finally safe to delete the member
        $deleteMember = $conn->prepare("DELETE FROM members WHERE member_id = :id");
        $deleteMember->execute([':id' => $data->member_id]);

        echo json_encode(["success" => true, "message" => "Member deleted!"]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
?>
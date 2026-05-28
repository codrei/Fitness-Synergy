<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';
require_once 'auth_check.php';
require_once 'audit.php';
$session = requireAuth();
$data = json_decode(file_get_contents("php://input"));

$id = isset($data->member_id) ? (int)$data->member_id : 0;

if ($id > 0) {
    try {
        // Capture full snapshot BEFORE delete so the audit log can preserve forensic context.
        $snapStmt = $conn->prepare("SELECT * FROM members WHERE member_id = :id");
        $snapStmt->execute([':id' => $id]);
        $snapshot = $snapStmt->fetch(PDO::FETCH_ASSOC);

        // Block delete if member has outstanding installment balance
        $m = $snapshot;
        if ($m && $m['is_installment'] == 1 && (float)$m['installment_total'] > 0) {
            $paidStmt = $conn->prepare("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE member_id = :id AND customer_type = 'Member' AND payment_date >= :start");
            $paidStmt->execute([':id' => $id, ':start' => $m['start_date']]);
            $outstanding = (float)$m['installment_total'] - (float)$paidStmt->fetchColumn();
            if ($outstanding > 0.01) {
                echo json_encode([
                    "success" => false,
                    "error"   => "Cannot delete — this member has an outstanding installment balance of ₱" . number_format($outstanding, 2) . ". Please settle the full balance before deleting."
                ]);
                exit;
            }
        }

        $conn->beginTransaction();

        $clearLogs = $conn->prepare("DELETE FROM attendance WHERE member_id = :id");
        $clearLogs->execute([':id' => $id]);

        $clearPayments = $conn->prepare("DELETE FROM payments WHERE member_id = :id");
        $clearPayments->execute([':id' => $id]);

        $deleteMember = $conn->prepare("DELETE FROM members WHERE member_id = :id");
        $deleteMember->execute([':id' => $id]);

        if ($deleteMember->rowCount() === 0) {
            $conn->rollBack();
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Member not found."]);
        } else {
            $conn->commit();
            logActivity(
                $conn, $session,
                'member.delete', 'member', $id,
                "Deleted member: " . ($snapshot['full_name'] ?? "ID $id") . " (" . ($snapshot['contract_id'] ?? '—') . ")",
                $snapshot  // full member row preserved for forensic recovery
            );
            echo json_encode(["success" => true, "message" => "Member deleted!"]);
        }
    } catch (PDOException $e) {
        if ($conn->inTransaction()) $conn->rollBack();
        error_log('[delete_member] ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Delete failed."]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Invalid member ID."]);
}
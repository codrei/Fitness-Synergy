<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->member_id) || empty($data->amount)) {
    echo json_encode(["success" => false, "error" => "Member ID and amount are required."]);
    exit;
}

try {
    $member = $conn->prepare("SELECT plan_id, is_installment, installment_total, start_date FROM members WHERE member_id = :id");
    $member->execute([':id' => $data->member_id]);
    $m = $member->fetch(PDO::FETCH_ASSOC);

    if (!$m || !$m['is_installment']) {
        echo json_encode(["success" => false, "error" => "Member is not on an installment plan."]);
        exit;
    }

    // Overpayment guard
    $installmentTotal = (float)($m['installment_total'] ?? 0);
    if ($installmentTotal > 0) {
        $paidStmt = $conn->prepare("
            SELECT COALESCE(SUM(amount), 0) FROM payments
            WHERE member_id = :id AND customer_type = 'Member' AND payment_date >= :start
        ");
        $paidStmt->execute([':id' => $data->member_id, ':start' => $m['start_date']]);
        $totalPaid = (float)$paidStmt->fetchColumn();
        $remaining = $installmentTotal - $totalPaid;
        if ((float)$data->amount > $remaining + 0.01) {
            echo json_encode([
                "success" => false,
                "error"   => "Payment of ₱" . number_format($data->amount, 2) . " exceeds the remaining balance of ₱" . number_format(max(0, $remaining), 2) . ".",
            ]);
            exit;
        }
    }

    $payment_method   = !empty($data->payment_method)   ? $data->payment_method   : 'Cash';
    $reference_number = !empty($data->reference_number) ? $data->reference_number : null;

    $conn->prepare("
        INSERT INTO payments
            (member_id, customer_type, amount, payment_date, plan_id,
             payment_method, reference_number)
        VALUES
            (:member_id, 'Member', :amount, CURRENT_DATE(), :plan_id,
             :payment_method, :reference)
    ")->execute([
        ':member_id'      => (int)$data->member_id,
        ':amount'         => (float)$data->amount,
        ':plan_id'        => $m['plan_id'],
        ':payment_method' => $payment_method,
        ':reference'      => $reference_number,
    ]);

    echo json_encode(["success" => true, "message" => "Installment payment recorded."]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

try {
    // Fetch all installment members with their plans
    $stmt = $conn->prepare("
        SELECT
            m.member_id, m.full_name, m.start_date, m.installment_total,
            m.contact_number,
            pl.plan_name
        FROM members m
        LEFT JOIN plans pl ON m.plan_id = pl.plan_id
        WHERE m.is_installment = 1
        ORDER BY m.start_date DESC
    ");
    $stmt->execute();
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($members)) {
        echo json_encode(['success' => true, 'installments' => []]);
        exit;
    }

    // Fetch payments for each member individually (avoids dynamic IN clause)
    $pay_stmt = $conn->prepare("
        SELECT payment_id, amount, payment_date, payment_method
        FROM payments
        WHERE member_id = :mid
        ORDER BY payment_date ASC
    ");

    $installments = [];
    foreach ($members as $m) {
        $pay_stmt->execute([':mid' => $m['member_id']]);
        $payments = $pay_stmt->fetchAll(PDO::FETCH_ASSOC);

        $total_paid = (float) array_sum(array_column($payments, 'amount'));
        $balance    = max(0.0, (float)$m['installment_total'] - $total_paid);

        $installments[] = [
            'member_id'         => $m['member_id'],
            'full_name'         => $m['full_name'],
            'contact_number'    => $m['contact_number'],
            'start_date'        => $m['start_date'],
            'plan_name'         => $m['plan_name'],
            'installment_total' => (float)$m['installment_total'],
            'total_paid'        => $total_paid,
            'balance'           => $balance,
            'status'            => $balance <= 0 ? 'PAID' : 'OUTSTANDING',
            'payments'          => $payments,
        ];
    }

    echo json_encode(['success' => true, 'installments' => $installments]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to fetch installment data.']);
}

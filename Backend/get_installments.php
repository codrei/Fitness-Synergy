<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

try {
    // Single query: members + plan + aggregated payment totals.
    $stmt = $conn->prepare("
        SELECT
            m.member_id, m.full_name, m.contact_number, m.start_date,
            m.installment_total, pl.plan_name,
            COALESCE(SUM(p.amount), 0) AS total_paid
        FROM members m
        LEFT JOIN plans    pl ON m.plan_id   = pl.plan_id
        LEFT JOIN payments p  ON p.member_id = m.member_id
        WHERE m.is_installment = 1
        GROUP BY m.member_id
        ORDER BY m.start_date DESC
    ");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($rows)) {
        echo json_encode(['success' => true, 'installments' => []]);
        exit;
    }

    // One batched query for ALL installment-member payment rows (avoids N+1).
    $ids = array_column($rows, 'member_id');
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $payStmt = $conn->prepare("
        SELECT payment_id, member_id, amount, payment_date, payment_method
        FROM payments
        WHERE member_id IN ($placeholders)
        ORDER BY member_id, payment_date ASC
    ");
    $payStmt->execute($ids);

    $payments_by_member = [];
    foreach ($payStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $payments_by_member[$row['member_id']][] = $row;
    }

    $installments = [];
    foreach ($rows as $m) {
        $total_paid = (float)$m['total_paid'];
        $balance    = max(0.0, (float)$m['installment_total'] - $total_paid);
        $installments[] = [
            'member_id'         => (int)$m['member_id'],
            'full_name'         => $m['full_name'],
            'contact_number'    => $m['contact_number'],
            'start_date'        => $m['start_date'],
            'plan_name'         => $m['plan_name'],
            'installment_total' => (float)$m['installment_total'],
            'total_paid'        => $total_paid,
            'balance'           => $balance,
            'status'            => $balance <= 0.01 ? 'PAID' : 'OUTSTANDING',
            'payments'          => $payments_by_member[$m['member_id']] ?? [],
        ];
    }

    echo json_encode(['success' => true, 'installments' => $installments]);

} catch (PDOException $e) {
    error_log('[get_installments] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to fetch installment data.']);
}

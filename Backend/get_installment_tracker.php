<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

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

// Fetch all payments for these members
$member_ids = array_column($members, 'member_id');
$placeholders = implode(',', array_fill(0, count($member_ids), '?'));

$pay_stmt = $conn->prepare("
    SELECT member_id, payment_id, amount, payment_date, payment_method
    FROM payments
    WHERE member_id IN ($placeholders)
    ORDER BY member_id ASC, payment_date ASC
");
$pay_stmt->execute($member_ids);
$all_payments = $pay_stmt->fetchAll(PDO::FETCH_ASSOC);

// Group payments by member_id
$payments_by_member = [];
foreach ($all_payments as $p) {
    $payments_by_member[$p['member_id']][] = $p;
}

// Build result
$installments = [];
foreach ($members as $m) {
    $mid      = $m['member_id'];
    $payments = $payments_by_member[$mid] ?? [];
    $total_paid = array_sum(array_column($payments, 'amount'));
    $balance    = max(0, (float)$m['installment_total'] - $total_paid);

    $installments[] = [
        'member_id'         => $mid,
        'full_name'         => $m['full_name'],
        'contact_number'    => $m['contact_number'],
        'start_date'        => $m['start_date'],
        'plan_name'         => $m['plan_name'],
        'installment_total' => (float)$m['installment_total'],
        'total_paid'        => (float)$total_paid,
        'balance'           => (float)$balance,
        'status'            => $balance <= 0 ? 'PAID' : 'OUTSTANDING',
        'payments'          => $payments,
    ];
}

echo json_encode(['success' => true, 'installments' => $installments]);

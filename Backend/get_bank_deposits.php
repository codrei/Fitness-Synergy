<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$month = (int)($_GET['month'] ?? date('m'));
$year  = (int)($_GET['year']  ?? date('Y'));

try {
    $stmt = $conn->prepare("
        SELECT id, deposit_date, amount, variance, remarks, created_at
        FROM bank_deposits
        WHERE MONTH(deposit_date) = :m AND YEAR(deposit_date) = :y
        ORDER BY deposit_date ASC
    ");
    $stmt->execute([':m' => $month, ':y' => $year]);
    $deposits = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $total = array_sum(array_column($deposits, 'amount'));

    echo json_encode([
        'success'  => true,
        'deposits' => $deposits,
        'total'    => (float) $total,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch deposits.']);
}

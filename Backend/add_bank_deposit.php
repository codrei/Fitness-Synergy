<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data    = json_decode(file_get_contents('php://input'), true);
$date    = trim($data['deposit_date'] ?? '');
$amount  = (float)($data['amount'] ?? 0);
$variance = isset($data['variance']) && $data['variance'] !== '' ? (float)$data['variance'] : null;
$remarks = trim($data['remarks'] ?? '') ?: null;

if (!$date || $amount <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Date and amount are required.']);
    exit;
}

try {
    $stmt = $conn->prepare("
        INSERT INTO bank_deposits (deposit_date, amount, variance, remarks)
        VALUES (:date, :amount, :variance, :remarks)
    ");
    $stmt->execute([
        ':date'     => $date,
        ':amount'   => $amount,
        ':variance' => $variance,
        ':remarks'  => $remarks,
    ]);
    echo json_encode(['success' => true, 'id' => $conn->lastInsertId()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to add deposit.']);
}

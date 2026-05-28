<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data     = json_decode(file_get_contents('php://input'), true);
$id       = (int)($data['id'] ?? 0);
$date     = trim($data['deposit_date'] ?? '');
$amount   = (float)($data['amount'] ?? 0);
$variance = isset($data['variance']) && $data['variance'] !== '' ? (float)$data['variance'] : null;
$remarks  = trim($data['remarks'] ?? '') ?: null;

if (!$id || !$date || $amount <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID, date, and amount are required.']);
    exit;
}

try {
    $stmt = $conn->prepare("
        UPDATE bank_deposits
        SET deposit_date = :date, amount = :amount, variance = :variance, remarks = :remarks
        WHERE id = :id
    ");
    $stmt->execute([
        ':id'       => $id,
        ':date'     => $date,
        ':amount'   => $amount,
        ':variance' => $variance,
        ':remarks'  => $remarks,
    ]);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update deposit.']);
}

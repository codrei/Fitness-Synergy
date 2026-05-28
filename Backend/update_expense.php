<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data         = json_decode(file_get_contents('php://input'), true);
$expense_id   = $data['expense_id']   ?? null;
$category     = trim($data['category']     ?? '');
$description  = trim($data['description']  ?? '');
$amount       = (float)($data['amount']    ?? 0);
$expense_date = $data['expense_date'] ?? date('Y-m-d');

if (!$expense_id || !$category || $amount <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Expense ID, category, and a positive amount are required.']);
    exit;
}

try {
    $stmt = $conn->prepare("
        UPDATE expenses
        SET category = :category, description = :description,
            amount = :amount, expense_date = :expense_date
        WHERE expense_id = :expense_id
    ");
    $stmt->execute([
        ':category'     => $category,
        ':description'  => $description,
        ':amount'       => $amount,
        ':expense_date' => $expense_date,
        ':expense_id'   => $expense_id,
    ]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    error_log('[update_expense] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to update expense.']);
}

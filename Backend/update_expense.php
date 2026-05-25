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
$amount       = $data['amount']       ?? 0;
$expense_date = $data['expense_date'] ?? date('Y-m-d');

if (!$expense_id || !$category || !$amount) {
    echo json_encode(['success' => false, 'error' => 'Expense ID, category, and amount are required.']);
    exit;
}

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

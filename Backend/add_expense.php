<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data         = json_decode(file_get_contents('php://input'), true);
$category     = trim($data['category']     ?? '');
$description  = trim($data['description']  ?? '');
$amount       = $data['amount']       ?? 0;
$expense_date = $data['expense_date'] ?? date('Y-m-d');

if (!$category || !$amount) {
    echo json_encode(['success' => false, 'error' => 'Category and amount are required.']);
    exit;
}

$stmt = $conn->prepare("
    INSERT INTO expenses (category, description, amount, expense_date)
    VALUES (:category, :description, :amount, :expense_date)
");
$stmt->execute([
    ':category'     => $category,
    ':description'  => $description,
    ':amount'       => $amount,
    ':expense_date' => $expense_date,
]);

echo json_encode(['success' => true, 'expense_id' => $conn->lastInsertId()]);

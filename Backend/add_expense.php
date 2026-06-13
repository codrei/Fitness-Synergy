<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
require_once 'audit.php';
$session = requireAuth();

$data         = json_decode(file_get_contents('php://input'), true);
$category     = trim($data['category']     ?? '');
$description  = trim($data['description']  ?? '');
$amount       = (float)($data['amount']    ?? 0);
$expense_date = $data['expense_date'] ?? date('Y-m-d');

if (!$category || $amount <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Category is required and amount must be greater than zero.']);
    exit;
}

try {
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

    $expense_id = (int)$conn->lastInsertId();
    logActivity(
        $conn, $session,
        'expense.create', 'expense', $expense_id,
        "Added expense: $category — ₱" . number_format($amount, 2),
        ['category' => $category, 'description' => $description, 'amount' => $amount, 'expense_date' => $expense_date]
    );
    echo json_encode(['success' => true, 'expense_id' => $expense_id]);
} catch (PDOException $e) {
    error_log('[add_expense] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to add expense.']);
}

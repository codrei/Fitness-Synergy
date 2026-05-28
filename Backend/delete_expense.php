<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data       = json_decode(file_get_contents('php://input'), true);
$expense_id = $data['expense_id'] ?? null;

if (!$expense_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Expense ID required.']);
    exit;
}

try {
    $stmt = $conn->prepare("DELETE FROM expenses WHERE expense_id = :id");
    $stmt->execute([':id' => $expense_id]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    error_log('[delete_expense] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to delete expense.']);
}
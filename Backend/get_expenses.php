<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$month = (int)($_GET['month'] ?? date('m'));
$year  = (int)($_GET['year']  ?? date('Y'));
if ($month < 1 || $month > 12 || $year < 2000 || $year > 2099) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid month or year."]);
    exit;
}

$stmt = $conn->prepare("
    SELECT expense_id, category, description, amount, expense_date, created_at
    FROM expenses
    WHERE MONTH(expense_date) = :month AND YEAR(expense_date) = :year
    ORDER BY expense_date DESC, expense_id DESC
");
$stmt->execute([':month' => $month, ':year' => $year]);
$expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($expenses);

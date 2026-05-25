<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$month = $_GET['month'] ?? date('m');
$year  = $_GET['year']  ?? date('Y');

$stmt = $conn->prepare("
    SELECT expense_id, category, description, amount, expense_date, created_at
    FROM expenses
    WHERE MONTH(expense_date) = :month AND YEAR(expense_date) = :year
    ORDER BY expense_date DESC, expense_id DESC
");
$stmt->execute([':month' => $month, ':year' => $year]);
$expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($expenses);

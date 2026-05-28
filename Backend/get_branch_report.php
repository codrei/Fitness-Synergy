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

// Daily breakdown pivoted by payment method
$stmt = $conn->prepare("
    SELECT
        DAY(payment_date)  AS day_num,
        DATE(payment_date) AS date,
        SUM(CASE WHEN payment_method = 'Cash'                          THEN amount ELSE 0 END) AS cash,
        SUM(CASE WHEN payment_method IN ('GCash', 'Maya')              THEN amount ELSE 0 END) AS gcash_maya,
        SUM(CASE WHEN payment_method = 'Bank Transfer'                 THEN amount ELSE 0 END) AS bank_transfer,
        SUM(CASE WHEN payment_method IN ('Credit Card', 'Debit Card')  THEN amount ELSE 0 END) AS card,
        SUM(amount) AS total
    FROM payments
    WHERE MONTH(payment_date) = :month AND YEAR(payment_date) = :year
    GROUP BY DATE(payment_date)
    ORDER BY DATE(payment_date)
");
$stmt->execute([':month' => $month, ':year' => $year]);
$daily_rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

// MTD totals for selected month
$mtd_stmt = $conn->prepare("
    SELECT
        SUM(CASE WHEN payment_method = 'Cash'                          THEN amount ELSE 0 END) AS cash,
        SUM(CASE WHEN payment_method IN ('GCash', 'Maya')              THEN amount ELSE 0 END) AS gcash_maya,
        SUM(CASE WHEN payment_method = 'Bank Transfer'                 THEN amount ELSE 0 END) AS bank_transfer,
        SUM(CASE WHEN payment_method IN ('Credit Card', 'Debit Card')  THEN amount ELSE 0 END) AS card,
        SUM(amount) AS total
    FROM payments
    WHERE MONTH(payment_date) = :month AND YEAR(payment_date) = :year
");
$mtd_stmt->execute([':month' => $month, ':year' => $year]);
$mtd = $mtd_stmt->fetch(PDO::FETCH_ASSOC);

// YTD total for selected year
$ytd = (float) $conn->prepare("SELECT COALESCE(SUM(amount),0) FROM payments WHERE YEAR(payment_date) = :year")
    ->execute([':year' => $year]) ? $conn->query("SELECT COALESCE(SUM(amount),0) FROM payments WHERE YEAR(payment_date) = $year")->fetchColumn() : 0;

// Simpler YTD query
$ytd_stmt = $conn->prepare("SELECT COALESCE(SUM(amount),0) FROM payments WHERE YEAR(payment_date) = :year");
$ytd_stmt->execute([':year' => $year]);
$ytd = (float) $ytd_stmt->fetchColumn();

// Days in selected month (for building full grid on frontend)
$days_in_month = (int) date('t', mktime(0, 0, 0, $month, 1, $year));

echo json_encode([
    'success'       => true,
    'month'         => $month,
    'year'          => $year,
    'days_in_month' => $days_in_month,
    'daily'         => $daily_rows,
    'mtd'           => $mtd,
    'ytd'           => $ytd,
]);

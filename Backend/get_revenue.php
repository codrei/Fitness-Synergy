<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");


require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$month = $_GET['month'] ?? date('m');
$year  = $_GET['year']  ?? date('Y');

// Member payments
$stmt = $conn->prepare("
    SELECT
        p.payment_id, p.payment_date,
        m.full_name, m.dob, m.discount_type,
        TIMESTAMPDIFF(YEAR, m.dob, CURDATE()) as age,
        pl.plan_name,
        p.amount, p.payment_method, p.reference_number,
        'Member' as customer_type
    FROM payments p
    LEFT JOIN members m ON p.member_id = m.member_id
    LEFT JOIN plans pl ON p.plan_id = pl.plan_id
    WHERE p.customer_type = 'Member'
      AND MONTH(p.payment_date) = :month AND YEAR(p.payment_date) = :year
    ORDER BY p.payment_date ASC
");
$stmt->execute([':month' => $month, ':year' => $year]);
$member_payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Walk-in payments
$stmt2 = $conn->prepare("
    SELECT
        p.payment_id, p.payment_date,
        p.guest_name as full_name, p.guest_age as age,
        NULL as dob,
        CASE WHEN p.guest_age >= 60 THEN 'Senior' ELSE 'None' END as discount_type,
        pl.plan_name,
        p.amount, p.payment_method, p.reference_number,
        'Walk-in' as customer_type
    FROM payments p
    LEFT JOIN plans pl ON p.plan_id = pl.plan_id
    WHERE p.customer_type = 'Walk-in'
      AND MONTH(p.payment_date) = :month AND YEAR(p.payment_date) = :year
    ORDER BY p.payment_date ASC
");
$stmt2->execute([':month' => $month, ':year' => $year]);
$walkin_payments = $stmt2->fetchAll(PDO::FETCH_ASSOC);

// All payments combined and sorted
$all_payments = array_merge($member_payments, $walkin_payments);
usort($all_payments, fn($a, $b) => strcmp($a['payment_date'], $b['payment_date']));

// Monthly breakdown — single query, no UNION needed
$stmt3 = $conn->prepare("
    SELECT MONTH(payment_date) as month_num,
           MONTHNAME(payment_date) as month_name,
           SUM(amount) as total, COUNT(*) as count
    FROM payments
    WHERE YEAR(payment_date) = :year
    GROUP BY MONTH(payment_date), MONTHNAME(payment_date)
    ORDER BY month_num ASC
");
$stmt3->execute([':year' => $year]);
$monthly = $stmt3->fetchAll(PDO::FETCH_ASSOC);

// Yearly breakdown — single query
$yearly = $conn->query("
    SELECT YEAR(payment_date) as year, SUM(amount) as total, COUNT(*) as count
    FROM payments
    GROUP BY YEAR(payment_date)
    ORDER BY year ASC
")->fetchAll(PDO::FETCH_ASSOC);

// Overview totals
$today     = (float) $conn->query("SELECT COALESCE(SUM(amount),0) FROM payments WHERE DATE(payment_date) = CURDATE()")->fetchColumn();
$this_week = (float) $conn->query("SELECT COALESCE(SUM(amount),0) FROM payments WHERE YEARWEEK(payment_date, 1) = YEARWEEK(CURDATE(), 1)")->fetchColumn();
$month_t   = (float) $conn->query("SELECT COALESCE(SUM(amount),0) FROM payments WHERE MONTH(payment_date) = MONTH(CURDATE()) AND YEAR(payment_date) = YEAR(CURDATE())")->fetchColumn();
$year_t    = (float) $conn->query("SELECT COALESCE(SUM(amount),0) FROM payments WHERE YEAR(payment_date) = YEAR(CURDATE())")->fetchColumn();
$all_time  = (float) $conn->query("SELECT COALESCE(SUM(amount),0) FROM payments")->fetchColumn();

// Payment method breakdown for selected month/year
$method_stmt = $conn->prepare("
    SELECT payment_method, SUM(amount) as total, COUNT(*) as count
    FROM payments
    WHERE MONTH(payment_date) = :month AND YEAR(payment_date) = :year
    GROUP BY payment_method
    ORDER BY total DESC
");
$method_stmt->execute([':month' => $month, ':year' => $year]);
$method_breakdown = $method_stmt->fetchAll(PDO::FETCH_ASSOC);

// Expenses for selected month/year (gracefully returns 0 if table doesn't exist)
try {
    $exp_stmt = $conn->prepare("SELECT COALESCE(SUM(amount),0) FROM expenses WHERE MONTH(expense_date) = :month AND YEAR(expense_date) = :year");
    $exp_stmt->execute([':month' => $month, ':year' => $year]);
    $selected_expenses = (float) $exp_stmt->fetchColumn();
} catch (Exception $e) {
    $selected_expenses = 0;
}

try {
    $curr_expenses = (float) $conn->query("SELECT COALESCE(SUM(amount),0) FROM expenses WHERE MONTH(expense_date) = MONTH(CURDATE()) AND YEAR(expense_date) = YEAR(CURDATE())")->fetchColumn();
} catch (Exception $e) {
    $curr_expenses = 0;
}

echo json_encode([
    'success'           => true,
    'payments'          => $all_payments,
    'member_payments'   => $member_payments,
    'walkin_payments'   => $walkin_payments,
    'monthly'           => $monthly,
    'yearly'            => $yearly,
    'method_breakdown'  => $method_breakdown,
    'total'             => array_sum(array_column($all_payments, 'amount')),
    'selected_expenses' => $selected_expenses,
    'overview'          => [
        'today'               => $today,
        'this_week'           => $this_week,
        'this_month'          => $month_t,
        'this_year'           => $year_t,
        'all_time'            => $all_time,
        'expenses_this_month' => $curr_expenses,
    ],
]);

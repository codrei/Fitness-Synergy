<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';

$month = $_GET['month'] ?? date('m');
$year  = $_GET['year']  ?? date('Y');

// Member payments
$stmt = $conn->prepare("
    SELECT 
        p.payment_id, p.payment_date,
        m.full_name, m.dob, m.discount_type,
        TIMESTAMPDIFF(YEAR, m.dob, CURDATE()) as age,
        pl.plan_name,
        p.amount, p.cash_amount, p.gcash_amount, p.maya_amount,
        p.debit_amount, p.credit_amount,
        p.payment_method, p.reference_number,
        'Member' as customer_type
    FROM payments p
    LEFT JOIN members m ON p.member_id = m.member_id
    LEFT JOIN plans pl ON p.plan_id = pl.plan_id
    WHERE MONTH(p.payment_date) = :month AND YEAR(p.payment_date) = :year
    ORDER BY p.payment_date ASC
");
$stmt->execute([':month' => $month, ':year' => $year]);
$member_payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Walk-in payments
$stmt2 = $conn->prepare("
    SELECT 
        w.walkin_id as payment_id, w.payment_date,
        w.guest_name as full_name, w.guest_age as age,
        NULL as dob, NULL as discount_type,
        CASE WHEN w.guest_age >= 60 THEN 'Senior' ELSE 'None' END as discount_type,
        pl.plan_name,
        w.amount, w.cash_amount, w.gcash_amount, w.maya_amount,
        w.debit_amount, w.credit_amount,
        NULL as payment_method, w.reference_number,
        'Walk-in' as customer_type
    FROM walk_ins w
    LEFT JOIN plans pl ON w.plan_id = pl.plan_id
    WHERE MONTH(w.payment_date) = :month AND YEAR(w.payment_date) = :year
    ORDER BY w.payment_date ASC
");
$stmt2->execute([':month' => $month, ':year' => $year]);
$walkin_payments = $stmt2->fetchAll(PDO::FETCH_ASSOC);

// All payments combined
$all_payments = array_merge($member_payments, $walkin_payments);
usort($all_payments, fn($a,$b) => strcmp($a['payment_date'], $b['payment_date']));

// Monthly breakdown
$stmt3 = $conn->prepare("
    SELECT MONTH(payment_date) as month_num,
           MONTHNAME(payment_date) as month_name,
           SUM(amount) as total, COUNT(*) as count
    FROM payments WHERE YEAR(payment_date) = :year
    GROUP BY MONTH(payment_date), MONTHNAME(payment_date)
    UNION ALL
    SELECT MONTH(payment_date), MONTHNAME(payment_date),
           SUM(amount), COUNT(*)
    FROM walk_ins WHERE YEAR(payment_date) = :year
    GROUP BY MONTH(payment_date), MONTHNAME(payment_date)
    ORDER BY month_num ASC
");
$stmt3->execute([':year' => $year]);
$monthly_raw = $stmt3->fetchAll(PDO::FETCH_ASSOC);

// Merge monthly by month_num
$monthly = [];
foreach ($monthly_raw as $r) {
    $key = $r['month_num'];
    if (!isset($monthly[$key])) {
        $monthly[$key] = ['month_num' => $r['month_num'], 'month_name' => $r['month_name'], 'total' => 0, 'count' => 0];
    }
    $monthly[$key]['total'] += $r['total'];
    $monthly[$key]['count'] += $r['count'];
}
$monthly = array_values($monthly);

// Yearly breakdown
$yearly_members = $conn->query("SELECT YEAR(payment_date) as year, SUM(amount) as total, COUNT(*) as count FROM payments GROUP BY YEAR(payment_date)")->fetchAll(PDO::FETCH_ASSOC);
$yearly_walkins = $conn->query("SELECT YEAR(payment_date) as year, SUM(amount) as total, COUNT(*) as count FROM walk_ins GROUP BY YEAR(payment_date)")->fetchAll(PDO::FETCH_ASSOC);
$yearly_map = [];
foreach (array_merge($yearly_members, $yearly_walkins) as $r) {
    $y = $r['year'];
    if (!isset($yearly_map[$y])) $yearly_map[$y] = ['year' => $y, 'total' => 0, 'count' => 0];
    $yearly_map[$y]['total'] += $r['total'];
    $yearly_map[$y]['count'] += $r['count'];
}
ksort($yearly_map);
$yearly = array_values($yearly_map);

// Overview totals
$today_m = $conn->query("SELECT COALESCE(SUM(amount),0) as t FROM payments WHERE DATE(payment_date)=CURDATE()")->fetch()['t'];
$today_w = $conn->query("SELECT COALESCE(SUM(amount),0) as t FROM walk_ins WHERE DATE(payment_date)=CURDATE()")->fetch()['t'];
$month_m = $conn->query("SELECT COALESCE(SUM(amount),0) as t FROM payments WHERE MONTH(payment_date)=MONTH(CURDATE()) AND YEAR(payment_date)=YEAR(CURDATE())")->fetch()['t'];
$month_w = $conn->query("SELECT COALESCE(SUM(amount),0) as t FROM walk_ins WHERE MONTH(payment_date)=MONTH(CURDATE()) AND YEAR(payment_date)=YEAR(CURDATE())")->fetch()['t'];
$year_m  = $conn->query("SELECT COALESCE(SUM(amount),0) as t FROM payments WHERE YEAR(payment_date)=YEAR(CURDATE())")->fetch()['t'];
$year_w  = $conn->query("SELECT COALESCE(SUM(amount),0) as t FROM walk_ins WHERE YEAR(payment_date)=YEAR(CURDATE())")->fetch()['t'];
$all_m   = $conn->query("SELECT COALESCE(SUM(amount),0) as t FROM payments")->fetch()['t'];
$all_w   = $conn->query("SELECT COALESCE(SUM(amount),0) as t FROM walk_ins")->fetch()['t'];

echo json_encode([
    'success'         => true,
    'payments'        => $all_payments,
    'member_payments' => $member_payments,
    'walkin_payments' => $walkin_payments,
    'monthly'         => $monthly,
    'yearly'          => $yearly,
    'total'           => array_sum(array_column($all_payments, 'amount')),
    'overview'        => [
        'today'      => $today_m + $today_w,
        'this_month' => $month_m + $month_w,
        'this_year'  => $year_m + $year_w,
        'all_time'   => $all_m + $all_w,
    ],
]);
?>
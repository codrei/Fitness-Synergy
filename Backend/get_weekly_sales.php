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

// Fetch all daily totals for the month
$stmt = $conn->prepare("
    SELECT DATE(payment_date) AS date, SUM(amount) AS total
    FROM payments
    WHERE MONTH(payment_date) = :month AND YEAR(payment_date) = :year
    GROUP BY DATE(payment_date)
    ORDER BY DATE(payment_date)
");
$stmt->execute([':month' => $month, ':year' => $year]);
$daily_rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Index by day number for quick lookup
$by_day = [];
foreach ($daily_rows as $row) {
    $day = (int) date('j', strtotime($row['date']));
    $by_day[$day] = (float) $row['total'];
}

$days_in_month = (int) date('t', mktime(0, 0, 0, $month, 1, $year));

// Build weeks: 1-7, 8-14, 15-21, 22-28, 29-end
$week_ranges = [
    [1, 7],
    [8, 14],
    [15, 21],
    [22, 28],
    [29, $days_in_month],
];

$weeks = [];
$running_mtd = 0.0;
foreach ($week_ranges as $idx => [$start, $end]) {
    if ($start > $days_in_month) continue;
    $end = min($end, $days_in_month);

    $days = [];
    $week_total = 0.0;
    for ($d = $start; $d <= $end; $d++) {
        $date_str = sprintf('%04d-%02d-%02d', $year, $month, $d);
        $amt = $by_day[$d] ?? 0.0;
        $days[] = ['day' => $d, 'date' => $date_str, 'total' => $amt];
        $week_total += $amt;
    }
    $running_mtd += $week_total;

    $weeks[] = [
        'week'       => $idx + 1,
        'start_day'  => $start,
        'end_day'    => $end,
        'days'       => $days,
        'week_total' => $week_total,
        'mtd'        => $running_mtd,
    ];
}

// Fetch monthly target
$target = 0.0;
try {
    $t_stmt = $conn->prepare("SELECT target_amount FROM monthly_targets WHERE month = :m AND year = :y");
    $t_stmt->execute([':m' => $month, ':y' => $year]);
    $t_row = $t_stmt->fetch(PDO::FETCH_ASSOC);
    $target = $t_row ? (float) $t_row['target_amount'] : 0.0;
} catch (Exception $e) {
    $target = 0.0;
}

$final_mtd = $running_mtd;

echo json_encode([
    'success'   => true,
    'month'     => $month,
    'year'      => $year,
    'weeks'     => $weeks,
    'mtd'       => $final_mtd,
    'target'    => $target,
    'remaining' => max(0, $target - $final_mtd),
]);

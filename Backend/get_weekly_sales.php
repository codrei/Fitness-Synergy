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

try {
    // Single query: bucket every payment into one of 5 week ranges and sum per day.
    // Week ranges mirror Ellen's weekly sales report (1-7, 8-14, 15-21, 22-28, 29-end).
    $stmt = $conn->prepare("
        SELECT
            CASE
                WHEN DAY(payment_date) BETWEEN 1  AND 7  THEN 1
                WHEN DAY(payment_date) BETWEEN 8  AND 14 THEN 2
                WHEN DAY(payment_date) BETWEEN 15 AND 21 THEN 3
                WHEN DAY(payment_date) BETWEEN 22 AND 28 THEN 4
                ELSE 5
            END                AS week_num,
            DAY(payment_date)  AS day_num,
            DATE(payment_date) AS date,
            SUM(amount)        AS total
        FROM payments
        WHERE MONTH(payment_date) = :month AND YEAR(payment_date) = :year
        GROUP BY week_num, day_num, date
        ORDER BY day_num
    ");
    $stmt->execute([':month' => $month, ':year' => $year]);
    $daily_rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $days_in_month = (int) date('t', mktime(0, 0, 0, $month, 1, $year));

    $week_ranges = [
        1 => [1, 7],
        2 => [8, 14],
        3 => [15, 21],
        4 => [22, 28],
        5 => [29, $days_in_month],
    ];

    // Index DB results by day for O(1) lookup.
    $by_day = [];
    foreach ($daily_rows as $row) {
        $by_day[(int)$row['day_num']] = (float)$row['total'];
    }

    $weeks = [];
    $running_mtd = 0.0;
    foreach ($week_ranges as $idx => [$start, $end]) {
        if ($start > $days_in_month) continue;
        $end = min($end, $days_in_month);

        $days = [];
        $week_total = 0.0;
        for ($d = $start; $d <= $end; $d++) {
            $amt = $by_day[$d] ?? 0.0;
            $days[] = [
                'day'   => $d,
                'date'  => sprintf('%04d-%02d-%02d', $year, $month, $d),
                'total' => $amt,
            ];
            $week_total += $amt;
        }
        $running_mtd += $week_total;

        $weeks[] = [
            'week'       => $idx,
            'start_day'  => $start,
            'end_day'    => $end,
            'days'       => $days,
            'week_total' => $week_total,
            'mtd'        => $running_mtd,
        ];
    }

    // Monthly target lookup. Missing target is not an error — just defaults to 0.
    $target = 0.0;
    $t_stmt = $conn->prepare("SELECT target_amount FROM monthly_targets WHERE month = :m AND year = :y");
    $t_stmt->execute([':m' => $month, ':y' => $year]);
    $t_row = $t_stmt->fetch(PDO::FETCH_ASSOC);
    $target = $t_row ? (float)$t_row['target_amount'] : 0.0;

    echo json_encode([
        'success'   => true,
        'month'     => $month,
        'year'      => $year,
        'weeks'     => $weeks,
        'mtd'       => $running_mtd,
        'target'    => $target,
        'remaining' => max(0, $target - $running_mtd),
    ]);
} catch (PDOException $e) {
    error_log('[get_weekly_sales] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to fetch weekly sales.']);
}

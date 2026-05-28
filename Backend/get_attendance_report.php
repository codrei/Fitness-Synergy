<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

try {
    $month = $_GET['month'] ?? date('m');
    $year  = $_GET['year']  ?? date('Y');

    // Daily visit counts for the selected month
    $daily = $conn->prepare("
        SELECT DATE(time_in) as visit_date,
               COUNT(*) as total,
               SUM(CASE WHEN type = 'Member' THEN 1 ELSE 0 END) as members,
               SUM(CASE WHEN type = 'Walk-in' THEN 1 ELSE 0 END) as walkins
        FROM (
            SELECT time_in, 'Member' as type FROM attendance
            WHERE MONTH(time_in) = :month AND YEAR(time_in) = :year
            UNION ALL
            SELECT COALESCE(created_at, payment_date) as time_in, 'Walk-in' as type FROM payments
            WHERE customer_type = 'Walk-in'
            AND MONTH(payment_date) = :month AND YEAR(payment_date) = :year
        ) combined
        GROUP BY DATE(time_in)
        ORDER BY visit_date ASC
    ");
    $daily->execute([':month' => $month, ':year' => $year]);
    $dailyData = $daily->fetchAll(PDO::FETCH_ASSOC);

    // Peak hours
    $hours = $conn->prepare("
        SELECT HOUR(time_in) as hour, COUNT(*) as total
        FROM (
            SELECT time_in FROM attendance
            WHERE MONTH(time_in) = :month AND YEAR(time_in) = :year
            UNION ALL
            SELECT created_at as time_in FROM payments
            WHERE customer_type = 'Walk-in'
            AND MONTH(payment_date) = :month AND YEAR(payment_date) = :year
        ) combined
        GROUP BY HOUR(time_in)
        ORDER BY hour ASC
    ");
    $hours->execute([':month' => $month, ':year' => $year]);
    $hourData = $hours->fetchAll(PDO::FETCH_ASSOC);

    // Most active days of week
    $weekdays = $conn->prepare("
        SELECT DAYNAME(time_in) as day_name,
               DAYOFWEEK(time_in) as day_num,
               COUNT(*) as total
        FROM (
            SELECT time_in FROM attendance
            WHERE MONTH(time_in) = :month AND YEAR(time_in) = :year
            UNION ALL
            SELECT created_at as time_in FROM payments
            WHERE customer_type = 'Walk-in'
            AND MONTH(payment_date) = :month AND YEAR(payment_date) = :year
        ) combined
        GROUP BY DAYNAME(time_in), DAYOFWEEK(time_in)
        ORDER BY day_num ASC
    ");
    $weekdays->execute([':month' => $month, ':year' => $year]);
    $weekdayData = $weekdays->fetchAll(PDO::FETCH_ASSOC);

    // Top members by visit frequency
    $topMembers = $conn->prepare("
        SELECT m.full_name, COUNT(*) as visits
        FROM attendance a
        JOIN members m ON a.member_id = m.member_id
        WHERE MONTH(a.time_in) = :month AND YEAR(a.time_in) = :year
        GROUP BY a.member_id, m.full_name
        ORDER BY visits DESC
        LIMIT 10
    ");
    $topMembers->execute([':month' => $month, ':year' => $year]);
    $topMembersData = $topMembers->fetchAll(PDO::FETCH_ASSOC);

    // Summary totals
    $totalMembers = array_sum(array_column($dailyData, 'members'));
    $totalWalkins = array_sum(array_column($dailyData, 'walkins'));
    $totalVisits  = $totalMembers + $totalWalkins;
    $avgPerDay    = count($dailyData) > 0 ? round($totalVisits / count($dailyData), 1) : 0;
    $peakHour     = count($hourData) > 0 ? array_reduce($hourData, fn($a, $b) => $a['total'] > $b['total'] ? $a : $b) : null;
    $peakDay      = count($weekdayData) > 0 ? array_reduce($weekdayData, fn($a, $b) => $a['total'] > $b['total'] ? $a : $b) : null;

    echo json_encode([
        'success'     => true,
        'daily'       => $dailyData,
        'hours'       => $hourData,
        'weekdays'    => $weekdayData,
        'top_members' => $topMembersData,
        'summary'     => [
            'total_visits'   => $totalVisits,
            'total_members'  => $totalMembers,
            'total_walkins'  => $totalWalkins,
            'avg_per_day'    => $avgPerDay,
            'peak_hour'      => $peakHour ? $peakHour['hour'] : null,
            'peak_day'       => $peakDay ? $peakDay['day_name'] : null,
        ],
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
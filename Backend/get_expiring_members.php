<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

// Returns members expiring in the next 7 days, grouped into urgency tiers:
//   - today   : expires today or tomorrow
//   - soon    : 2-3 days
//   - week    : 4-7 days
//   - contacted: already reached out to in the last 14 days (any tier)
//
// "contacted" lives in its own bucket so the manager can see at a glance
// which members have outreach in flight vs. still need a call.

try {
    $stmt = $conn->prepare("
        SELECT
            m.member_id,
            m.full_name,
            m.contact_number,
            m.contract_id,
            m.expiration_date,
            m.renewal_contacted_at,
            m.plan_id,
            pl.plan_name,
            pl.price AS plan_price,
            DATEDIFF(m.expiration_date, CURRENT_DATE()) AS days_left
        FROM members m
        LEFT JOIN plans pl ON m.plan_id = pl.plan_id
        WHERE m.expiration_date IS NOT NULL
          AND m.expiration_date >= CURRENT_DATE()
          AND m.expiration_date <= DATE_ADD(CURRENT_DATE(), INTERVAL 7 DAY)
        ORDER BY m.expiration_date ASC, m.full_name ASC
    ");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $tiers = ['today' => [], 'soon' => [], 'week' => [], 'contacted' => []];
    $now = time();
    $contactedThreshold = 14 * 24 * 3600; // 14 days

    foreach ($rows as $row) {
        $days = (int) $row['days_left'];
        $row['days_left'] = $days;

        // Determine if "recently contacted" — within the last 14 days
        $recent = false;
        if (!empty($row['renewal_contacted_at'])) {
            $contactedTs = strtotime($row['renewal_contacted_at']);
            if ($contactedTs && ($now - $contactedTs) < $contactedThreshold) {
                $recent = true;
            }
        }

        if ($recent) {
            $tiers['contacted'][] = $row;
            continue;
        }

        if ($days <= 1)      $tiers['today'][] = $row;
        elseif ($days <= 3)  $tiers['soon'][]  = $row;
        else                 $tiers['week'][]  = $row;
    }

    $counts = [
        'today'     => count($tiers['today']),
        'soon'      => count($tiers['soon']),
        'week'      => count($tiers['week']),
        'contacted' => count($tiers['contacted']),
        'total'     => count($rows),
    ];

    echo json_encode(['success' => true, 'tiers' => $tiers, 'counts' => $counts]);
} catch (PDOException $e) {
    error_log('[get_expiring_members] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to load expiring members.']);
}

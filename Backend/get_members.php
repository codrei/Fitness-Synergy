<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

try {
    $members = $conn->query("
        SELECT m.*, p.plan_name, 'Member' AS client_type
        FROM members m
        LEFT JOIN plans p ON m.plan_id = p.plan_id
    ")->fetchAll(PDO::FETCH_ASSOC);

    // Walk-in aggregation: group by the indexed generated `walkin_key` column
    // (contact when available, else "name:<lowercase>"). Keeps guest_name in the
    // GROUP BY so different-case spellings stay distinct rows, mirroring old behavior.
    $walkins = $conn->query("
        SELECT
            CONCAT('wi_', MIN(p.payment_id)) AS member_id,
            p.guest_name                     AS full_name,
            p.guest_contact                  AS contact_number,
            MAX(pl.plan_name)                AS plan_name,
            NULL                             AS expiration_date,
            NULL                             AS status,
            'Walk-in'                        AS client_type,
            COUNT(*)                         AS total_visits,
            MAX(p.payment_date)              AS last_visit
        FROM payments p
        LEFT JOIN plans pl ON p.plan_id = pl.plan_id
        WHERE p.customer_type = 'Walk-in'
        GROUP BY p.walkin_key, p.guest_name
        ORDER BY last_visit DESC
    ")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(array_merge($members, $walkins));
} catch (PDOException $e) {
    error_log('[get_members] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Failed to load members."]);
}

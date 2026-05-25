<?php
require_once 'cors.php';

require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

try {
    $members = $conn->query("
        SELECT m.*, p.plan_name, 'Member' AS client_type
        FROM members m
        LEFT JOIN plans p ON m.plan_id = p.plan_id
    ")->fetchAll(PDO::FETCH_ASSOC);

    $walkins = $conn->query("
        SELECT
            CONCAT('wi_', COALESCE(guest_contact, CAST(MIN(payment_id) AS CHAR))) AS member_id,
            guest_name AS full_name,
            guest_contact AS contact_number,
            pl.plan_name,
            NULL AS expiration_date,
            NULL AS status,
            'Walk-in' AS client_type,
            COUNT(*) AS total_visits,
            MAX(payment_date) AS last_visit
        FROM payments p
        LEFT JOIN plans pl ON p.plan_id = pl.plan_id
        WHERE p.customer_type = 'Walk-in'
        GROUP BY COALESCE(guest_contact, CAST(payment_id AS CHAR)), guest_name, p.plan_id, pl.plan_name
        ORDER BY last_visit DESC
    ")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(array_merge($members, $walkins));
} catch (PDOException $e) {
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}

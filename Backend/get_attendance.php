<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight "OPTIONS" requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

try {
    $query = $conn->query("
        SELECT attendance.member_id, members.full_name, attendance.time_in, 'Member' AS type
        FROM attendance
        JOIN members ON attendance.member_id = members.member_id
        WHERE DATE(attendance.time_in) = CURRENT_DATE()
        UNION ALL
        SELECT NULL, guest_name, created_at, 'Walk-in'
        FROM walk_ins
        WHERE DATE(payment_date) = CURRENT_DATE()
        ORDER BY time_in DESC
    ");

    echo json_encode($query->fetchAll(PDO::FETCH_ASSOC));
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
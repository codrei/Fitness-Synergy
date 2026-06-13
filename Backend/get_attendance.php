<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");

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
        SELECT NULL AS member_id, guest_name AS full_name, COALESCE(created_at, NOW()) AS time_in, 'Walk-in' AS type
        FROM payments
        WHERE customer_type = 'Walk-in' AND DATE(payment_date) = CURRENT_DATE()
        ORDER BY time_in DESC
    ");

    echo json_encode($query->fetchAll(PDO::FETCH_ASSOC));
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to load attendance."]);
}
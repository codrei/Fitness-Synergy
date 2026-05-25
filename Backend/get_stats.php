<?php
require_once 'cors.php';

// Handle preflight "OPTIONS" requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

try {
    $stats = [];
    $stats['total'] = (int) $conn->query("SELECT COUNT(*) FROM members")->fetchColumn();
    $stats['active']  = (int) $conn->query("SELECT COUNT(*) FROM members WHERE expiration_date >= CURRENT_DATE() OR expiration_date IS NULL")->fetchColumn();
    $stats['expired'] = (int) $conn->query("SELECT COUNT(*) FROM members WHERE expiration_date < CURRENT_DATE() AND expiration_date IS NOT NULL")->fetchColumn();
    $stats['checkins'] = (int) $conn->query("
        SELECT (SELECT COUNT(*) FROM attendance WHERE DATE(time_in) = CURRENT_DATE())
             + (SELECT COUNT(*) FROM payments WHERE customer_type = 'Walk-in' AND DATE(payment_date) = CURRENT_DATE())
    ")->fetchColumn();
    $stats['revenue'] = (float) $conn->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE MONTH(payment_date) = MONTH(CURRENT_DATE()) AND YEAR(payment_date) = YEAR(CURRENT_DATE())")->fetchColumn();

    echo json_encode($stats);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
}
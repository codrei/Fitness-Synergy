<?php
header("Access-Control-Allow-Origin: *");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");

// 1. Force PHP into Philippine Time
date_default_timezone_set('Asia/Manila');

try {
    $conn = new PDO("mysql:host=sql303.infinityfree.com;dbname=if0_41975335_fitnesssynergy;charset=utf8mb4", "if0_41975335", "l0s6Y0PVPO");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // 2. Force the MySQL Database session into Philippine Time (UTC+8)
    // This ensures CURRENT_DATE() matches the Batangas gym's physical reality
    $conn->exec("SET time_zone = '+08:00';");
    
    $stats = [];

    // Total Members
    $stats['total'] = (int) $conn->query("SELECT COUNT(*) FROM members")->fetchColumn();

    // Active Members (Expiration is today or in the future)
    $stats['active'] = (int) $conn->query("SELECT COUNT(*) FROM members WHERE expiration_date >= CURRENT_DATE()")->fetchColumn();

    // Expired Members (Expiration is strictly in the past)
    $stats['expired'] = (int) $conn->query("SELECT COUNT(*) FROM members WHERE expiration_date < CURRENT_DATE()")->fetchColumn();

    // Today's Check-ins
    $stats['checkins'] = (int) $conn->query("SELECT COUNT(*) FROM attendance WHERE DATE(time_in) = CURRENT_DATE()")->fetchColumn();

    // Monthly Revenue
    $stats['revenue'] = (float) $conn->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE MONTH(payment_date) = MONTH(CURRENT_DATE()) AND YEAR(payment_date) = YEAR(CURRENT_DATE())")->fetchColumn();

    echo json_encode($stats);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
}
?>
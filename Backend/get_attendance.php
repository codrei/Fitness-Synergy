<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle CORS Preflight for React
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. Force PHP into Philippine Time
date_default_timezone_set('Asia/Manila');

try {
    $conn = new PDO("mysql:host=sql303.infinityfree.com;dbname=if0_41873855_ironforgegym;charset=utf8mb4", "if0_41873855", "NK92T3vwsKKoXp");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // 2. Force Database into Philippine Time
    $conn->exec("SET time_zone = '+08:00';");
    
    // 3. We join the tables AND filter so it strictly ONLY shows today's visits
    $query = $conn->query("
        SELECT members.full_name, attendance.time_in 
        FROM attendance 
        JOIN members ON attendance.member_id = members.member_id 
        WHERE DATE(attendance.time_in) = CURRENT_DATE()
        ORDER BY attendance.time_in DESC 
    ");
    
    $logs = $query->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($logs);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. Force PHP into Philippine Time
date_default_timezone_set('Asia/Manila');

// We check if an 'id' was passed in the URL (e.g., ?id=5)
if (isset($_GET['id'])) {
    try {
        $conn = new PDO("mysql:host=sql303.infinityfree.com;dbname=if0_41975335_fitnesssynergy;charset=utf8mb4", "if0_41975335", "l0s6Y0PVPO");
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // 2. Force Database into Philippine Time
        $conn->exec("SET time_zone = '+08:00';");
        
        // Grab all check-ins for this specific member, newest first
        $query = $conn->prepare("SELECT time_in FROM attendance WHERE member_id = :id ORDER BY time_in DESC");
        $query->execute([':id' => $_GET['id']]);
        
        $logs = $query->fetchAll(PDO::FETCH_ASSOC);
        
        // Send back the logs AND the total count
        echo json_encode(["success" => true, "logs" => $logs, "total" => count($logs)]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "error" => "No member ID provided"]);
}
?>
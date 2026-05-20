<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");
date_default_timezone_set('Asia/Manila');

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->full_name)) {
    try {
        $conn = new PDO("mysql:host=sql303.infinityfree.com;dbname=if0_41975335_fitnesssynergy;charset=utf8mb4", "if0_41975335", "l0s6Y0PVPO");
        $conn->exec("SET time_zone = '+08:00';");
        $plan_id = !empty($data->plan_id) ? (int)$data->plan_id : 1;

        // Added start_date to the INSERT query
        $query = $conn->prepare("
            INSERT INTO members (full_name, plan_id, start_date, expiration_date) 
            VALUES (:name, :plan, CURRENT_DATE(), DATE_ADD(CURRENT_DATE(), INTERVAL (SELECT duration_days FROM plans WHERE plan_id = :plan) DAY))
        ");
        $query->execute([':name' => $data->full_name, ':plan' => $plan_id]);

        echo json_encode(["success" => true, "message" => "Member added!"]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
?>
<?php
date_default_timezone_set('Asia/Manila');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->full_name)) {
    try {
        $conn = new PDO("mysql:host=sql303.infinityfree.com;dbname=if0_41873855_ironforgegym", "if0_41873855", "NK92T3vwsKKoXp");
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
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

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->member_id) && !empty($data->full_name)) {
    try {
        $conn = new PDO("mysql:host=sql303.infinityfree.com;dbname=if0_41873855_ironforgegym;charset=utf8mb4", "if0_41873855", "NK92T3vwsKKoXp");
        $plan_id = !empty($data->plan_id) ? (int)$data->plan_id : 1;

        // Added start_date to the UPDATE query
        $query = $conn->prepare("
            UPDATE members 
            SET full_name = :name, 
                plan_id = :plan, 
                start_date = CURRENT_DATE(),
                expiration_date = DATE_ADD(CURRENT_DATE(), INTERVAL (SELECT duration_days FROM plans WHERE plan_id = :plan) DAY) 
            WHERE member_id = :id
        ");
        $query->execute([':name' => $data->full_name, ':plan' => $plan_id, ':id' => $data->member_id]);

        echo json_encode(["success" => true, "message" => "Member updated!"]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
?>
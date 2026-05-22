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

if (!empty($data->full_name)) {

    try {

        // DATABASE CONNECTION
        $conn = new PDO(
            "mysql:host=sql303.infinityfree.com;dbname=if0_41975335_fitnesssynergy;charset=utf8mb4",
            "if0_41975335",
            "l0s6Y0PVPO"
        );

        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // GET PLAN ID
        $plan_id = !empty($data->plan_id) ? (int)$data->plan_id : 1;

        // GET PLAN DURATION
        $planQuery = $conn->prepare("
            SELECT duration_days
            FROM plans
            WHERE plan_id = :plan
        ");

        $planQuery->execute([
            ':plan' => $plan_id
        ]);

        $duration = (int)$planQuery->fetchColumn();

        // DAILY PLAN FIX
        if ($duration <= 1) {

            // Expires today
            $expirationDate = date('Y-m-d');

        } else {

            // Add duration days
            $expirationDate = date(
                'Y-m-d',
                strtotime("+$duration days")
            );
        }

        // INSERT MEMBER
        $query = $conn->prepare("
            INSERT INTO members (
                full_name,
                plan_id,
                start_date,
                expiration_date
            )
            VALUES (
                :name,
                :plan,
                CURRENT_DATE(),
                :expiration
            )
        ");

        $query->execute([
            ':name' => $data->full_name,
            ':plan' => $plan_id,
            ':expiration' => $expirationDate
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Member added successfully!"
        ]);

    } catch (PDOException $e) {

        echo json_encode([
            "success" => false,
            "error" => $e->getMessage()
        ]);
    }

} else {

    echo json_encode([
        "success" => false,
        "error" => "Missing member name."
    ]);
}
?>
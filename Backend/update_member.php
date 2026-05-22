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
    $conn = new PDO(
        "mysql:host=sql303.infinityfree.com;dbname=if0_41975335_fitnesssynergy;charset=utf8mb4",
        "if0_41975335",
        "l0s6Y0PVPO"
    );

    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $plan_id = !empty($data->plan_id) ? (int)$data->plan_id : 1;

    // GET PLAN DURATION
    $planQuery = $conn->prepare("
        SELECT duration_days 
        FROM plans 
        WHERE plan_id = :plan
    ");

    $planQuery->execute([':plan' => $plan_id]);

    $duration = (int)$planQuery->fetchColumn();

    // GET CURRENT MEMBER EXPIRATION
    $memberQuery = $conn->prepare("
        SELECT expiration_date 
        FROM members 
        WHERE member_id = :id
    ");

    $memberQuery->execute([':id' => $data->member_id]);

    $currentExpiration = $memberQuery->fetchColumn();

    $today = new DateTime();
    $baseDate = new DateTime();

    // IF CURRENT MEMBERSHIP IS STILL ACTIVE
    if ($currentExpiration && strtotime($currentExpiration) >= strtotime(date('Y-m-d'))) {
        $baseDate = new DateTime($currentExpiration);
    }

    // DAILY PLAN SPECIAL CASE
    if ($duration <= 1) {
        $expirationDate = date('Y-m-d');
    } else {
        $baseDate->modify("+$duration days");
        $expirationDate = $baseDate->format('Y-m-d');
    }

    // UPDATE MEMBER
    $query = $conn->prepare("
        UPDATE members 
        SET 
            full_name = :name,
            plan_id = :plan,
            start_date = CURRENT_DATE(),
            expiration_date = :expiration
        WHERE member_id = :id
    ");

    $query->execute([
        ':name' => $data->full_name,
        ':plan' => $plan_id,
        ':expiration' => $expirationDate,
        ':id' => $data->member_id
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Member renewed successfully!"
    ]);

} catch(PDOException $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
}
?>
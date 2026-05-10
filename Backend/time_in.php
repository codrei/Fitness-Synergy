<?php
// Handle CORS and Preflight
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. Force PHP into Philippine Time
date_default_timezone_set('Asia/Manila');

// Get the data sent from React
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->member_id)) {
    try {
        // Database Connection
        $conn = new PDO("mysql:host=sql303.infinityfree.com;dbname=if0_41873855_ironforgegym;charset=utf8", "if0_41873855", "NK92T3vwsKKoXp");
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // 2. Force Database into Philippine Time
        $conn->exec("SET time_zone = '+08:00';");

        // --- NEW: THE ACTIVE SESSION SAFEGUARD ---
        // Check if this member already has a log TODAY where time_out is still empty
        $check_sql = "SELECT log_id FROM attendance 
                      WHERE member_id = :member_id 
                      AND DATE(time_in) = CURRENT_DATE() 
                      AND time_out IS NULL 
                      LIMIT 1";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->execute([':member_id' => $data->member_id]);

        if ($check_stmt->rowCount() > 0) {
            // Member is already inside the gym! Block the duplicate.
            echo json_encode(["success" => false, "error" => "Member is already timed in. Please time out first."]);
        } else {
            // 3. Safe to Insert! Using NOW() synced to Batangas time
            $sql = "INSERT INTO attendance (member_id, time_in) VALUES (:member_id, NOW())";
            $stmt = $conn->prepare($sql);
            $stmt->execute([':member_id' => $data->member_id]);
            
            echo json_encode(["success" => true, "message" => "Time in successful."]);
        }
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "error" => "No member ID provided."]);
}
?>
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


// TODO: Replace YOUR_DB_PASSWORD with your actual InfinityFree vPanel password
$conn = new PDO("mysql:host=sql303.infinityfree.com;dbname=if0_41975335_fitnesssynergy;charset=utf8mb4", "if0_41975335", "l0s6Y0PVPO");

if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "Database Connection failed."]));
}

// Get the data sent from React
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->member_id)) {
    $member_id = $conn->real_escape_string($data->member_id);

    // Find the member's active session for today and set the time_out to NOW()
    $sql = "UPDATE attendance_logs 
            SET time_out = NOW() 
            WHERE member_id = '$member_id' 
            AND DATE(time_in) = CURDATE() 
            AND time_out IS NULL 
            ORDER BY time_in DESC LIMIT 1";

    if ($conn->query($sql) === TRUE) {
        if ($conn->affected_rows > 0) {
            echo json_encode(["success" => true, "message" => "Successfully timed out."]);
        } else {
            echo json_encode(["success" => false, "error" => "No active session found to time out. Ensure the member is timed in today."]);
        }
    } else {
        echo json_encode(["success" => false, "error" => "Query failed: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "error" => "No member ID provided."]);
}

$conn->close();
?>
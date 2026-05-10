<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// TODO: Replace YOUR_DB_PASSWORD with your actual InfinityFree vPanel password
$host = "sql303.infinityfree.com";
$db_name = "if0_41873855_ironforgegym";
$username = "if0_41873855";
$password = "YOUR_DB_PASSWORD"; 

$conn = new mysqli($host, $username, $password, $db_name);

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
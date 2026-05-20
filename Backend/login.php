<?php
// FORCE ERRORS TO SHOW
ini_set('display_errors', 1);
error_reporting(E_ALL);

// CORS HEADERS (The VIP Guest List)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
date_default_timezone_set('Asia/Manila');

// HANDLE PREFLIGHT
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

// 1. READ THE RAW JSON DATA FROM REACT
$json = file_get_contents('php://input');
$data = json_decode($json);

// 2. CHECK IF DATA EXISTS
if (!empty($data->username) && !empty($data->password)) {
    try {
        // DATABASE CONNECTION
        $conn = new PDO("mysql:host=sql303.infinityfree.com;dbname=if0_41975335_fitnesssynergy;charset=utf8mb4", "if0_41975335", "l0s6Y0PVPO");
        // Ensure PDO throws errors so we can catch them
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // 3. FIND THE USER
        $stmt = $conn->prepare("SELECT * FROM admins WHERE username = :user");
        $stmt->execute([':user' => $data->username]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        // 4. VERIFY PASSWORD
        if ($admin && password_verify($data->password, $admin['password'])) {
            echo json_encode(["success" => true, "message" => "Login successful!"]);
        } else {
            echo json_encode(["success" => false, "error" => "Incorrect username or password."]);
        }
    } catch(PDOException $e) {
        echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
    }
} else {
    // If React sent empty data or the JSON decode failed
    echo json_encode(["success" => false, "error" => "Please fill in all fields."]);
}
?>
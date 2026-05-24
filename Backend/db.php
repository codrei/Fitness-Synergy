<?php
// db.php - Keep this strictly for connection setup
date_default_timezone_set('Asia/Manila');

$host = "127.0.0.1";
$dbname = "if0_41975335_fitnesssynergy"; 
$username = "root";
$password = ""; 

try {
    $conn = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4", 
        $username, 
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4, time_zone = '+08:00'"
        ]
    );
} catch (PDOException $e) {
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Database connection failed: " . $e->getMessage()
    ]);
    exit();
}
?>
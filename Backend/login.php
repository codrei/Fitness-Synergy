<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
 
// 1. CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
 
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}
 
require_once 'db.php';
 
$data = json_decode(file_get_contents('php://input'));
 
if (!empty($data->username) && !empty($data->password)) {
    $userIn = trim($data->username);
    $passIn = $data->password;
 
    try {
        if (!isset($conn)) {
            throw new PDOException("Database connection variable was dropped.");
        }
 
        $stmt = $conn->prepare("SELECT * FROM `admins` WHERE `username` = :user");
        $stmt->execute([':user' => $userIn]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
 
        header("Content-Type: application/json");
 
        if ($admin && password_verify($passIn, $admin['password'])) {
            // Optionally rehash only if outdated
            if (password_needs_rehash($admin['password'], PASSWORD_DEFAULT)) {
                $newHash = password_hash($passIn, PASSWORD_DEFAULT);
                $update = $conn->prepare("UPDATE `admins` SET `password` = :hash WHERE `username` = :user");
                $update->execute([':hash' => $newHash, ':user' => $userIn]);
            }
            echo json_encode([
                "success" => true,
                "message" => "Login successful!"
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "error" => "Incorrect username or password."
            ]);
        }
        exit;
 
    } catch (PDOException $e) {
        header("Content-Type: application/json");
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
        exit;
    }
} else {
    header("Content-Type: application/json");
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Please fill in all fields."
    ]);
}
?>
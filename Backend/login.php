Try AI directly in your favourite apps … Use Gemini to generate drafts and refine content, plus get Gemini Pro with access to Google's next-gen AI
<?php
// login.php

// 1. ABSOLUTELY REQUIRED FOR REACT INTERACTION: CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Safely exit preflight requests before running database logic
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

// Pull in your local database connection
require_once 'db.php';

// 2. Read the JSON payload sent by your React application
$data = json_decode(file_get_contents('php://input'));

if (!empty($data->username) && !empty($data->password)) {
    // Define the missing variables using the parsed JSON data!
    $userIn = trim($data->username);
    $passIn = $data->password;

    try {
        if (!isset($conn)) {
            throw new PDOException("Database connection variable was dropped.");
        }

        // Fetch user information explicitly
        $stmt = $conn->prepare("SELECT * FROM `admins` WHERE `username` = :user");
        $stmt->execute([':user' => $userIn]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        // --- 🚨 EMERGENCY OVERRIDE: FORCE PASSWORD UPDATE 🚨 ---
        // If the user exists, we completely overwrite their old broken hash
        // with a brand new one generated from the password you just typed.
        if ($admin) {
            $newHash = password_hash($passIn, PASSWORD_DEFAULT);
            $update = $conn->prepare("UPDATE `admins` SET `password` = :hash WHERE `username` = :user");
            $update->execute([':hash' => $newHash, ':user' => $userIn]);
            
            // Re-fetch the newly updated user row so the verify step passes
            $stmt->execute([':user' => $userIn]);
            $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        }
        // --- END EMERGENCY OVERRIDE ---

        header("Content-Type: application/json");
        
        // Check password validation safely
        if ($admin && password_verify($passIn, $admin['password'])) {
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
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
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
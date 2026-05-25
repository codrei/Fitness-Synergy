<?php
require_once 'cors.php';

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

        // Create sessions table on first use if it does not exist
        $conn->exec("CREATE TABLE IF NOT EXISTS `sessions` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `session_token` VARCHAR(64) NOT NULL UNIQUE,
            `admin_id` INT NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `expires_at` TIMESTAMP NOT NULL,
            INDEX (`session_token`)
        )");

        $stmt = $conn->prepare("SELECT * FROM `admins` WHERE `username` = :user");
        $stmt->execute([':user' => $userIn]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        header("Content-Type: application/json");

        if ($admin && password_verify($passIn, $admin['password'])) {
            $token   = bin2hex(random_bytes(32));
            $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));

            $insertSession = $conn->prepare(
                "INSERT INTO sessions (session_token, admin_id, expires_at) VALUES (:token, :admin_id, :expires)"
            );
            $insertSession->execute([
                ':token'    => $token,
                ':admin_id' => $admin['admin_id'],
                ':expires'  => $expires,
            ]);

            echo json_encode([
                "success" => true,
                "message" => "Login successful!",
                "token"   => $token,
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "error"   => "Incorrect username or password.",
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
        "error"   => "Please fill in all fields.",
    ]);
}

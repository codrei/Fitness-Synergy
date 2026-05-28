<?php
require_once 'cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';

$data = json_decode(file_get_contents('php://input'));

if (!$data || empty($data->username) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Please fill in all fields."]);
    exit;
}

$userIn = trim($data->username);
$passIn = $data->password;

try {
    $stmt = $conn->prepare("SELECT * FROM admins WHERE username = :user LIMIT 1");
    $stmt->execute([':user' => $userIn]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($admin && password_verify($passIn, $admin['password'])) {
        $token   = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));

        $stmt = $conn->prepare(
            "INSERT INTO sessions (session_token, admin_id, expires_at) VALUES (:token, :admin_id, :expires)"
        );
        $stmt->execute([
            ':token'    => $token,
            ':admin_id' => $admin['admin_id'],
            ':expires'  => $expires,
        ]);

        echo json_encode(["success" => true, "token" => $token]);
    } else {
        echo json_encode(["success" => false, "error" => "Incorrect username or password."]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
}
exit;
<?php
require_once 'cors.php';
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
$ip     = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

try {
    // ── Rate limit: max 5 failed attempts per IP within the last 15 minutes ──
    $rateStmt = $conn->prepare("
        SELECT COUNT(*) FROM login_attempts
        WHERE ip_address = :ip
          AND success = 0
          AND attempted_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
    ");
    $rateStmt->execute([':ip' => $ip]);
    if ((int)$rateStmt->fetchColumn() >= 5) {
        http_response_code(429);
        echo json_encode([
            "success" => false,
            "error"   => "Too many failed attempts. Please try again in 15 minutes.",
        ]);
        exit;
    }

    $stmt = $conn->prepare("SELECT * FROM admins WHERE username = :user LIMIT 1");
    $stmt->execute([':user' => $userIn]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    $recordAttempt = $conn->prepare(
        "INSERT INTO login_attempts (ip_address, success) VALUES (:ip, :ok)"
    );

    // Timing-attack mitigation: run password_verify against a dummy bcrypt hash
    // when no matching admin is found, so response time is the same as a real
    // wrong-password verification (~100ms bcrypt cost). Without this, attackers
    // can enumerate valid usernames by measuring response time.
    $DUMMY_HASH = '$2y$10$abcdefghijklmnopqrstuuJ8nM8.5gXhqKZSrM3RoEugb1nXTbsCMy';
    $passwordValid = $admin
        ? password_verify($passIn, $admin['password'])
        : (password_verify($passIn, $DUMMY_HASH) && false);

    if ($admin && $passwordValid) {
        $recordAttempt->execute([':ip' => $ip, ':ok' => 1]);

        // Clean up this admin's expired sessions before issuing a new one
        $conn->prepare("DELETE FROM sessions WHERE admin_id = :id AND expires_at < NOW()")
             ->execute([':id' => $admin['admin_id']]);

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

        echo json_encode(["success" => true, "token" => $token]);
    } else {
        $recordAttempt->execute([':ip' => $ip, ':ok' => 0]);
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "Incorrect username or password."]);
    }

} catch (PDOException $e) {
    error_log('[login] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Server error. Please try again."]);
}
exit;

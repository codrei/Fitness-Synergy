<?php
// Backend/update_admin_profile.php

require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';
require_once 'auth_check.php';
require_once 'audit.php';

$session  = requireAuth();
$admin_id = $session['admin_id'] ?? 1;

$raw  = file_get_contents("php://input");
$data = json_decode($raw);

if (!$data) {
    echo json_encode(["success" => false, "error" => "Invalid request payload."]);
    exit;
}

$newUsername     = isset($data->username)        ? trim($data->username)   : '';
$currentPassword = isset($data->currentPassword) ? $data->currentPassword : '';
$newPassword     = isset($data->newPassword)     ? $data->newPassword     : '';

if (empty($currentPassword)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Current password is required."]);
    exit;
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

try {
    // Same rate limit policy as login: max 5 failed password verifications per IP
    // in the last 15 minutes. Reuses the login_attempts table with a distinct
    // action prefix so it doesn't collide with login counters.
    $rateStmt = $conn->prepare("
        SELECT COUNT(*) FROM login_attempts
        WHERE ip_address = :ip
          AND success = 0
          AND attempted_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
    ");
    $rateStmt->execute([':ip' => 'pwchange:' . $ip]);
    if ((int)$rateStmt->fetchColumn() >= 5) {
        http_response_code(429);
        echo json_encode([
            "success" => false,
            "error"   => "Too many failed attempts. Please try again in 15 minutes.",
        ]);
        exit;
    }

    $stmt = $conn->prepare("SELECT username, password FROM admins WHERE admin_id = :id");
    $stmt->execute([':id' => $admin_id]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    $recordAttempt = $conn->prepare(
        "INSERT INTO login_attempts (ip_address, success) VALUES (:ip, :ok)"
    );

    if (!$admin) {
        $recordAttempt->execute([':ip' => 'pwchange:' . $ip, ':ok' => 0]);
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Admin account not found."]);
        exit;
    }

    if (!password_verify($currentPassword, $admin['password'])) {
        $recordAttempt->execute([':ip' => 'pwchange:' . $ip, ':ok' => 0]);
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "Current password is incorrect."]);
        exit;
    }
    // Record the successful verification so the counter resets cleanly.
    $recordAttempt->execute([':ip' => 'pwchange:' . $ip, ':ok' => 1]);

    $updateFields = [];
    $bindings     = [];

    if (!empty($newUsername) && $newUsername !== $admin['username']) {
        $updateFields[]        = "username = :username";
        $bindings[':username'] = $newUsername;
    }

    $passwordChanged = false;
    if (!empty($newPassword)) {
        $updateFields[]        = "password = :password";
        $bindings[':password'] = password_hash($newPassword, PASSWORD_BCRYPT);
        $passwordChanged       = true;
    }

    if (empty($updateFields)) {
        echo json_encode(["success" => false, "error" => "No changes detected."]);
        exit;
    }

    $sql             = "UPDATE admins SET " . implode(", ", $updateFields) . " WHERE admin_id = :id";
    $bindings[':id'] = $admin_id;

    $conn->prepare($sql)->execute($bindings);

    // Invalidate all sessions after credential change so old tokens stop working
    if ($passwordChanged) {
        $conn->prepare("DELETE FROM sessions WHERE admin_id = :id")
             ->execute([':id' => $admin_id]);
    }

    $changes = [];
    if (!empty($newUsername) && $newUsername !== $admin['username']) $changes[] = "username → $newUsername";
    if ($passwordChanged) $changes[] = "password changed";
    logActivity(
        $conn, $session,
        $passwordChanged ? 'admin.password_change' : 'admin.profile_update',
        'admin', $admin_id,
        "Admin profile updated: " . implode(', ', $changes)
    );

    echo json_encode(["success" => true, "message" => "Profile updated successfully."]);

} catch (PDOException $e) {
    error_log('[update_admin_profile] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to update profile. Please try again."]);
}
exit;

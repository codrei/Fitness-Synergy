<?php
// Backend/update_admin_profile.php

require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';
require_once 'auth_check.php';

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
    echo json_encode(["success" => false, "error" => "Current password is required."]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT username, password FROM admins WHERE admin_id = :id");
    $stmt->execute([':id' => $admin_id]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin) {
        echo json_encode(["success" => false, "error" => "Admin account not found."]);
        exit;
    }

    if (!password_verify($currentPassword, $admin['password'])) {
        echo json_encode(["success" => false, "error" => "Current password is incorrect."]);
        exit;
    }

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

    echo json_encode(["success" => true, "message" => "Profile updated successfully."]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
}
exit;

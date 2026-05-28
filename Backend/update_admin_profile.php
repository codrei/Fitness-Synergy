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
    // Fetch current record
    $stmt = $conn->prepare("SELECT username, password FROM admins WHERE admin_id = :id");
    $stmt->execute([':id' => $admin_id]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin) {
        echo json_encode(["success" => false, "error" => "Admin account not found."]);
        exit;
    }

    // Verify current password against stored hash
    if (!password_verify($currentPassword, $admin['password'])) {
        echo json_encode([
            "success" => false,
            "error"   => "Current password is incorrect.",
        ]);
        exit;
    }

    $updateFields = [];
    $bindings     = [];

    if (!empty($newUsername) && $newUsername !== $admin['username']) {
        $updateFields[]        = "username = :username";
        $bindings[':username'] = $newUsername;
    }

    if (!empty($newPassword)) {
        $updateFields[]        = "password = :password";
        $bindings[':password'] = password_hash($newPassword, PASSWORD_BCRYPT);
    }

    if (empty($updateFields)) {
        echo json_encode(["success" => false, "error" => "No changes detected."]);
        exit;
    }

    $sql             = "UPDATE admins SET " . implode(", ", $updateFields) . " WHERE admin_id = :id";
    $bindings[':id'] = $admin_id;

    $stmt    = $conn->prepare($sql);
    $success = $stmt->execute($bindings);

    if ($success && $stmt->rowCount() > 0) {
        echo json_encode(["success" => true, "message" => "Profile updated successfully."]);
    } elseif ($success && $stmt->rowCount() === 0) {
        // Executed fine but nothing changed (same values submitted)
        echo json_encode(["success" => false, "error" => "No changes were applied. Values may be identical to current."]);
    } else {
        echo json_encode(["success" => false, "error" => "Update failed."]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
}
exit;
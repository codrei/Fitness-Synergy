<?php
// Backend/get_admin_profile.php

require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';
require_once 'auth_check.php';

$session  = requireAuth();
$admin_id = $session['admin_id'] ?? 1;

try {
    $stmt = $conn->prepare("SELECT username FROM admins WHERE admin_id = :id");
    $stmt->execute([':id' => $admin_id]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin) {
        echo json_encode(["success" => false, "error" => "Admin not found."]);
        exit;
    }

    echo json_encode(["success" => true, "username" => $admin['username']]);

} catch (PDOException $e) {
    error_log('[get_admin_profile] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to load profile."]);
}
exit;
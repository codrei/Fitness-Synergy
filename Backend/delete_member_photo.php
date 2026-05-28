<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
require_once 'audit.php';
$session = requireAuth();

$data = json_decode(file_get_contents("php://input"));
$member_id = $data->member_id ?? null;

if (!$member_id) {
    echo json_encode(["success" => false, "error" => "Member ID required."]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT photo_url FROM members WHERE member_id = :id");
    $stmt->execute([':id' => $member_id]);
    $photoUrl = $stmt->fetchColumn();

    if ($photoUrl) {
        $filePath = __DIR__ . '/' . $photoUrl;
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }

    $conn->prepare("UPDATE members SET photo_url = NULL WHERE member_id = :id")
         ->execute([':id' => $member_id]);

    logActivity(
        $conn, $session,
        'member.photo_delete', 'member', $member_id,
        "Deleted photo for member #" . (int)$member_id
    );

    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    error_log('[delete_member_photo] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to delete photo."]);
}

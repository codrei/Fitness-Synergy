<?php
require_once 'cors.php';
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

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

    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

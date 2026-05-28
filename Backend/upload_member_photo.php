<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$member_id = $_POST['member_id'] ?? null;

if (!$member_id || !isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["success" => false, "error" => "Missing or invalid upload."]);
    exit;
}

$allowed = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'];
$finfo   = finfo_open(FILEINFO_MIME_TYPE);
$mime    = finfo_file($finfo, $_FILES['photo']['tmp_name']);
finfo_close($finfo);

if (!in_array($mime, $allowed)) {
    echo json_encode(["success" => false, "error" => "Only JPG, PNG and WebP images are allowed."]);
    exit;
}

if ($_FILES['photo']['size'] > 5 * 1024 * 1024) {
    echo json_encode(["success" => false, "error" => "File exceeds 5 MB limit."]);
    exit;
}

$uploadDir = __DIR__ . '/uploads/members/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Delete old photo if one exists for this member
try {
    $row = $conn->prepare("SELECT photo_url FROM members WHERE member_id = :id");
    $row->execute([':id' => $member_id]);
    $oldPath = $row->fetchColumn();
    if ($oldPath) {
        $fullOld = __DIR__ . '/' . $oldPath;
        if (file_exists($fullOld)) {
            unlink($fullOld);
        }
    }
} catch (PDOException $e) {}

$ext      = array_search($mime, $allowed);
$filename = 'member_' . (int)$member_id . '_' . time() . '.' . $ext;
$target   = $uploadDir . $filename;

if (!move_uploaded_file($_FILES['photo']['tmp_name'], $target)) {
    echo json_encode(["success" => false, "error" => "Failed to save file."]);
    exit;
}

$relPath = 'uploads/members/' . $filename;

try {
    $conn->prepare("UPDATE members SET photo_url = :url WHERE member_id = :id")
         ->execute([':url' => $relPath, ':id' => $member_id]);
    echo json_encode(["success" => true, "photo_url" => $relPath]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

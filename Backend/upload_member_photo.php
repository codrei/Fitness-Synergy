<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
require_once 'audit.php';
$session = requireAuth();

$member_id = $_POST['member_id'] ?? null;

if (!$member_id || !isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing or invalid upload."]);
    exit;
}

$allowed = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'];
$finfo   = finfo_open(FILEINFO_MIME_TYPE);
$mime    = finfo_file($finfo, $_FILES['photo']['tmp_name']);
finfo_close($finfo);

if (!in_array($mime, $allowed)) {
    http_response_code(415);
    echo json_encode(["success" => false, "error" => "Only JPG, PNG and WebP images are allowed."]);
    exit;
}

if ($_FILES['photo']['size'] > 5 * 1024 * 1024) {
    http_response_code(413);
    echo json_encode(["success" => false, "error" => "File exceeds 5 MB limit."]);
    exit;
}

$uploadDir = __DIR__ . '/uploads/members/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// ── Atomic order: write new → UPDATE DB → only then delete old ──
// Old order deleted the old photo BEFORE writing the new one. If the move or
// DB update failed mid-way, the member ended up with NO photo at all.
//
// New order: never disturb existing state until the new state is durable.

// 1. Look up the old path (so we can clean it up at the very end, on success only)
$oldPath = null;
try {
    $row = $conn->prepare("SELECT photo_url FROM members WHERE member_id = :id");
    $row->execute([':id' => $member_id]);
    $oldPath = $row->fetchColumn() ?: null;
} catch (PDOException $e) {
    error_log('[upload_member_photo] old photo lookup failed: ' . $e->getMessage());
    // Non-fatal — we just won't be able to clean up an old file at the end.
}

// 2. Move the new upload into place under a fresh, unique filename
$ext      = array_search($mime, $allowed);
$filename = 'member_' . (int)$member_id . '_' . time() . '.' . $ext;
$target   = $uploadDir . $filename;

if (!move_uploaded_file($_FILES['photo']['tmp_name'], $target)) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to save file."]);
    exit;
}

$relPath = 'uploads/members/' . $filename;

// 3. UPDATE the DB to point at the new file
try {
    $conn->prepare("UPDATE members SET photo_url = :url WHERE member_id = :id")
         ->execute([':url' => $relPath, ':id' => $member_id]);
} catch (PDOException $e) {
    error_log('[upload_member_photo] DB update failed: ' . $e->getMessage());
    // The new file is on disk but unreachable via the member record.
    // Roll it back so we don't leak orphaned files. The old photo (if any) is
    // still intact because we haven't touched it yet.
    @unlink($target);
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Photo upload failed. Please try again."]);
    exit;
}

// 4. Only NOW that the new state is durable do we delete the old file.
//    Path-traversal sanity check: refuse to unlink anything outside uploads/members/.
if ($oldPath && $oldPath !== $relPath) {
    $fullOld = __DIR__ . '/' . $oldPath;
    $realOld = realpath($fullOld);
    $realDir = realpath($uploadDir);
    if ($realOld && $realDir && strpos($realOld, $realDir) === 0 && file_exists($realOld)) {
        @unlink($realOld);
    }
}

logActivity(
    $conn, $session,
    'member.photo_upload', 'member', $member_id,
    "Uploaded photo for member #" . (int)$member_id,
    ['photo_url' => $relPath, 'replaced' => $oldPath]
);

echo json_encode(["success" => true, "photo_url" => $relPath]);

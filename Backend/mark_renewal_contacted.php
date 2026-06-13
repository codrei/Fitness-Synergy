<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
require_once 'audit.php';
$session = requireAuth();

$data = json_decode(file_get_contents("php://input"));
$member_id = isset($data->member_id) ? (int)$data->member_id : 0;
// If `clear` is truthy, we reset the timestamp so the row falls back
// into the urgency list (admin can "un-mark" by mistake).
$clear = !empty($data->clear);

if ($member_id <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Valid member_id required."]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT full_name, contract_id FROM members WHERE member_id = :id");
    $stmt->execute([':id' => $member_id]);
    $member = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$member) {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Member not found."]);
        exit;
    }

    if ($clear) {
        $conn->prepare("UPDATE members SET renewal_contacted_at = NULL WHERE member_id = :id")
             ->execute([':id' => $member_id]);
    } else {
        $conn->prepare("UPDATE members SET renewal_contacted_at = NOW() WHERE member_id = :id")
             ->execute([':id' => $member_id]);
    }

    logActivity(
        $conn, $session,
        $clear ? 'member.renewal_contact_clear' : 'member.renewal_contacted',
        'member', $member_id,
        ($clear ? "Cleared contacted flag" : "Marked as contacted for renewal") . ": " . ($member['full_name'] ?? '?') . " (" . ($member['contract_id'] ?? '—') . ")"
    );

    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    error_log('[mark_renewal_contacted] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to update contact status."]);
}

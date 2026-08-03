<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';
require_once 'auth_check.php';
require_once 'audit.php';
$session = requireAuth();
$data = json_decode(file_get_contents("php://input"));

// Walk-in guests are not rows in `members` — they are aggregated from `payments`
// (customer_type = 'Walk-in') and given a synthetic id of "wi_<payment_id>" by
// get_members.php. Strip the prefix to recover the anchor payment_id.
$raw = isset($data->member_id) ? (string)$data->member_id : '';
$paymentId = 0;
if (strpos($raw, 'wi_') === 0) {
    $paymentId = (int)substr($raw, 3);
}

if ($paymentId <= 0) {
    echo json_encode(["success" => false, "error" => "Invalid walk-in ID."]);
    exit;
}

try {
    // Resolve the guest's grouping key from the anchor payment, then delete every
    // walk-in payment that shares it — this mirrors how get_members.php groups
    // visits (by walkin_key + guest_name) so the whole guest is removed at once.
    $lookup = $conn->prepare("
        SELECT walkin_key, guest_name
        FROM payments
        WHERE payment_id = :pid AND customer_type = 'Walk-in'
    ");
    $lookup->execute([':pid' => $paymentId]);
    $row = $lookup->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Walk-in guest not found."]);
        exit;
    }

    $walkinKey = $row['walkin_key'];
    $guestName = $row['guest_name'];

    // Snapshot the full set of payments before delete for forensic recovery.
    $snapStmt = $conn->prepare("
        SELECT * FROM payments
        WHERE customer_type = 'Walk-in' AND walkin_key = :key AND guest_name = :name
    ");
    $snapStmt->execute([':key' => $walkinKey, ':name' => $guestName]);
    $snapshot = $snapStmt->fetchAll(PDO::FETCH_ASSOC);

    $conn->beginTransaction();

    $del = $conn->prepare("
        DELETE FROM payments
        WHERE customer_type = 'Walk-in' AND walkin_key = :key AND guest_name = :name
    ");
    $del->execute([':key' => $walkinKey, ':name' => $guestName]);
    $removed = $del->rowCount();

    $conn->commit();

    logActivity(
        $conn, $session,
        'walkin.delete', 'payment', $paymentId,
        "Deleted walk-in guest: " . ($guestName ?? "—") . " ($removed payment record" . ($removed === 1 ? "" : "s") . ")",
        $snapshot  // full payment rows preserved for forensic recovery
    );

    echo json_encode(["success" => true, "message" => "Walk-in guest deleted!"]);
} catch (PDOException $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    error_log('[delete_walkin] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Delete failed."]);
}

<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
require_once 'audit.php';
$session = requireAuth();

$data = json_decode(file_get_contents('php://input'), true);
$id   = (int)($data['id'] ?? 0);

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID is required.']);
    exit;
}

try {
    $snapStmt = $conn->prepare("SELECT * FROM bank_deposits WHERE id = :id");
    $snapStmt->execute([':id' => $id]);
    $snapshot = $snapStmt->fetch(PDO::FETCH_ASSOC);

    $stmt = $conn->prepare("DELETE FROM bank_deposits WHERE id = :id");
    $stmt->execute([':id' => $id]);

    if ($snapshot) {
        logActivity(
            $conn, $session,
            'deposit.delete', 'deposit', $id,
            "Deleted bank deposit: " . ($snapshot['deposit_date'] ?? '?') . " — ₱" . number_format((float)($snapshot['amount'] ?? 0), 2),
            $snapshot
        );
    }
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete deposit.']);
}

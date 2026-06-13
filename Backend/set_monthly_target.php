<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
require_once 'audit.php';
$session = requireAuth();

$data = json_decode(file_get_contents('php://input'), true);
$month  = (int)($data['month']  ?? 0);
$year   = (int)($data['year']   ?? 0);
$amount = (float)($data['target_amount'] ?? 0);

if ($month < 1 || $month > 12 || $year < 2000 || $year > 2099 || $amount < 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input.']);
    exit;
}

try {
    $stmt = $conn->prepare("
        INSERT INTO monthly_targets (month, year, target_amount)
        VALUES (:m, :y, :amt)
        ON DUPLICATE KEY UPDATE target_amount = :amt2, updated_at = CURRENT_TIMESTAMP
    ");
    $stmt->execute([':m' => $month, ':y' => $year, ':amt' => $amount, ':amt2' => $amount]);
    logActivity(
        $conn, $session,
        'target.set', 'target', "$month-$year",
        "Set monthly target for $month/$year: ₱" . number_format($amount, 2)
    );
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save target.']);
}

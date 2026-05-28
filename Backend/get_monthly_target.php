<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$month = (int)($_GET['month'] ?? date('m'));
$year  = (int)($_GET['year']  ?? date('Y'));

try {
    $stmt = $conn->prepare("SELECT target_amount FROM monthly_targets WHERE month = :m AND year = :y");
    $stmt->execute([':m' => $month, ':y' => $year]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode([
        'success'       => true,
        'target_amount' => $row ? (float) $row['target_amount'] : 0,
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => true, 'target_amount' => 0]);
}

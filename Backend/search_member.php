<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

// Cap query length to keep this endpoint cheap (no DOS surface from massive LIKE patterns)
$search_query = isset($_GET['name']) ? substr(trim($_GET['name']), 0, 50) : '';
try {
    $stmt = $conn->prepare("SELECT member_id, full_name, plan_id FROM members WHERE full_name LIKE :name LIMIT 5");
    $stmt->execute([':name' => "%$search_query%"]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch(PDOException $e) {
    error_log('[search_member] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Search failed. Please try again."]);
}
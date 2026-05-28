<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$search_query = isset($_GET['name']) ? $_GET['name'] : '';
try {
    $stmt = $conn->prepare("SELECT member_id, full_name, plan_id FROM members WHERE full_name LIKE :name LIMIT 5");
    $stmt->execute([':name' => "%$search_query%"]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch(PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
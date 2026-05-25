<?php
require_once 'cors.php';

require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

try {
    $query = $conn->query("
        SELECT m.*, p.plan_name 
        FROM members m 
        LEFT JOIN plans p ON m.plan_id = p.plan_id
    ");
    echo json_encode($query->fetchAll(PDO::FETCH_ASSOC));
} catch(PDOException $e) {
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
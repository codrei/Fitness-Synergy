<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

if (isset($_GET['id'])) {
    try {
        $query = $conn->prepare("SELECT time_in FROM attendance WHERE member_id = :id ORDER BY time_in DESC");
        $query->execute([':id' => $_GET['id']]);
        $logs = $query->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(["success" => true, "logs" => $logs, "total" => count($logs)]);
    } catch (PDOException $e) {
        error_log('[get_member_attendance] ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to load attendance history."]);
    }
} else {
    echo json_encode(["success" => false, "error" => "No member ID provided"]);
}
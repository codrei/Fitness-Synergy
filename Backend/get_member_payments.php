<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight "OPTIONS" requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

require_once 'db.php';

if (isset($_GET['id'])) {
    try {
        $query = $conn->prepare("SELECT payment_id, amount, payment_date FROM payments WHERE member_id = :id ORDER BY payment_date DESC");
        $query->execute([':id' => $_GET['id']]);
        
        echo json_encode(["success" => true, "payments" => $query->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "error" => "No ID provided"]);
}
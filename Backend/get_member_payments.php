<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight "OPTIONS" requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

if (isset($_GET['id'])) {
    try {
        $query = $conn->prepare("
            SELECT p.payment_id, p.amount, p.payment_date,
                   p.cash_amount, p.gcash_amount, p.maya_amount,
                   p.debit_amount, p.credit_amount, p.reference_number,
                   pl.plan_name
            FROM payments p
            LEFT JOIN plans pl ON p.plan_id = pl.plan_id
            WHERE p.member_id = :id
            ORDER BY p.payment_date DESC
        ");
        $query->execute([':id' => $_GET['id']]);
        
        echo json_encode(["success" => true, "payments" => $query->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "error" => "No ID provided"]);
}
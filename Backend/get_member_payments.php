<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

if (isset($_GET['id'])) {
    try {
        $conn = new PDO("mysql:host=sql303.infinityfree.com;dbname=if0_41873855_ironforgegym;charset=utf8mb4", "if0_41873855", "NK92T3vwsKKoXp");
        
        // Fetch all payments for this member, newest first!
        $query = $conn->prepare("SELECT payment_id, amount, payment_date FROM payments WHERE member_id = :id ORDER BY payment_date DESC");
        $query->execute([':id' => $_GET['id']]);
        
        echo json_encode(["success" => true, "payments" => $query->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "error" => "No ID provided"]);
}
?>
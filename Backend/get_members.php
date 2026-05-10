<?php
// Set headers for React to read it
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

try {
    // Notice the ";charset=utf8mb4" added to the end of the host string! This fixes the crash.
    $conn = new PDO("mysql:host=sql303.infinityfree.com;dbname=if0_41873855_ironforgegym;charset=utf8mb4", "if0_41873855", "NK92T3vwsKKoXp");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Fetch members and their plan names
    $query = $conn->query("
        SELECT m.*, p.plan_name 
        FROM members m 
        LEFT JOIN plans p ON m.plan_id = p.plan_id
    ");
    $members = $query->fetchAll(PDO::FETCH_ASSOC);
    
    // Output safe JSON
    echo json_encode($members);
    
} catch(PDOException $e) {
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
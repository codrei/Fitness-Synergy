<?php
header("Access-Control-Allow-Origin: *");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");

try {
    $conn = new PDO("mysql:host=sql303.infinityfree.com;dbname=if0_41975335_fitnesssynergy;charset=utf8mb4", "if0_41975335", "l0s6Y0PVPO");
    $query = $conn->query("SELECT * FROM plans");
    echo json_encode($query->fetchAll(PDO::FETCH_ASSOC));
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
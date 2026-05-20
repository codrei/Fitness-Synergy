<?php
// 1. Allow React to talk to this API (CORS headers)
header("Access-Control-Allow-Origin: *");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

// 3. Connect to MariaDB
try {
    $conn = new PDO("mysql:host=sql303.infinityfree.com;dbname=if0_41975335_fitnesssynergy;charset=utf8mb4", "if0_41975335", "l0s6Y0PVPO");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    echo json_encode(array("error" => "Connection error: " . $exception->getMessage()));
    exit();
}

// 4. Get the search query sent by React
$search_query = isset($_GET['name']) ? $_GET['name'] : '';

// 5. Prepare and execute the SQL query safely
$query = "SELECT member_id, full_name, plan_id FROM members WHERE full_name LIKE :name LIMIT 5";
$stmt = $conn->prepare($query);

// Add wildcards for the SQL LIKE statement
$search_term = "%{$search_query}%";
$stmt->bindParam(':name', $search_term);

$stmt->execute();

// 6. Fetch the results and send them back to React as JSON
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($results);
?>
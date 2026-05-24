Try AI directly in your favourite apps … Use Gemini to generate drafts and refine content, plus get Gemini Pro with access to Google's next-gen AI
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight "OPTIONS" requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}
require_once 'db.php';

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
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

$search_query = isset($_GET['name']) ? $_GET['name'] : '';
try {
    $stmt = $conn->prepare("SELECT member_id, full_name, plan_id FROM members WHERE full_name LIKE :name LIMIT 5");
    $stmt->execute([':name' => "%$search_query%"]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch(PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
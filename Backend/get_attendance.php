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
        SELECT members.full_name, attendance.time_in 
        FROM attendance 
        JOIN members ON attendance.member_id = members.member_id 
        WHERE DATE(attendance.time_in) = CURRENT_DATE()
        ORDER BY attendance.time_in DESC 
    ");
    
    echo json_encode($query->fetchAll(PDO::FETCH_ASSOC));
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
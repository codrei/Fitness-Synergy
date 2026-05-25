<?php
require_once 'cors.php';

// Handle preflight "OPTIONS" requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

try {
    $query = $conn->query("SELECT * FROM plans");
    echo json_encode($query->fetchAll(PDO::FETCH_ASSOC));
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
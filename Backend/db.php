<?php
// db.php

date_default_timezone_set('Asia/Manila');

$envFile = __DIR__ . '/.env';
if (!file_exists($envFile)) {
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Server misconfiguration: .env file not found."]);
    exit;
}

$env = [];
foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
    $line = trim($line);
    if ($line === '' || $line[0] === '#') continue;
    $pos = strpos($line, '=');
    if ($pos === false) continue;
    $key = trim(substr($line, 0, $pos));
    $val = trim(substr($line, $pos + 1));
    $env[$key] = $val;
}

$host     = $env['DB_HOST'] ?? '';
$dbname   = $env['DB_NAME'] ?? '';
$username = $env['DB_USER'] ?? '';
$password = $env['DB_PASS'] ?? '';

if (empty($host) || empty($dbname) || empty($username)) {
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error"   => "Server misconfiguration: missing DB credentials in .env.",
    ]);
    exit;
}

try {
    // DSN charset=utf8mb4 sets the connection character set correctly.
    // The previous init command "SET NAMES utf8mb4, time_zone = '+08:00'"
    // was INVALID syntax — `SET NAMES` is a special form that can't be chained
    // with regular var assignments in the same statement. PDO swallowed the
    // syntax error silently, leaving multibyte chars (— ₱ etc.) corrupted on write.
    $conn = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
        ]
    );
    // Run timezone as a separate statement so a hosting quirk on one
    // doesn't break the other.
    $conn->exec("SET time_zone = '+08:00'");
} catch (PDOException $e) {
    error_log('[db connect] ' . $e->getMessage());
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error"   => "Database connection failed. Please try again later."
    ]);
    exit;
}
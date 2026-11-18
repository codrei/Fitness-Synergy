<?php
// db.php

date_default_timezone_set('Asia/Manila');
// Warnings go to the log, never into JSON responses.
ini_set('display_errors', '0');

// Settings come from the host's environment variables (Vercel), or from a .env
// file at the repo root for local development (XAMPP).
$env = [];
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        $pos = strpos($line, '=');
        if ($pos === false) continue;
        $env[trim(substr($line, 0, $pos))] = trim(substr($line, $pos + 1));
    }
}
$setting = fn(string $k, string $default = '') => getenv($k) !== false ? getenv($k) : ($env[$k] ?? $default);

$host     = $setting('DB_HOST');
$port     = $setting('DB_PORT', '3306');
$dbname   = $setting('DB_NAME');
$username = $setting('DB_USER');
$password = $setting('DB_PASS');
$useTls   = $setting('DB_SSL') === 'true';

if (empty($host) || empty($dbname) || empty($username)) {
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error"   => "Server misconfiguration: missing DB credentials.",
    ]);
    exit;
}

// PHP 8.5 renamed the MySQL PDO constants; the old names print deprecation warnings into responses.
$mysqlAttr = fn(string $name) => constant(class_exists('Pdo\Mysql') ? "Pdo\Mysql::ATTR_$name" : "PDO::MYSQL_ATTR_$name");

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_TIMEOUT => 5,
    $mysqlAttr('INIT_COMMAND') => "SET NAMES utf8mb4",
];
if ($useTls) {
    // Cloud MySQL (e.g. TiDB) requires TLS; verify against the system CA bundle.
    // DB_SSL_CA lets local Windows PHP point at a CA file; Linux hosts use the system bundle.
    foreach ([$setting('DB_SSL_CA'), '/etc/pki/tls/certs/ca-bundle.crt', '/etc/ssl/certs/ca-certificates.crt'] as $ca) {
        if (file_exists($ca)) { $options[$mysqlAttr('SSL_CA')] = $ca; break; }
    }
}

try {
    // DSN charset=utf8mb4 sets the connection character set correctly.
    // The previous init command "SET NAMES utf8mb4, time_zone = '+08:00'"
    // was INVALID syntax — `SET NAMES` is a special form that can't be chained
    // with regular var assignments in the same statement. PDO swallowed the
    // syntax error silently, leaving multibyte chars (— ₱ etc.) corrupted on write.
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $username, $password, $options);
    // Run timezone as a separate statement so a hosting quirk on one
    // doesn't break the other.
    $conn->exec("SET time_zone = '+08:00'");
    // The original MariaDB host allowed GROUP BY with extra columns; TiDB/MySQL 8 reject it by default.
    $conn->exec("SET SESSION sql_mode = REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', '')");
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
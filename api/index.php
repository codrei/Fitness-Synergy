<?php
// Single entry point for the whole API. Vercel's free plan allows 12 functions per
// deployment, so /api/<name>.php is rewritten here and runs endpoints/<name>.php.
$endpoint = $_GET['__endpoint'] ?? '';
unset($_GET['__endpoint']);

if (!preg_match('/^[a-z_]+\.php$/', $endpoint) || !is_file(__DIR__ . "/../endpoints/$endpoint")) {
    http_response_code(404);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['success' => false, 'error' => 'Not found.']);
    exit;
}

require __DIR__ . "/../endpoints/$endpoint";

<?php
// =====================================================================
// ONE-TIME PASSWORD RESET SCRIPT
// UPLOAD to htdocs/, open in browser ONCE, then DELETE THIS FILE.
// =====================================================================

$SECRET_CODE = "FSreset2026";
$NEW_PASSWORD = "FSLipa2026";

$provided = $_GET['code'] ?? '';

if ($provided !== $SECRET_CODE) {
    http_response_code(403);
    echo "<h2>Access Denied</h2><p>Usage: ?code=FSreset2026</p>";
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $hash = password_hash($NEW_PASSWORD, PASSWORD_BCRYPT);

    // Update ALL admin accounts (or change WHERE clause to target a specific admin_id)
    $stmt = $conn->prepare("UPDATE admins SET password = :hash");
    $stmt->execute([':hash' => $hash]);
    $affected = $stmt->rowCount();

    // Clear all sessions so old tokens are invalidated
    $conn->query("DELETE FROM sessions");

    echo "<h2 style='color:green'>Password Reset Successful</h2>";
    echo "<p>Updated <strong>$affected</strong> admin account(s).</p>";
    echo "<p>New password: <strong>" . htmlspecialchars($NEW_PASSWORD) . "</strong></p>";
    echo "<p>All active sessions have been cleared. Log in fresh.</p>";
    echo "<hr><p style='color:red'><strong>DELETE THIS FILE FROM YOUR SERVER NOW.</strong><br>
          Go to your InfinityFree file manager and remove <code>reset_password_DELETEME.php</code></p>";

} catch (PDOException $e) {
    echo "<h2 style='color:red'>Error</h2><pre>" . htmlspecialchars($e->getMessage()) . "</pre>";
}
?>

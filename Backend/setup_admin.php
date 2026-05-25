<?php
require_once 'cors.php';
require_once 'db.php';

try {
    // 1. Create the table
    $conn->query("CREATE TABLE IF NOT EXISTS admins (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    )");

    // 2. Clear out any old test accounts just in case
    $conn->query("TRUNCATE TABLE admins");

    // 3. Hash the password securely (NEVER STORE PLAIN TEXT!)
    // ⚠️  CHANGE THESE BEFORE RUNNING! Delete this file after use.
    $username = "admin";
    $password = "FSlipa2026";
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // 4. Save it to the database
    $stmt = $conn->prepare("INSERT INTO admins (username, password) VALUES (:user, :pass)");
    $stmt->execute([':user' => $username, ':pass' => $hashed_password]);

    // Outputting as HTML for browser viewing
    echo "<h1>✅ Security Setup Complete!</h1>";
    echo "Your admins table is created and your secure account is ready.<br>";
    echo "<b>Username:</b> " . htmlspecialchars($username) . "<br>";
    echo "<b>Password:</b> " . htmlspecialchars($password) . "<br><br>";
    echo "<i>(You can safely delete this setup_admin.php file now)</i>";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
<?php
// Run this file ONCE in your browser to create the admin account!
try {
    $conn = new PDO("mysql:host=sql303.infinityfree.com;dbname=if0_41975335_fitnesssynergy;charset=utf8mb4", "if0_41975335", "l0s6Y0PVPO");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Create the table
    $conn->query("CREATE TABLE IF NOT EXISTS admins (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    )");

    // 2. Clear out any old test accounts just in case
    $conn->query("TRUNCATE TABLE admins");

    // 3. Hash the password securely (NEVER STORE PLAIN TEXT!)
    $username = "admin";
    $password = "admin"; // Feel free to change this!
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // 4. Save it to the database
    $stmt = $conn->prepare("INSERT INTO admins (username, password) VALUES (:user, :pass)");
    $stmt->execute([':user' => $username, ':pass' => $hashed_password]);

    echo "<h1>✅ Security Setup Complete!</h1>";
    echo "Your admins table is created and your secure account is ready.<br>";
    echo "<b>Username:</b> " . $username . "<br>";
    echo "<b>Password:</b> " . $password . "<br><br>";
    echo "<i>(You can safely delete this setup_admin.php file now)</i>";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>

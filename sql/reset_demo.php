<?php
// Rebuilds the PUBLIC DEMO database: drops every table, then loads schema.sql and demo_seed.sql.
// Usage (from the repo root): php sql/reset_demo.php --yes
// Refuses to run unless DEMO_MODE=1, so it can't wipe a real gym database by mistake.

if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../lib/db.php';

if ($setting('DEMO_MODE') !== '1' || !in_array('--yes', $argv, true)) {
    fwrite(STDERR, "Refusing: needs DEMO_MODE=1 in the settings and the --yes flag.\n");
    exit(1);
}

$conn->exec('SET FOREIGN_KEY_CHECKS = 0');
foreach ($conn->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN) as $table) {
    $conn->exec("DROP TABLE `$table`");
}
$conn->exec('SET FOREIGN_KEY_CHECKS = 1');

foreach (['schema.sql', 'demo_seed.sql'] as $file) {
    $sql = preg_replace('/^--.*$/m', '', file_get_contents(__DIR__ . "/$file"));
    // shortcut: splits on ";" at line end, fine for these files (no ";" inside values).
    $statements = array_filter(array_map('trim', preg_split('/;\s*$/m', $sql)));
    foreach ($statements as $i => $statement) {
        try {
            $conn->exec($statement);
        } catch (PDOException $e) {
            fwrite(STDERR, "$file statement " . ($i + 1) . " failed: " . $e->getMessage() . "\n" . substr($statement, 0, 200) . "\n");
            exit(1);
        }
    }
    echo "$file: " . count($statements) . " statements OK\n";
}

$count = fn(string $t) => (int) $conn->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();
printf("members %d, payments %d, attendance %d\n", $count('members'), $count('payments'), $count('attendance'));

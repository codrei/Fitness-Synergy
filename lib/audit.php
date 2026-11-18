<?php
// Backend/audit.php — activity log helper.
//
// Usage from any write endpoint:
//   $session = requireAuth();
//   logActivity($conn, $session, 'member.delete', 'member', $id, "Deleted Marco Andrei Belen", ['contract_id' => 'FS-000001']);
//
// If the insert into activity_log fails for any reason (table missing, DB hiccup),
// we log to PHP error_log and SWALLOW the exception — audit failures must never
// break the underlying operation.

function logActivity($conn, $session, $action, $entity_type, $entity_id, $summary, $payload = null) {
    try {
        $admin_id       = is_array($session) ? ($session['admin_id'] ?? null) : null;
        $admin_username = is_array($session) ? ($session['username'] ?? null) : null;
        $ip             = $_SERVER['REMOTE_ADDR'] ?? null;

        $stmt = $conn->prepare("
            INSERT INTO activity_log
                (admin_id, admin_username, action, entity_type, entity_id, summary, payload, ip_address)
            VALUES
                (:admin_id, :admin_username, :action, :entity_type, :entity_id, :summary, :payload, :ip)
        ");
        $stmt->execute([
            ':admin_id'       => $admin_id,
            ':admin_username' => $admin_username,
            ':action'         => $action,
            ':entity_type'    => $entity_type,
            ':entity_id'      => $entity_id !== null ? (string)$entity_id : null,
            ':summary'        => mb_substr($summary, 0, 500),
            ':payload'        => $payload !== null ? json_encode($payload, JSON_UNESCAPED_UNICODE) : null,
            ':ip'             => $ip,
        ]);
    } catch (Throwable $e) {
        error_log('[audit_log] insert failed: ' . $e->getMessage());
        // Intentionally do NOT rethrow — auditing must not break operations.
    }
}

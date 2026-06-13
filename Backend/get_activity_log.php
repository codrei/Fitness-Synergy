<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$limit  = max(1, min((int)($_GET['limit']  ?? 50), 200));
$offset = max(0, (int)($_GET['offset'] ?? 0));

// Optional filters
$filter_action_prefix = isset($_GET['action_prefix']) ? trim($_GET['action_prefix']) : '';
$filter_entity_type   = isset($_GET['entity_type'])   ? trim($_GET['entity_type'])   : '';
$filter_admin_id      = isset($_GET['admin_id'])      ? (int)$_GET['admin_id']       : 0;
$filter_search        = isset($_GET['q'])             ? trim($_GET['q'])             : '';

try {
    $where  = ["1=1"];
    $params = [];

    if ($filter_action_prefix !== '') {
        $where[] = "action LIKE :action";
        $params[':action'] = $filter_action_prefix . '%';
    }
    if ($filter_entity_type !== '') {
        $where[] = "entity_type = :entity_type";
        $params[':entity_type'] = $filter_entity_type;
    }
    if ($filter_admin_id > 0) {
        $where[] = "admin_id = :admin_id";
        $params[':admin_id'] = $filter_admin_id;
    }
    if ($filter_search !== '') {
        $where[] = "(summary LIKE :q OR admin_username LIKE :q)";
        $params[':q'] = '%' . substr($filter_search, 0, 100) . '%';
    }

    $whereSql = implode(' AND ', $where);

    $sql = "SELECT id, admin_id, admin_username, action, entity_type, entity_id,
                   summary, payload, ip_address, created_at
            FROM activity_log
            WHERE $whereSql
            ORDER BY created_at DESC, id DESC
            LIMIT :limit OFFSET :offset";
    $stmt = $conn->prepare($sql);
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v);
    }
    $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Total count (for pagination UI)
    $countSql  = "SELECT COUNT(*) FROM activity_log WHERE $whereSql";
    $countStmt = $conn->prepare($countSql);
    foreach ($params as $k => $v) {
        $countStmt->bindValue($k, $v);
    }
    $countStmt->execute();
    $total = (int)$countStmt->fetchColumn();

    echo json_encode([
        'success' => true,
        'logs'    => $logs,
        'total'   => $total,
        'limit'   => $limit,
        'offset'  => $offset,
    ]);
} catch (PDOException $e) {
    error_log('[get_activity_log] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to load activity log.']);
}

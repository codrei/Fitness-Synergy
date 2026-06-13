<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
require_once 'audit.php';
$session = requireAuth();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->guest_name)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Guest name is required."]);
    exit;
}

$guest_name       = trim($data->guest_name);
$plan_id          = 1;
$guest_age        = isset($data->guest_age) && $data->guest_age !== '' ? (int)$data->guest_age : null;
$guest_contact    = !empty($data->guest_contact)    ? trim($data->guest_contact)  : null;
$guest_address    = !empty($data->guest_address)    ? trim($data->guest_address)  : null;
$custom_price     = isset($data->custom_price) && $data->custom_price !== '' ? (float)$data->custom_price : null;
$payment_method   = !empty($data->payment_method)   ? $data->payment_method       : 'Cash';
$reference_number = !empty($data->reference_number) ? $data->reference_number     : null;

// Required-field validation (defense-in-depth; UI also enforces)
if ($guest_age === null || $guest_age < 1 || $guest_age > 120) {
    http_response_code(422);
    echo json_encode([
        "success" => false,
        "error"   => "Age is required and must be between 1 and 120.",
    ]);
    exit;
}
if ($guest_contact === null || !preg_match('/^09\d{9}$/', $guest_contact)) {
    http_response_code(422);
    echo json_encode([
        "success" => false,
        "error"   => "Contact number must be exactly 11 digits starting with 09.",
    ]);
    exit;
}

try {
    // Same-day duplicate check.
    // If contact was provided, match on (contact + name).
    // If no contact, fall back to name-only match so guests can't re-register unlimited times.
    if ($guest_contact !== null) {
        $todayCheck = $conn->prepare("
            SELECT COUNT(*) FROM payments
            WHERE customer_type = 'Walk-in'
              AND payment_date = CURRENT_DATE()
              AND guest_contact = :contact
              AND LOWER(TRIM(guest_name)) = LOWER(TRIM(:name))
        ");
        $todayCheck->execute([':contact' => $guest_contact, ':name' => $guest_name]);
    } else {
        $todayCheck = $conn->prepare("
            SELECT COUNT(*) FROM payments
            WHERE customer_type = 'Walk-in'
              AND payment_date = CURRENT_DATE()
              AND guest_contact IS NULL
              AND LOWER(TRIM(guest_name)) = LOWER(TRIM(:name))
        ");
        $todayCheck->execute([':name' => $guest_name]);
    }

    if ((int)$todayCheck->fetchColumn() > 0) {
        http_response_code(409);
        echo json_encode([
            "success" => false,
            "error"   => "$guest_name has already walked in today.",
        ]);
        exit;
    }

    if ($custom_price === null) {
        $priceQuery = $conn->prepare("SELECT price FROM plans WHERE plan_id = :pid");
        $priceQuery->execute([':pid' => $plan_id]);
        $custom_price = (float)$priceQuery->fetchColumn();
    }

    $stmt = $conn->prepare("
        INSERT INTO payments
            (member_id, customer_type, guest_name, guest_age, guest_contact, guest_address,
             plan_id, amount, payment_method, reference_number, payment_date)
        VALUES
            (NULL, 'Walk-in', :guest_name, :guest_age, :guest_contact, :guest_address,
             :plan_id, :amount, :payment_method, :reference, CURRENT_DATE())
    ");
    $stmt->execute([
        ':guest_name'     => $guest_name,
        ':guest_age'      => $guest_age,
        ':guest_contact'  => $guest_contact,
        ':guest_address'  => $guest_address,
        ':plan_id'        => $plan_id,
        ':amount'         => $custom_price,
        ':payment_method' => $payment_method,
        ':reference'      => $reference_number,
    ]);
    $payment_id = (int)$conn->lastInsertId();

    logActivity(
        $conn, $session,
        'walkin.create', 'payment', $payment_id,
        "Walk-in: $guest_name — ₱" . number_format($custom_price, 2) . " ($payment_method)",
        [
            'guest_name'    => $guest_name,
            'guest_contact' => $guest_contact,
            'amount'        => $custom_price,
            'payment_method'=> $payment_method,
        ]
    );

    // Recommend membership when a recurring walk-in passes 7 visits.
    $recommend   = false;
    $visit_count = 0;
    if ($guest_contact !== null) {
        $countStmt = $conn->prepare("
            SELECT COUNT(*) FROM payments
            WHERE customer_type = 'Walk-in' AND guest_contact = :contact
        ");
        $countStmt->execute([':contact' => $guest_contact]);
        $visit_count = (int)$countStmt->fetchColumn();
        $recommend   = $visit_count >= 7;
    }

    echo json_encode([
        "success"              => true,
        "message"              => "Walk-in registered successfully!",
        "recommend_membership" => $recommend,
        "visit_count"          => $visit_count,
        "guest_name"           => $guest_name,
    ]);
} catch (PDOException $e) {
    error_log('[add_walkin] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to register walk-in. Please try again."]);
}

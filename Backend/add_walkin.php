<?php
require_once 'cors.php';

require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->guest_name)) {
    echo json_encode(["success" => false, "error" => "Guest name is required."]);
    exit;
}

try {
    $plan_id       = 1;
    $guest_age     = !empty($data->guest_age)       ? (int)$data->guest_age       : null;
    $guest_contact = !empty($data->guest_contact)   ? trim($data->guest_contact)  : null;
    $guest_address = !empty($data->guest_address)   ? trim($data->guest_address)  : null;
    $custom_price  = !empty($data->custom_price)    ? (float)$data->custom_price  : null;

    $payment_method   = !empty($data->payment_method)   ? $data->payment_method   : 'Cash';
    $reference_number = !empty($data->reference_number) ? $data->reference_number : null;

    // Block same-day duplicate walk-in for same name + contact
    if (!empty($guest_contact)) {
        $todayCheck = $conn->prepare("
            SELECT COUNT(*) FROM payments
            WHERE customer_type = 'Walk-in'
              AND guest_contact = :contact
              AND guest_name    = :name
              AND DATE(payment_date) = CURRENT_DATE()
        ");
        $todayCheck->execute([':contact' => $guest_contact, ':name' => $data->guest_name]);
        if ((int)$todayCheck->fetchColumn() > 0) {
            echo json_encode(["success" => false, "error" => trim($data->guest_name) . " has already walked in today."]);
            exit;
        }
    }

    if ($custom_price === null) {
        $priceQuery = $conn->prepare("SELECT price FROM plans WHERE plan_id = 1");
        $priceQuery->execute();
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
        ':guest_name'     => $data->guest_name,
        ':guest_age'      => $guest_age,
        ':guest_contact'  => $guest_contact,
        ':guest_address'  => $guest_address,
        ':plan_id'        => $plan_id,
        ':amount'         => $custom_price,
        ':payment_method' => $payment_method,
        ':reference'      => $reference_number,
    ]);

    // Check visit count only if contact number was provided
    $recommend   = false;
    $visit_count = 0;
    if (!empty($guest_contact)) {
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
        "guest_name"           => $data->guest_name,
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

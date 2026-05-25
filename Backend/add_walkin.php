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
    $guest_age     = !empty($data->guest_age)       ? (int)$data->guest_age      : null;
    $guest_contact = !empty($data->guest_contact)   ? trim($data->guest_contact) : null;
    $custom_price  = !empty($data->custom_price)    ? (float)$data->custom_price : null;

    $cash_amount      = !empty($data->cash_amount)      ? (float)$data->cash_amount      : 0;
    $gcash_amount     = !empty($data->gcash_amount)     ? (float)$data->gcash_amount     : 0;
    $maya_amount      = !empty($data->maya_amount)      ? (float)$data->maya_amount      : 0;
    $debit_amount     = !empty($data->debit_amount)     ? (float)$data->debit_amount     : 0;
    $credit_amount    = !empty($data->credit_amount)    ? (float)$data->credit_amount    : 0;
    $reference_number = !empty($data->reference_number) ? $data->reference_number        : null;

    if ($custom_price === null) {
        $priceQuery = $conn->prepare("SELECT price FROM plans WHERE plan_id = 1");
        $priceQuery->execute();
        $custom_price = (float)$priceQuery->fetchColumn();
    }

    $stmt = $conn->prepare("
        INSERT INTO payments
            (member_id, customer_type, guest_name, guest_age, guest_contact, plan_id, amount,
             cash_amount, gcash_amount, maya_amount, debit_amount, credit_amount,
             reference_number, payment_date)
        VALUES
            (NULL, 'Walk-in', :guest_name, :guest_age, :guest_contact, :plan_id, :amount,
             :cash, :gcash, :maya, :debit, :credit,
             :reference, CURRENT_DATE())
    ");
    $stmt->execute([
        ':guest_name'    => $data->guest_name,
        ':guest_age'     => $guest_age,
        ':guest_contact' => $guest_contact,
        ':plan_id'       => $plan_id,
        ':amount'        => $custom_price,
        ':cash'          => $cash_amount,
        ':gcash'         => $gcash_amount,
        ':maya'          => $maya_amount,
        ':debit'         => $debit_amount,
        ':credit'        => $credit_amount,
        ':reference'     => $reference_number,
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

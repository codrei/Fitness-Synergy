<?php
require_once 'cors.php';
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->member_id) || empty($data->amount)) {
    echo json_encode(["success" => false, "error" => "Member ID and amount are required."]);
    exit;
}

try {
    $member = $conn->prepare("SELECT plan_id, is_installment FROM members WHERE member_id = :id");
    $member->execute([':id' => $data->member_id]);
    $m = $member->fetch(PDO::FETCH_ASSOC);

    if (!$m || !$m['is_installment']) {
        echo json_encode(["success" => false, "error" => "Member is not on an installment plan."]);
        exit;
    }

    $payment_method   = !empty($data->payment_method)   ? $data->payment_method   : 'Cash';
    $reference_number = !empty($data->reference_number) ? $data->reference_number : null;

    $conn->prepare("
        INSERT INTO payments
            (member_id, customer_type, amount, payment_date, plan_id,
             payment_method, reference_number)
        VALUES
            (:member_id, 'Member', :amount, CURRENT_DATE(), :plan_id,
             :payment_method, :reference)
    ")->execute([
        ':member_id'      => (int)$data->member_id,
        ':amount'         => (float)$data->amount,
        ':plan_id'        => $m['plan_id'],
        ':payment_method' => $payment_method,
        ':reference'      => $reference_number,
    ]);

    echo json_encode(["success" => true, "message" => "Installment payment recorded."]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

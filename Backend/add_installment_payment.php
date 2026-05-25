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

    $conn->prepare("
        INSERT INTO payments
            (member_id, customer_type, amount, payment_date, plan_id,
             cash_amount, gcash_amount, maya_amount, bank_transfer_amount,
             debit_amount, credit_amount, reference_number)
        VALUES
            (:member_id, 'Member', :amount, CURRENT_DATE(), :plan_id,
             :cash, :gcash, :maya, :bank,
             :debit, :credit, :reference)
    ")->execute([
        ':member_id' => (int)$data->member_id,
        ':amount'    => (float)$data->amount,
        ':plan_id'   => $m['plan_id'],
        ':cash'      => !empty($data->cash_amount)          ? (float)$data->cash_amount          : 0,
        ':gcash'     => !empty($data->gcash_amount)         ? (float)$data->gcash_amount         : 0,
        ':maya'      => !empty($data->maya_amount)          ? (float)$data->maya_amount          : 0,
        ':bank'      => !empty($data->bank_transfer_amount) ? (float)$data->bank_transfer_amount : 0,
        ':debit'     => !empty($data->debit_amount)         ? (float)$data->debit_amount         : 0,
        ':credit'    => !empty($data->credit_amount)        ? (float)$data->credit_amount        : 0,
        ':reference' => !empty($data->reference_number)     ? $data->reference_number            : null,
    ]);

    echo json_encode(["success" => true, "message" => "Installment payment recorded."]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

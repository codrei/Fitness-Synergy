<?php
require_once 'cors.php';
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->member_id) || empty($data->plan_id)) {
    echo json_encode(["success" => false, "error" => "Member ID and Plan are required."]);
    exit;
}

try {
    $plan_id      = (int)$data->plan_id;
    $bonus_days   = !empty($data->bonus_days)   ? (int)$data->bonus_days   : 0;
    $custom_price = !empty($data->custom_price) ? (float)$data->custom_price : null;

    $cash_amount      = !empty($data->cash_amount)      ? (float)$data->cash_amount      : 0;
    $gcash_amount     = !empty($data->gcash_amount)     ? (float)$data->gcash_amount     : 0;
    $maya_amount      = !empty($data->maya_amount)      ? (float)$data->maya_amount      : 0;
    $debit_amount     = !empty($data->debit_amount)     ? (float)$data->debit_amount     : 0;
    $credit_amount    = !empty($data->credit_amount)    ? (float)$data->credit_amount    : 0;
    $reference_number = !empty($data->reference_number) ? $data->reference_number        : null;

    // Get plan duration and price
    $pStmt = $conn->prepare("SELECT duration_days, price FROM plans WHERE plan_id = :p");
    $pStmt->execute([':p' => $plan_id]);
    $plan = $pStmt->fetch(PDO::FETCH_ASSOC);

    if (!$plan) {
        echo json_encode(["success" => false, "error" => "Plan not found."]);
        exit;
    }

    if ($custom_price === null) {
        $custom_price = (float)$plan['price'];
    }

    // Get current member expiration
    $mStmt = $conn->prepare("SELECT expiration_date FROM members WHERE member_id = :id");
    $mStmt->execute([':id' => $data->member_id]);
    $currentMember = $mStmt->fetch(PDO::FETCH_ASSOC);

    if (!$currentMember) {
        echo json_encode(["success" => false, "error" => "Member not found."]);
        exit;
    }

    // Extend from current expiration if still active, else start fresh from today
    $today = date('Y-m-d');
    $baseDate = (strtotime($currentMember['expiration_date']) >= strtotime($today))
        ? new DateTime($currentMember['expiration_date'])
        : new DateTime($today);

    $total_days = (int)$plan['duration_days'] + $bonus_days;
    $baseDate->modify("+{$total_days} days");
    $newExpiration = $baseDate->format('Y-m-d');

    $conn->beginTransaction();

    $conn->prepare("
        UPDATE members SET
            plan_id = :plan,
            start_date = CURRENT_DATE(),
            expiration_date = :exp,
            status = 'Active'
        WHERE member_id = :id
    ")->execute([':plan' => $plan_id, ':exp' => $newExpiration, ':id' => $data->member_id]);

    $conn->prepare("
        INSERT INTO payments
            (member_id, customer_type, amount, payment_date, plan_id,
             cash_amount, gcash_amount, maya_amount, debit_amount, credit_amount, reference_number)
        VALUES
            (:member_id, 'Member', :amount, CURRENT_DATE(), :plan_id,
             :cash, :gcash, :maya, :debit, :credit, :reference)
    ")->execute([
        ':member_id' => $data->member_id,
        ':amount'    => $custom_price,
        ':plan_id'   => $plan_id,
        ':cash'      => $cash_amount,
        ':gcash'     => $gcash_amount,
        ':maya'      => $maya_amount,
        ':debit'     => $debit_amount,
        ':credit'    => $credit_amount,
        ':reference' => $reference_number,
    ]);

    $conn->commit();
    echo json_encode([
        "success"        => true,
        "message"        => "Membership renewed successfully!",
        "new_expiration" => $newExpiration,
    ]);
} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

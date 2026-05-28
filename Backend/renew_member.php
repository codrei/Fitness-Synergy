<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
require_once 'audit.php';
$session = requireAuth();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->member_id) || empty($data->plan_id)) {
    echo json_encode(["success" => false, "error" => "Member ID and Plan are required."]);
    exit;
}

try {
    $plan_id      = (int)$data->plan_id;
    $bonus_days   = !empty($data->bonus_days)   ? (int)$data->bonus_days   : 0;
    $custom_price = !empty($data->custom_price) ? (float)$data->custom_price : null;

    $payment_method    = !empty($data->payment_method)    ? $data->payment_method                                        : 'Cash';
    $payment_amount    = isset($data->payment_amount) && $data->payment_amount !== '' ? (float)$data->payment_amount : null;
    $reference_number  = !empty($data->reference_number)  ? $data->reference_number                                      : null;
    $is_installment    = !empty($data->is_installment)    ? 1                                                             : 0;
    $installment_total = !empty($data->installment_total) ? (float)$data->installment_total                               : 0;

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

    // Get current member state including any open installment
    $mStmt = $conn->prepare("
        SELECT expiration_date, is_installment, installment_total, start_date
        FROM members WHERE member_id = :id
    ");
    $mStmt->execute([':id' => $data->member_id]);
    $currentMember = $mStmt->fetch(PDO::FETCH_ASSOC);

    if (!$currentMember) {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Member not found."]);
        exit;
    }

    // Block renewal if the current contract still has an outstanding installment balance.
    // Otherwise renewing would overwrite installment_total and reset start_date, silently
    // erasing the debt the member still owes on the previous contract.
    if ((int)$currentMember['is_installment'] === 1 && (float)$currentMember['installment_total'] > 0) {
        $paidStmt = $conn->prepare("
            SELECT COALESCE(SUM(amount), 0) FROM payments
            WHERE member_id = :id
              AND customer_type = 'Member'
              AND payment_date >= :start
        ");
        $paidStmt->execute([
            ':id'    => $data->member_id,
            ':start' => $currentMember['start_date'],
        ]);
        $outstanding = (float)$currentMember['installment_total'] - (float)$paidStmt->fetchColumn();
        if ($outstanding > 0.01) {
            http_response_code(409);
            echo json_encode([
                "success" => false,
                "error"   => "Cannot renew — this member has an outstanding installment balance of ₱"
                            . number_format($outstanding, 2)
                            . " on the current contract. Settle the full balance before renewing.",
            ]);
            exit;
        }
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
            plan_id           = :plan,
            start_date        = CURRENT_DATE(),
            expiration_date   = :exp,
            is_installment    = :is_installment,
            installment_total = :installment_total
        WHERE member_id = :id
    ")->execute([
        ':plan'              => $plan_id,
        ':exp'               => $newExpiration,
        ':id'                => $data->member_id,
        ':is_installment'    => $is_installment,
        ':installment_total' => $installment_total,
    ]);

    $conn->prepare("
        INSERT INTO payments
            (member_id, customer_type, amount, payment_date, plan_id,
             payment_method, reference_number, bonus_days)
        VALUES
            (:member_id, 'Member', :amount, CURRENT_DATE(), :plan_id,
             :payment_method, :reference, :bonus_days)
    ")->execute([
        ':member_id'      => $data->member_id,
        ':amount'         => ($is_installment && $payment_amount !== null) ? $payment_amount : $custom_price,
        ':plan_id'        => $plan_id,
        ':payment_method' => $payment_method,
        ':reference'      => $reference_number,
        ':bonus_days'     => $bonus_days,
    ]);

    $conn->commit();

    logActivity(
        $conn, $session,
        'member.renew', 'member', $data->member_id,
        "Renewed membership (plan_id $plan_id, new expiry $newExpiration)",
        [
            'plan_id'           => $plan_id,
            'new_expiration'    => $newExpiration,
            'is_installment'    => $is_installment,
            'installment_total' => $installment_total,
            'payment_amount'    => $payment_amount,
            'payment_method'    => $payment_method,
            'bonus_days'        => $bonus_days,
        ]
    );

    echo json_encode([
        "success"        => true,
        "message"        => "Membership renewed successfully!",
        "new_expiration" => $newExpiration,
    ]);
} catch (PDOException $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    error_log('[renew_member] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to renew membership. Please try again."]);
}

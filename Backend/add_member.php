<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';
require_once 'auth_check.php';
require_once 'audit.php';
$session = requireAuth();

$data = json_decode(file_get_contents("php://input"));

if (empty($data) || empty($data->full_name)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing member name."]);
    exit;
}

// ── 1. Extract and normalize ALL inputs up-front ──
$full_name                = trim($data->full_name);
$plan_id                  = !empty($data->plan_id) ? (int)$data->plan_id : 1;
$force                    = !empty($data->force);
$bonus_days               = !empty($data->bonus_days) ? (int)$data->bonus_days : 0;
$custom_price             = isset($data->custom_price) && $data->custom_price !== '' ? (float)$data->custom_price : null;

$payment_method           = !empty($data->payment_method)   ? $data->payment_method   : 'Cash';
$payment_amount           = isset($data->payment_amount) && $data->payment_amount !== '' ? (float)$data->payment_amount : null;
$reference_number         = !empty($data->reference_number) ? $data->reference_number : null;
$is_installment           = !empty($data->is_installment)   ? 1 : 0;
$installment_total        = !empty($data->installment_total) ? (float)$data->installment_total : 0;

$address                  = !empty($data->address)                   ? $data->address                  : null;
$contact_number           = !empty($data->contact_number)            ? trim($data->contact_number)     : null;
$dob                      = !empty($data->dob)                       ? $data->dob                      : null;
$gender                   = !empty($data->gender)                    ? $data->gender                   : null;
$occupation               = !empty($data->occupation)                ? $data->occupation               : null;
$age                      = isset($data->age) && $data->age !== ''   ? (int)$data->age                 : null;
$facebook                 = !empty($data->facebook)                  ? $data->facebook                 : null;
$emergency_contact_name   = !empty($data->emergency_contact_name)    ? $data->emergency_contact_name   : null;
$emergency_contact_number = !empty($data->emergency_contact_number)  ? $data->emergency_contact_number : null;
$discount_type            = !empty($data->discount_type)             ? $data->discount_type            : 'None';
$discount_id              = !empty($data->discount_id)               ? $data->discount_id              : null;
$discount_id_type         = !empty($data->discount_id_type)          ? $data->discount_id_type         : null;
$discount_school_name     = !empty($data->discount_school_name)      ? $data->discount_school_name     : null;

// ── 2. Required-field validation (defense-in-depth; UI also enforces) ──
if ($contact_number === null || !preg_match('/^09\d{9}$/', $contact_number)) {
    http_response_code(422);
    echo json_encode([
        "success" => false,
        "error"   => "Contact number must be exactly 11 digits starting with 09.",
    ]);
    exit;
}
if ($age === null || $age < 1 || $age > 120) {
    http_response_code(422);
    echo json_encode([
        "success" => false,
        "error"   => "Age is required and must be between 1 and 120.",
    ]);
    exit;
}
if ($dob !== null && strtotime($dob) > strtotime(date('Y-m-d'))) {
    http_response_code(422);
    echo json_encode([
        "success" => false,
        "error"   => "Date of birth cannot be in the future.",
    ]);
    exit;
}

try {
    // ── 3. Duplicate-member check ──
    if (!$force && $contact_number !== null) {
        $dupCheck = $conn->prepare("
            SELECT member_id, full_name, contract_id
            FROM members
            WHERE LOWER(TRIM(full_name)) = LOWER(TRIM(:name))
              AND contact_number = :contact
            LIMIT 1
        ");
        $dupCheck->execute([':name' => $full_name, ':contact' => $contact_number]);
        $existing = $dupCheck->fetch(PDO::FETCH_ASSOC);
        if ($existing) {
            http_response_code(409);
            echo json_encode([
                "success"           => false,
                "duplicate_warning" => true,
                "existing_name"     => $existing['full_name'],
                "existing_contract" => $existing['contract_id'],
            ]);
            exit;
        }
    }

    // ── 3. Resolve plan duration and expiration ──
    $planQuery = $conn->prepare("SELECT duration_days, price FROM plans WHERE plan_id = :plan");
    $planQuery->execute([':plan' => $plan_id]);
    $planRow = $planQuery->fetch(PDO::FETCH_ASSOC);

    if (!$planRow) {
        http_response_code(422);
        echo json_encode(["success" => false, "error" => "Selected plan does not exist."]);
        exit;
    }

    $total_days     = (int)$planRow['duration_days'] + $bonus_days;
    $expirationDate = date('Y-m-d', strtotime("+$total_days days"));

    if ($custom_price === null) {
        $custom_price = (float)$planRow['price'];
    }

    // ── 4. Atomic insert: contract_id + member + payment in one transaction ──
    $conn->beginTransaction();

    // Reserve next contract_id sequence via row-level lock (no MAX+1 race condition)
    $conn->prepare("UPDATE contract_counter SET last_seq = last_seq + 1 WHERE id = 1")->execute();
    $seq = (int)$conn->query("SELECT last_seq FROM contract_counter WHERE id = 1")->fetchColumn();
    $contract_id = sprintf('FS-%06d', $seq);

    $insertMember = $conn->prepare("
        INSERT INTO members (
            full_name, address, contact_number, dob, age, gender, occupation, facebook,
            emergency_contact_name, emergency_contact_number, contract_id,
            discount_type, discount_id, discount_id_type, discount_school_name,
            plan_id, start_date, expiration_date, is_installment, installment_total
        ) VALUES (
            :name, :address, :contact_number, :dob, :age, :gender, :occupation, :facebook,
            :emergency_name, :emergency_number, :contract_id,
            :discount_type, :discount_id, :discount_id_type, :discount_school_name,
            :plan, CURRENT_DATE(), :expiration, :is_installment, :installment_total
        )
    ");
    $insertMember->execute([
        ':name'                 => $full_name,
        ':address'              => $address,
        ':contact_number'       => $contact_number,
        ':dob'                  => $dob,
        ':age'                  => $age,
        ':gender'               => $gender,
        ':occupation'           => $occupation,
        ':facebook'             => $facebook,
        ':emergency_name'       => $emergency_contact_name,
        ':emergency_number'     => $emergency_contact_number,
        ':contract_id'          => $contract_id,
        ':discount_type'        => $discount_type,
        ':discount_id'          => $discount_id,
        ':discount_id_type'     => $discount_id_type,
        ':discount_school_name' => $discount_school_name,
        ':plan'                 => $plan_id,
        ':expiration'           => $expirationDate,
        ':is_installment'       => $is_installment,
        ':installment_total'    => $installment_total,
    ]);
    $new_member_id = (int)$conn->lastInsertId();

    $insertPayment = $conn->prepare("
        INSERT INTO payments
            (member_id, customer_type, amount, payment_date, plan_id,
             payment_method, reference_number, bonus_days)
        VALUES
            (:member_id, 'Member', :amount, CURRENT_DATE(), :plan_id,
             :payment_method, :reference, :bonus_days)
    ");
    $insertPayment->execute([
        ':member_id'      => $new_member_id,
        ':amount'         => ($is_installment && $payment_amount !== null) ? $payment_amount : $custom_price,
        ':plan_id'        => $plan_id,
        ':payment_method' => $payment_method,
        ':reference'      => $reference_number,
        ':bonus_days'     => $bonus_days,
    ]);

    $conn->commit();

    logActivity(
        $conn, $session,
        'member.create', 'member', $new_member_id,
        "Registered new member: $full_name ($contract_id)",
        [
            'full_name'         => $full_name,
            'contract_id'       => $contract_id,
            'plan_id'           => $plan_id,
            'is_installment'    => $is_installment,
            'installment_total' => $installment_total,
            'payment_method'    => $payment_method,
        ]
    );

    echo json_encode([
        "success"     => true,
        "message"     => "Member added successfully!",
        "contract_id" => $contract_id,
        "member_id"   => $new_member_id,
    ]);

} catch (PDOException $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    error_log('[add_member] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to create member. Please try again."]);
}

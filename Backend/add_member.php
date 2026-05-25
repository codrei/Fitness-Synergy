<?php
require_once 'cors.php';


require_once 'db.php';
require_once 'auth_check.php';
requireAuth();
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->full_name)) {
    try {
        $plan_id = !empty($data->plan_id) ? (int)$data->plan_id : 1;
        
        // FIX: Safely grab editing_id from frontend payload to prevent undefined variable errors
        $editingId = !empty($data->editing_id) ? $data->editing_id : null;
        
        // PROMO FLEXIBILITY: Catch custom price and bonus days from React frontend
        $bonus_days   = !empty($data->bonus_days) ? (int)$data->bonus_days : 0;
        $custom_price = !empty($data->custom_price) ? (float)$data->custom_price : null; 

        // PAYMENT METHOD BREAKDOWN
        $cash_amount          = !empty($data->cash_amount)          ? (float)$data->cash_amount          : 0;
        $gcash_amount         = !empty($data->gcash_amount)         ? (float)$data->gcash_amount         : 0;
        $maya_amount          = !empty($data->maya_amount)          ? (float)$data->maya_amount          : 0;
        $bank_transfer_amount = !empty($data->bank_transfer_amount) ? (float)$data->bank_transfer_amount : 0;
        $debit_amount         = !empty($data->debit_amount)         ? (float)$data->debit_amount         : 0;
        $credit_amount        = !empty($data->credit_amount)        ? (float)$data->credit_amount        : 0;
        $reference_number     = !empty($data->reference_number)     ? $data->reference_number            : null;
        $is_installment       = !empty($data->is_installment)       ? 1                                  : 0;
        $installment_total    = !empty($data->installment_total)    ? (float)$data->installment_total    : 0;
        $actual_paid          = $cash_amount + $gcash_amount + $maya_amount + $bank_transfer_amount + $debit_amount + $credit_amount;

        // Fetch base duration days from the chosen plan tier
        $planQuery = $conn->prepare("SELECT duration_days FROM plans WHERE plan_id = :plan");
        $planQuery->execute([':plan' => $plan_id]);
        $base_duration = (int)$planQuery->fetchColumn();

        // Combine plan duration with manual promo bonus days
        $total_days = $base_duration + $bonus_days;

        // Calculate dynamic promotional expiration date
        if ($total_days <= 1) {
            $expirationDate = date('Y-m-d');
        } else {
            $expirationDate = date('Y-m-d', strtotime("+$total_days days"));
        }

        // Sanitize incoming fields, mapping missing parameters to NULL
        $address                  = !empty($data->address)                   ? $data->address                   : null;
        $contact_number           = !empty($data->contact_number)            ? $data->contact_number            : null;
        $dob                      = !empty($data->dob)                       ? $data->dob                       : null;
        $gender                   = !empty($data->gender)                    ? $data->gender                    : null;
        $occupation               = !empty($data->occupation)                ? $data->occupation                : null;
        $facebook                 = !empty($data->facebook)                  ? $data->facebook                  : null;
        $emergency_contact_name   = !empty($data->emergency_contact_name)   ? $data->emergency_contact_name    : null;
        $emergency_contact_number = !empty($data->emergency_contact_number) ? $data->emergency_contact_number  : null;
        $discount_type            = !empty($data->discount_type)             ? $data->discount_type             : 'None';
        $discount_id              = !empty($data->discount_id)               ? $data->discount_id               : null;
        $discount_id_type         = !empty($data->discount_id_type)          ? $data->discount_id_type          : null;
        $discount_school_name     = !empty($data->discount_school_name)      ? $data->discount_school_name      : null;

        // Auto-generate contract ID in FS-XXXXXX format
        $maxStmt = $conn->query("SELECT MAX(CAST(REPLACE(contract_id, 'FS-', '') AS UNSIGNED)) FROM members WHERE contract_id REGEXP '^FS-[0-9]+$'");
        $maxNum  = (int)$maxStmt->fetchColumn();
        $contract_id = 'FS-' . str_pad($maxNum + 1, 6, '0', STR_PAD_LEFT);

        $query = $conn->prepare("
            INSERT INTO members (
                full_name, address, contact_number, dob, gender, occupation, facebook,
                emergency_contact_name, emergency_contact_number, contract_id,
                discount_type, discount_id, discount_id_type, discount_school_name,
                plan_id, start_date, expiration_date, is_installment, installment_total
            ) VALUES (
                :name, :address, :contact_number, :dob, :gender, :occupation, :facebook,
                :emergency_name, :emergency_number, :contract_id,
                :discount_type, :discount_id, :discount_id_type, :discount_school_name,
                :plan, CURRENT_DATE(), :expiration, :is_installment, :installment_total
            )
        ");

        $query->execute([
            ':name'                 => $data->full_name,
            ':address'              => $address,
            ':contact_number'       => $contact_number,
            ':dob'                  => $dob,
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

        // === NEW BILLING TRACKING RECORD INSIDE PAYMENTS TABLE ===
        if (!$editingId) { // Only log payments for new member registrations
            $new_member_id = $conn->lastInsertId();

            // Fallback to default base price from database if custom price was left blank
            if ($custom_price === null) {
                $priceQuery = $conn->prepare("SELECT price FROM plans WHERE plan_id = :plan");
                $priceQuery->execute([':plan' => $plan_id]);
                $custom_price = (float)$priceQuery->fetchColumn();
            }

        $paymentQuery = $conn->prepare("
            INSERT INTO payments
                (member_id, customer_type, amount, payment_date, plan_id,
                 cash_amount, gcash_amount, maya_amount, bank_transfer_amount,
                 debit_amount, credit_amount, reference_number)
            VALUES
                (:member_id, 'Member', :amount, CURRENT_DATE(), :plan_id,
                 :cash, :gcash, :maya, :bank,
                 :debit, :credit, :reference)
        ");
        $paymentQuery->execute([
            ':member_id' => $new_member_id,
            ':amount'    => ($is_installment && $actual_paid > 0) ? $actual_paid : $custom_price,
            ':plan_id'   => $plan_id,
            ':cash'      => $cash_amount,
            ':gcash'     => $gcash_amount,
            ':maya'      => $maya_amount,
            ':bank'      => $bank_transfer_amount,
            ':debit'     => $debit_amount,
            ':credit'    => $credit_amount,
            ':reference' => $reference_number,
        ]);
        }

        echo json_encode(["success" => true, "message" => "Member added successfully!", "contract_id" => $contract_id]);
    } catch (PDOException $e) {
        if (isset($e->errorInfo[1]) && $e->errorInfo[1] == 1062) {
            echo json_encode(["success" => false, "error" => "Contract ID already exists."]);
        } else {
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }
} else {
    echo json_encode(["success" => false, "error" => "Missing member name."]);
}
?>
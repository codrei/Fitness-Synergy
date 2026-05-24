<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

require_once 'db.php';
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->full_name)) {
    try {
        $plan_id = !empty($data->plan_id) ? (int)$data->plan_id : 1;
        
        // FIX: Safely grab editing_id from frontend payload to prevent undefined variable errors
        $editingId = !empty($data->editing_id) ? $data->editing_id : null;
        
        // PROMO FLEXIBILITY: Catch custom price and bonus days from React frontend
        $bonus_days   = !empty($data->bonus_days) ? (int)$data->bonus_days : 0;
        $custom_price = !empty($data->custom_price) ? (float)$data->custom_price : null; 

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
        $address                  = !empty($data->address) ? $data->address : null;
        $contact_number           = !empty($data->contact_number) ? $data->contact_number : null;
        $dob                      = !empty($data->dob) ? $data->dob : null;
        $gender                   = !empty($data->gender) ? $data->gender : null;
        $occupation               = !empty($data->occupation) ? $data->occupation : null;
        $emergency_contact_name   = !empty($data->emergency_contact_name) ? $data->emergency_contact_name : null;
        $emergency_contact_number = !empty($data->emergency_contact_number) ? $data->emergency_contact_number : null;
        $contract_id              = !empty($data->contract_id) ? $data->contract_id : null;
        $discount_type            = !empty($data->discount_type) ? $data->discount_type : 'None';
        $discount_id              = !empty($data->discount_id) ? $data->discount_id : null;

        $query = $conn->prepare("
            INSERT INTO members (
                full_name, address, contact_number, dob, gender, occupation, 
                emergency_contact_name, emergency_contact_number, contract_id, 
                discount_type, discount_id, plan_id, start_date, expiration_date
            ) VALUES (
                :name, :address, :contact_number, :dob, :gender, :occupation, 
                :emergency_name, :emergency_number, :contract_id, 
                :discount_type, :discount_id, :plan, CURRENT_DATE(), :expiration
            )
        ");

        $query->execute([
            ':name'             => $data->full_name,
            ':address'          => $address,
            ':contact_number'   => $contact_number,
            ':dob'              => $dob,
            ':gender'           => $gender,
            ':occupation'       => $occupation,
            ':emergency_name'   => $emergency_contact_name,
            ':emergency_number' => $emergency_contact_number,
            ':contract_id'      => $contract_id,
            ':discount_type'    => $discount_type,
            ':discount_id'      => $discount_id,
            ':plan'             => $plan_id,
            ':expiration'       => $expirationDate
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
                INSERT INTO payments (member_id, amount, payment_date, plan_id) 
                VALUES (:member_id, :amount, CURRENT_DATE(), :plan_id)
            ");
            $paymentQuery->execute([
                ':member_id' => $new_member_id,
                ':amount'    => $custom_price,
                ':plan_id'   => $plan_id
            ]);
        }

        echo json_encode(["success" => true, "message" => "Member added successfully with promotional parameters!"]);
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
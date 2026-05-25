<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

require_once 'db.php';
require_once 'auth_check.php';
requireAuth();
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->member_id) && !empty($data->full_name)) {
    try {
        $plan_id = !empty($data->plan_id) ? (int)$data->plan_id : 1;
        
        // PROMO FLEXIBILITY: Read manual changes from the form edit submission
        $bonus_days   = !empty($data->bonus_days) ? (int)$data->bonus_days : 0;
        $custom_price = !empty($data->custom_price) ? (float)$data->custom_price : null;

        // Pull current expiration benchmarks
        $mStmt = $conn->prepare("SELECT plan_id, start_date, expiration_date FROM members WHERE member_id = :id");
        $mStmt->execute([':id' => $data->member_id]);
        $currentMember = $mStmt->fetch(PDO::FETCH_ASSOC);

        if (!$currentMember) {
            echo json_encode(["success" => false, "error" => "Member record not found."]);
            exit;
        }

        $startDate      = $currentMember['start_date'];
        $expirationDate = $currentMember['expiration_date'];

        // TIMELINE MANIPULATION 
        if ((int)$currentMember['plan_id'] !== $plan_id) {
            // Case A: Admin switched their core plan tier entirely
            $pStmt = $conn->prepare("SELECT duration_days FROM plans WHERE plan_id = :p");
            $pStmt->execute([':p' => $plan_id]);
            $base_duration = (int)$pStmt->fetchColumn();

            $startDate = date('Y-m-d');
            $baseDate = (strtotime($currentMember['expiration_date']) >= strtotime($startDate)) 
                ? new DateTime($currentMember['expiration_date']) 
                : new DateTime($startDate);

            $total_days = $base_duration + $bonus_days;
            $baseDate->modify("+$total_days days");
            $expirationDate = $baseDate->format('Y-m-d');

        } else if ($bonus_days > 0) {
            // Case B: Keeping the same tier, but the admin is manually granting extra promotional days
            $baseDate = (strtotime($currentMember['expiration_date']) >= strtotime(date('Y-m-d'))) 
                ? new DateTime($currentMember['expiration_date']) 
                : new DateTime(); // If currently expired, start tracking from today
            
            $baseDate->modify("+$bonus_days days");
            $expirationDate = $baseDate->format('Y-m-d');
        }

        // Sanitize incoming fields mapping missing parameters to NULL
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
            UPDATE members SET 
                full_name = :name, 
                address = :address,
                contact_number = :contact_number,
                dob = :dob,
                gender = :gender,
                occupation = :occupation,
                emergency_contact_name = :emergency_name,
                emergency_contact_number = :emergency_number,
                contract_id = :contract_id,
                discount_type = :discount_type,
                discount_id = :discount_id,
                plan_id = :plan, 
                start_date = :start, 
                expiration_date = :exp 
            WHERE member_id = :id
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
            ':start'            => $startDate,
            ':exp'              => $expirationDate, 
            ':id'               => $data->member_id
        ]);

        echo json_encode(["success" => true, "message" => "Member status and customized duration updated!"]);
    } catch(PDOException $e) {
        if (isset($e->errorInfo[1]) && $e->errorInfo[1] == 1062) {
            echo json_encode(["success" => false, "error" => "Contract ID matches a pre-existing record."]);
        } else {
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }
} else {
    echo json_encode(["success" => false, "error" => "Incomplete request identification parameters."]);
}
?>
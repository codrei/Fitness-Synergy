<?php
require_once 'cors.php';
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->member_id) || empty($data->full_name)) {
    echo json_encode(["success" => false, "error" => "Member ID and name are required."]);
    exit;
}

try {
    $conn->prepare("
        UPDATE members SET
            full_name                = :name,
            address                  = :address,
            contact_number           = :contact,
            dob                      = :dob,
            gender                   = :gender,
            occupation               = :occupation,
            emergency_contact_name   = :emg_name,
            emergency_contact_number = :emg_number,
            contract_id              = :contract_id,
            discount_type            = :discount_type,
            discount_id              = :discount_id
        WHERE member_id = :id
    ")->execute([
        ':name'          => $data->full_name,
        ':address'       => !empty($data->address)                  ? $data->address                  : null,
        ':contact'       => !empty($data->contact_number)           ? $data->contact_number           : null,
        ':dob'           => !empty($data->dob)                      ? $data->dob                      : null,
        ':gender'        => !empty($data->gender)                   ? $data->gender                   : null,
        ':occupation'    => !empty($data->occupation)               ? $data->occupation               : null,
        ':emg_name'      => !empty($data->emergency_contact_name)   ? $data->emergency_contact_name   : null,
        ':emg_number'    => !empty($data->emergency_contact_number) ? $data->emergency_contact_number : null,
        ':contract_id'   => !empty($data->contract_id)              ? $data->contract_id              : null,
        ':discount_type' => !empty($data->discount_type)            ? $data->discount_type            : 'None',
        ':discount_id'   => !empty($data->discount_id)              ? $data->discount_id              : null,
        ':id'            => $data->member_id,
    ]);
    echo json_encode(["success" => true, "message" => "Member info updated."]);
} catch (PDOException $e) {
    if (isset($e->errorInfo[1]) && $e->errorInfo[1] == 1062) {
        echo json_encode(["success" => false, "error" => "Contract ID matches a pre-existing record."]);
    } else {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}

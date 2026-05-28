<?php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
require_once 'auth_check.php';
requireAuth();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->member_id) || empty($data->full_name)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Member ID and name are required."]);
    exit;
}

// Validate format if provided (existing records may have NULL — that's allowed)
if (!empty($data->contact_number) && !preg_match('/^09\d{9}$/', $data->contact_number)) {
    http_response_code(422);
    echo json_encode([
        "success" => false,
        "error"   => "Contact number must be exactly 11 digits starting with 09.",
    ]);
    exit;
}
if (isset($data->age) && $data->age !== '' && $data->age !== null) {
    $ageInt = (int)$data->age;
    if ($ageInt < 1 || $ageInt > 120) {
        http_response_code(422);
        echo json_encode([
            "success" => false,
            "error"   => "Age must be between 1 and 120.",
        ]);
        exit;
    }
}

try {
    $conn->prepare("
        UPDATE members SET
            full_name                = :name,
            address                  = :address,
            contact_number           = :contact,
            dob                      = :dob,
            age                      = :age,
            gender                   = :gender,
            occupation               = :occupation,
            facebook                 = :facebook,
            emergency_contact_name   = :emg_name,
            emergency_contact_number = :emg_number,
            discount_type            = :discount_type,
            discount_id              = :discount_id,
            discount_id_type         = :discount_id_type,
            discount_school_name     = :discount_school_name
        WHERE member_id = :id
    ")->execute([
        ':name'                 => $data->full_name,
        ':address'              => !empty($data->address)                  ? $data->address                  : null,
        ':contact'              => !empty($data->contact_number)           ? $data->contact_number           : null,
        ':dob'                  => !empty($data->dob)                      ? $data->dob                      : null,
        ':age'                  => isset($data->age) && $data->age !== '' ? (int)$data->age                  : null,
        ':gender'               => !empty($data->gender)                   ? $data->gender                   : null,
        ':occupation'           => !empty($data->occupation)               ? $data->occupation               : null,
        ':facebook'             => !empty($data->facebook)                 ? $data->facebook                 : null,
        ':emg_name'             => !empty($data->emergency_contact_name)   ? $data->emergency_contact_name   : null,
        ':emg_number'           => !empty($data->emergency_contact_number) ? $data->emergency_contact_number : null,
        ':discount_type'        => !empty($data->discount_type)            ? $data->discount_type            : 'None',
        ':discount_id'          => !empty($data->discount_id)              ? $data->discount_id              : null,
        ':discount_id_type'     => !empty($data->discount_id_type)         ? $data->discount_id_type         : null,
        ':discount_school_name' => !empty($data->discount_school_name)     ? $data->discount_school_name     : null,
        ':id'                   => $data->member_id,
    ]);
    echo json_encode(["success" => true, "message" => "Member info updated."]);
} catch (PDOException $e) {
    error_log('[update_member_info] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to update member info. Please try again."]);
}

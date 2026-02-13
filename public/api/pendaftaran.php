<?php
require_once 'db.php';
require_once 'helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

function mapPendaftaran($row) {
    if (!$row) return null;
    return [
        'id' => $row['id'],
        'isOpen' => (bool)$row['is_open'],
        'description' => $row['description'],
        'descriptionExtra' => $row['description_extra'],
        'requirements' => safeJsonDecode($row['requirements'], []),
        'waves' => safeJsonDecode($row['waves'], []),
        'registrationUrl' => $row['registration_url'],
        'brochureUrl' => $row['brochure_url'] ?? ''
    ];
}

switch ($method) {
    case 'GET':
        $stmt = $pdo->query('SELECT * FROM pendaftaran WHERE id = 1');
        $row = $stmt->fetch();
        jsonResponse(mapPendaftaran($row));
        break;

    case 'PUT':
        $input = getJsonInput();
        
        $stmt = $pdo->prepare('UPDATE pendaftaran SET is_open = ?, description = ?, description_extra = ?, requirements = ?, waves = ?, registration_url = ?, brochure_url = ? WHERE id = 1');
        $stmt->execute([
            !empty($input['isOpen']) ? 1 : 0,
            $input['description'] ?? '',
            $input['descriptionExtra'] ?? '',
            json_encode($input['requirements'] ?? []),
            json_encode($input['waves'] ?? []),
            $input['registrationUrl'] ?? '',
            $input['brochureUrl'] ?? ''
        ]);
        
        $stmt = $pdo->query('SELECT * FROM pendaftaran WHERE id = 1');
        jsonResponse(mapPendaftaran($stmt->fetch()));
        break;

    default:
        jsonError('Method not allowed', 405);
}

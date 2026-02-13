<?php
require_once 'db.php';
require_once 'helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

function mapPendidikan($row) {
    if (!$row) return null;
    return [
        'id' => $row['id'],
        'formal' => safeJsonDecode($row['formal'], []),
        'nonFormal' => safeJsonDecode($row['non_formal'], []),
        'extracurriculars' => safeJsonDecode($row['extracurriculars'], []),
        'schedule' => safeJsonDecode($row['schedule'], [])
    ];
}

switch ($method) {
    case 'GET':
        $stmt = $pdo->query('SELECT * FROM pendidikan WHERE id = 1');
        $row = $stmt->fetch();
        jsonResponse(mapPendidikan($row));
        break;

    case 'PUT':
        $input = getJsonInput();
        
        $stmt = $pdo->prepare('UPDATE pendidikan SET formal = ?, non_formal = ?, extracurriculars = ?, schedule = ? WHERE id = 1');
        $stmt->execute([
            json_encode($input['formal'] ?? []),
            json_encode($input['nonFormal'] ?? []),
            json_encode($input['extracurriculars'] ?? []),
            json_encode($input['schedule'] ?? [])
        ]);
        
        $stmt = $pdo->query('SELECT * FROM pendidikan WHERE id = 1');
        jsonResponse(mapPendidikan($stmt->fetch()));
        break;

    default:
        jsonError('Method not allowed', 405);
}

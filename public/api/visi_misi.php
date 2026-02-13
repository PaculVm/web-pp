<?php
require_once 'db.php';
require_once 'helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

function mapVisiMisi($row) {
    if (!$row) return null;
    return [
        'id' => $row['id'],
        'visi' => $row['visi'],
        'misi' => safeJsonDecode($row['misi'], [])
    ];
}

switch ($method) {
    case 'GET':
        $stmt = $pdo->query('SELECT * FROM visi_misi WHERE id = 1');
        $row = $stmt->fetch();
        jsonResponse(mapVisiMisi($row));
        break;

    case 'PUT':
        $input = getJsonInput();
        
        $stmt = $pdo->prepare('UPDATE visi_misi SET visi = ?, misi = ? WHERE id = 1');
        $stmt->execute([
            $input['visi'] ?? '',
            json_encode($input['misi'] ?? [])
        ]);
        
        $stmt = $pdo->query('SELECT * FROM visi_misi WHERE id = 1');
        jsonResponse(mapVisiMisi($stmt->fetch()));
        break;

    default:
        jsonError('Method not allowed', 405);
}

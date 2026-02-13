<?php
require_once 'db.php';
require_once 'helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

function mapSekilasPandang($row) {
    if (!$row) return null;
    return [
        'id' => $row['id'],
        'title' => $row['title'],
        'content' => $row['content'],
        'image' => $row['image'],
        'stats' => safeJsonDecode($row['stats'], [])
    ];
}

switch ($method) {
    case 'GET':
        $stmt = $pdo->query('SELECT * FROM sekilas_pandang WHERE id = 1');
        $row = $stmt->fetch();
        jsonResponse(mapSekilasPandang($row));
        break;

    case 'PUT':
        $input = getJsonInput();
        
        $stmt = $pdo->prepare('UPDATE sekilas_pandang SET title = ?, content = ?, image = ?, stats = ? WHERE id = 1');
        $stmt->execute([
            $input['title'] ?? '',
            $input['content'] ?? '',
            $input['image'] ?? '',
            json_encode($input['stats'] ?? [])
        ]);
        
        $stmt = $pdo->query('SELECT * FROM sekilas_pandang WHERE id = 1');
        jsonResponse(mapSekilasPandang($stmt->fetch()));
        break;

    default:
        jsonError('Method not allowed', 405);
}

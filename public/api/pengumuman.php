<?php
require_once 'db.php';
require_once 'helpers.php';
require_once 'jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare('SELECT * FROM pengumuman WHERE id = ?');
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if ($row) {
                $row['important'] = (bool)$row['important'];
            }
            jsonResponse($row ?: null);
        } else {
            $stmt = $pdo->query('SELECT * FROM pengumuman ORDER BY date DESC, id DESC');
            $rows = $stmt->fetchAll();
            foreach ($rows as &$row) {
                $row['important'] = (bool)$row['important'];
            }
            jsonResponse($rows);
        }
        break;

    case 'POST':
        $input = getJsonInput();
        
        $stmt = $pdo->prepare('INSERT INTO pengumuman (title, content, date, important) VALUES (?, ?, ?, ?)');
        $stmt->execute([
            $input['title'] ?? '',
            $input['content'] ?? '',
            $input['date'] ?? date('Y-m-d'),
            !empty($input['important']) ? 1 : 0
        ]);
        
        $newId = $pdo->lastInsertId();
        $stmt = $pdo->prepare('SELECT * FROM pengumuman WHERE id = ?');
        $stmt->execute([$newId]);
        $row = $stmt->fetch();
        $row['important'] = (bool)$row['important'];
        jsonResponse($row);
        break;

    case 'PUT':
        if (!$id) jsonError('ID is required', 400);
        
        $input = getJsonInput();
        $stmt = $pdo->prepare('UPDATE pengumuman SET title = ?, content = ?, date = ?, important = ? WHERE id = ?');
        $stmt->execute([
            $input['title'] ?? '',
            $input['content'] ?? '',
            $input['date'] ?? date('Y-m-d'),
            !empty($input['important']) ? 1 : 0,
            $id
        ]);
        
        $stmt = $pdo->prepare('SELECT * FROM pengumuman WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        $row['important'] = (bool)$row['important'];
        jsonResponse($row);
        break;

    case 'DELETE':
        if (!$id) jsonError('ID is required', 400);
        
        $stmt = $pdo->prepare('DELETE FROM pengumuman WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse(['success' => true]);
        break;

    default:
        jsonError('Method not allowed', 405);
}

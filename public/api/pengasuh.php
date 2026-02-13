<?php
require_once 'db.php';
require_once 'helpers.php';
require_once 'jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare('SELECT * FROM pengasuh WHERE id = ?');
            $stmt->execute([$id]);
            jsonResponse($stmt->fetch() ?: null);
        } else {
            $stmt = $pdo->query('SELECT * FROM pengasuh ORDER BY id DESC');
            jsonResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        $input = getJsonInput();
        
        $stmt = $pdo->prepare('INSERT INTO pengasuh (name, role, image, bio) VALUES (?, ?, ?, ?)');
        $stmt->execute([
            $input['name'] ?? '',
            $input['role'] ?? '',
            $input['image'] ?? '',
            $input['bio'] ?? ''
        ]);
        
        $newId = $pdo->lastInsertId();
        $stmt = $pdo->prepare('SELECT * FROM pengasuh WHERE id = ?');
        $stmt->execute([$newId]);
        jsonResponse($stmt->fetch());
        break;

    case 'PUT':
        if (!$id) jsonError('ID is required', 400);
        
        $input = getJsonInput();
        $stmt = $pdo->prepare('UPDATE pengasuh SET name = ?, role = ?, image = ?, bio = ? WHERE id = ?');
        $stmt->execute([
            $input['name'] ?? '',
            $input['role'] ?? '',
            $input['image'] ?? '',
            $input['bio'] ?? '',
            $id
        ]);
        
        $stmt = $pdo->prepare('SELECT * FROM pengasuh WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse($stmt->fetch());
        break;

    case 'DELETE':
        if (!$id) jsonError('ID is required', 400);
        
        $stmt = $pdo->prepare('DELETE FROM pengasuh WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse(['success' => true]);
        break;

    default:
        jsonError('Method not allowed', 405);
}

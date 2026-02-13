<?php
require_once 'db.php';
require_once 'helpers.php';
require_once 'jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare('SELECT * FROM hero_slides WHERE id = ?');
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            jsonResponse($row ?: null);
        } else {
            $stmt = $pdo->query('SELECT * FROM hero_slides ORDER BY sort_order ASC, id ASC');
            jsonResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        $input = getJsonInput();
        $title = $input['title'] ?? '';
        
        if (!$title) {
            jsonError('Title is required', 400);
        }
        
        $stmt = $pdo->prepare('INSERT INTO hero_slides (title, subtitle, description, image_url, button_text, button_link, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $title,
            $input['subtitle'] ?? null,
            $input['description'] ?? null,
            $input['image_url'] ?? null,
            $input['button_text'] ?? null,
            $input['button_link'] ?? null,
            $input['sort_order'] ?? 0
        ]);
        
        $newId = $pdo->lastInsertId();
        $stmt = $pdo->prepare('SELECT * FROM hero_slides WHERE id = ?');
        $stmt->execute([$newId]);
        jsonResponse($stmt->fetch());
        break;

    case 'PUT':
        if (!$id) jsonError('ID is required', 400);
        
        $input = getJsonInput();
        $stmt = $pdo->prepare('UPDATE hero_slides SET title = ?, subtitle = ?, description = ?, image_url = ?, button_text = ?, button_link = ?, sort_order = ? WHERE id = ?');
        $stmt->execute([
            $input['title'] ?? '',
            $input['subtitle'] ?? null,
            $input['description'] ?? null,
            $input['image_url'] ?? null,
            $input['button_text'] ?? null,
            $input['button_link'] ?? null,
            $input['sort_order'] ?? 0,
            $id
        ]);
        
        $stmt = $pdo->prepare('SELECT * FROM hero_slides WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse($stmt->fetch());
        break;

    case 'DELETE':
        if (!$id) jsonError('ID is required', 400);
        
        $stmt = $pdo->prepare('DELETE FROM hero_slides WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse(['success' => true]);
        break;

    default:
        jsonError('Method not allowed', 405);
}

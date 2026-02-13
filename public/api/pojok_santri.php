<?php
require_once 'db.php';
require_once 'helpers.php';
require_once 'jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

$statusFilter = $_GET['status'] ?? 'published';

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare('SELECT * FROM pojok_santri WHERE id = ?');
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if ($row) {
                $row['authorRole'] = $row['author_role'];
                unset($row['author_role']);
            }
            jsonResponse($row ?: null);
        } else {
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 9999);
            $offset = ($page - 1) * $limit;

            if ($statusFilter === 'all') {
                $stmt = $pdo->prepare('SELECT * FROM pojok_santri ORDER BY date DESC, id DESC LIMIT ? OFFSET ?');
                $countStmt = $pdo->query('SELECT COUNT(*) as total FROM pojok_santri');
            } else {
                $stmt = $pdo->prepare('SELECT * FROM pojok_santri WHERE status = ? ORDER BY date DESC, id DESC LIMIT ? OFFSET ?');
                $stmt->bindValue(1, $statusFilter, PDO::PARAM_STR);
                $stmt->bindValue(2, $limit, PDO::PARAM_INT);
                $stmt->bindValue(3, $offset, PDO::PARAM_INT);
                $stmt->execute();
                $rows = $stmt->fetchAll();

                $countStmt = $pdo->prepare('SELECT COUNT(*) as total FROM pojok_santri WHERE status = ?');
                $countStmt->execute([$statusFilter]);
                $total = $countStmt->fetch()['total'];

                foreach ($rows as &$row) {
                    $row['authorRole'] = $row['author_role'];
                    unset($row['author_role']);
                }

                jsonResponse([
                    'data' => $rows,
                    'total' => (int)$total,
                    'page' => $page,
                    'limit' => $limit
                ]);
                break;
            }

            $stmt->bindValue(1, $limit, PDO::PARAM_INT);
            $stmt->bindValue(2, $offset, PDO::PARAM_INT);
            $stmt->execute();
            $rows = $stmt->fetchAll();

            foreach ($rows as &$row) {
                $row['authorRole'] = $row['author_role'];
                unset($row['author_role']);
            }

            $total = $countStmt->fetch()['total'];

            jsonResponse([
                'data' => $rows,
                'total' => (int)$total,
                'page' => $page,
                'limit' => $limit
            ]);
        }
        break;

    case 'POST':
        $input = getJsonInput();
        
        // Insert termasuk kolom status agar jumlah kolom dan nilai sesuai
        $stmt = $pdo->prepare('INSERT INTO pojok_santri (title, content, author, author_role, date, image, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $input['title'] ?? '',
            $input['content'] ?? '',
            $input['author'] ?? '',
            $input['authorRole'] ?? '',
            $input['date'] ?? date('Y-m-d'),
            $input['image'] ?? '',
            $input['category'] ?? 'Kegiatan',
            $input['status'] ?? 'draft'
        ]);
        
        $newId = $pdo->lastInsertId();
        $stmt = $pdo->prepare('SELECT * FROM pojok_santri WHERE id = ?');
        $stmt->execute([$newId]);
        $row = $stmt->fetch();
        $row['authorRole'] = $row['author_role'];
        unset($row['author_role']);
        jsonResponse($row);
        break;

    case 'PUT':
        if (!$id) jsonError('ID is required', 400);
        
        $input = getJsonInput();
        $stmt = $pdo->prepare('UPDATE pojok_santri SET title = ?, content = ?, author = ?, author_role = ?, date = ?, image = ?, category = ?, status = ? WHERE id = ?');
        $stmt->execute([
            $input['title'] ?? '',
            $input['content'] ?? '',
            $input['author'] ?? '',
            $input['authorRole'] ?? '',
            $input['date'] ?? date('Y-m-d'),
            $input['image'] ?? '',
            $input['category'] ?? 'Kegiatan',
            $input['status'] ?? 'published',
            $id
        ]);
        
        $stmt = $pdo->prepare('SELECT * FROM pojok_santri WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        $row['authorRole'] = $row['author_role'];
        unset($row['author_role']);
        jsonResponse($row);
        break;

    case 'DELETE':
        if (!$id) jsonError('ID is required', 400);
        
        $stmt = $pdo->prepare('DELETE FROM pojok_santri WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse(['success' => true]);
        break;

    default:
        jsonError('Method not allowed', 405);
}

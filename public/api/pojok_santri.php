<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

$statusFilter = $_GET['status'] ?? 'published';

$allowedStatus = ['draft', 'published'];

function rateLimit($max = 100, $window = 60, $minDelay = 5)
{
    $ip = $_SERVER['REMOTE_ADDR'];
    $key = sys_get_temp_dir() . '/rl_' . md5($ip);

    // Ambil data lama atau buat baru
    $data = file_exists($key)
        ? json_decode(file_get_contents($key), true)
        : ['count' => 0, 'start' => time(), 'last_request' => 0];

    $currentTime = time();

    // 1. CEK MINIMAL DELAY (3 Detik)
    if (isset($data['last_request']) && ($currentTime - $data['last_request']) < $minDelay) {
        http_response_code(429);
        exit(json_encode([
            'error' => 'Please wait ' . $minDelay . ' seconds between requests.'
        ]));
    }

    // 2. CEK JENDELA WAKTU (Reset jika window lewat)
    if ($currentTime - $data['start'] > $window) {
        $data['count'] = 0;
        $data['start'] = $currentTime;
    }

    $data['count']++;
    $data['last_request'] = $currentTime; // Update waktu request terakhir

    // 3. CEK MAKSIMAL REQUEST
    if ($data['count'] > $max) {
        http_response_code(429);
        exit(json_encode(['error' => 'Terlalu banyak permintaan dalam waktu singkat.']));
    }

    file_put_contents($key, json_encode($data));
}

function sanitizeContent($html)
{
    return trim($html); // Frontend sudah sanitize, ini minimal fallback
}

function sanitizeUrl($url)
{
    return filter_var($url, FILTER_VALIDATE_URL) ? $url : '';
}

switch ($method) {

    case 'GET':

        // Jika minta draft/all → wajib admin
        if ($statusFilter !== 'published') {
            requireAdmin();
        }

        if ($id) {
            $stmt = $pdo->prepare(
                'SELECT * FROM pojok_santri WHERE id = ?'
            );
            $stmt->execute([$id]);
            $row = $stmt->fetch();

            if ($row) {
                $row['authorRole'] = $row['author_role'];
                unset($row['author_role']);
            }

            jsonResponse($row ?: null);
        }

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(50, max(1, (int)($_GET['limit'] ?? 10))); // max 50
        $offset = ($page - 1) * $limit;

        if ($statusFilter === 'published') {
            $stmt = $pdo->prepare(
                'SELECT * FROM pojok_santri 
                 WHERE status = "published"
                 ORDER BY date DESC, id DESC 
                 LIMIT ? OFFSET ?'
            );
            $stmt->bindValue(1, $limit, PDO::PARAM_INT);
            $stmt->bindValue(2, $offset, PDO::PARAM_INT);
            $stmt->execute();

            $countStmt = $pdo->query(
                'SELECT COUNT(*) as total FROM pojok_santri WHERE status = "published"'
            );
        } else {
            if (!in_array($statusFilter, $allowedStatus) && $statusFilter !== 'all') {
                jsonError('Invalid status filter', 400);
            }

            if ($statusFilter === 'all') {
                $stmt = $pdo->prepare(
                    'SELECT * FROM pojok_santri
                     ORDER BY date DESC, id DESC
                     LIMIT ? OFFSET ?'
                );
                $countStmt = $pdo->query(
                    'SELECT COUNT(*) as total FROM pojok_santri'
                );
            } else {
                $stmt = $pdo->prepare(
                    'SELECT * FROM pojok_santri 
                     WHERE status = ?
                     ORDER BY date DESC, id DESC
                     LIMIT ? OFFSET ?'
                );
                $stmt->bindValue(1, $statusFilter);
                $stmt->bindValue(2, $limit, PDO::PARAM_INT);
                $stmt->bindValue(3, $offset, PDO::PARAM_INT);
                $stmt->execute();

                $countStmt = $pdo->prepare(
                    'SELECT COUNT(*) as total FROM pojok_santri WHERE status = ?'
                );
                $countStmt->execute([$statusFilter]);
            }
        }

        if (!isset($rows)) {
            $rows = $stmt->fetchAll();
        }

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
        break;

    case 'POST':
        requireAdmin();

        $input = getJsonInput();

        $status = in_array($input['status'] ?? 'draft', $allowedStatus)
            ? $input['status']
            : 'draft';

        $stmt = $pdo->prepare(
            'INSERT INTO pojok_santri
             (title, content, author, author_role, date, image, category, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );

        $stmt->execute([
            trim($input['title'] ?? ''),
            sanitizeContent($input['content'] ?? ''),
            trim($input['author'] ?? ''),
            trim($input['authorRole'] ?? ''),
            $input['date'] ?? date('Y-m-d'),
            sanitizeUrl($input['image'] ?? ''),
            trim($input['category'] ?? 'Kegiatan'),
            $status
        ]);

        jsonResponse(['success' => true]);
        break;

    case 'PUT':
        requireAdmin();

        if (!$id) jsonError('ID is required', 400);

        $input = getJsonInput();

        $status = in_array($input['status'] ?? 'published', $allowedStatus)
            ? $input['status']
            : 'draft';

        $stmt = $pdo->prepare(
            'UPDATE pojok_santri SET
             title = ?, content = ?, author = ?, author_role = ?,
             date = ?, image = ?, category = ?, status = ?
             WHERE id = ?'
        );

        $stmt->execute([
            trim($input['title'] ?? ''),
            sanitizeContent($input['content'] ?? ''),
            trim($input['author'] ?? ''),
            trim($input['authorRole'] ?? ''),
            $input['date'] ?? date('Y-m-d'),
            sanitizeUrl($input['image'] ?? ''),
            trim($input['category'] ?? 'Kegiatan'),
            $status,
            $id
        ]);

        jsonResponse(['success' => true]);
        break;

    case 'DELETE':
        requireAdmin();

        if (!$id) jsonError('ID is required', 400);

        $stmt = $pdo->prepare(
            'DELETE FROM pojok_santri WHERE id = ?'
        );
        $stmt->execute([$id]);

        jsonResponse(['success' => true]);
        break;

    default:
        jsonError('Method not allowed', 405);
}

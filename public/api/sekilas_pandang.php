<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

function rateLimit($max = 100, $window = 60)
{
    $ip = $_SERVER['REMOTE_ADDR'];
    $key = sys_get_temp_dir() . '/rl_' . md5($ip);

    $data = file_exists($key) ? json_decode(file_get_contents($key), true) : ['count' => 0, 'start' => time()];

    if (time() - $data['start'] > $window) {
        $data = ['count' => 0, 'start' => time()];
    }

    $data['count']++;

    if ($data['count'] > $max) {
        http_response_code(429);
        exit(json_encode(['error' => 'Too many requests']));
    }

    file_put_contents($key, json_encode($data));
}

function sanitizeUrl($url)
{
    return filter_var($url, FILTER_VALIDATE_URL) ? $url : '';
}

function sanitizeArray($value)
{
    return is_array($value) ? $value : [];
}

function sanitizeContent($html)
{
    return trim($html); // Frontend sudah sanitize, ini fallback minimal
}

function mapSekilasPandang($row)
{
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
        jsonResponse(mapSekilasPandang($stmt->fetch()));
        break;

    case 'PUT':
        requireAdmin(); // 🔥 WAJIB AUTH

        $input = getJsonInput();

        $stmt = $pdo->prepare(
            'UPDATE sekilas_pandang SET
             title = ?, content = ?, image = ?, stats = ?
             WHERE id = 1'
        );

        $stmt->execute([
            trim($input['title'] ?? ''),
            sanitizeContent($input['content'] ?? ''),
            sanitizeUrl($input['image'] ?? ''),
            json_encode(sanitizeArray($input['stats'] ?? []))
        ]);

        $stmt = $pdo->query('SELECT * FROM sekilas_pandang WHERE id = 1');
        jsonResponse(mapSekilasPandang($stmt->fetch()));
        break;

    default:
        jsonError('Method not allowed', 405);
}

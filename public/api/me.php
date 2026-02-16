<?php
require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/helpers.php';

header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

$user = requireAuth();

jsonResponse([
    'user' => [
        'id' => $user['id'],
        'name' => $user['name'],
        'username' => $user['username'],
        'role' => $user['role'],
        'level' => $user['level']
    ]
]);
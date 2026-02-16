<?php
require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/helpers.php';

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
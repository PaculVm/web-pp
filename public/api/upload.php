<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

$user = requireAuth();

// Hanya admin & superadmin boleh upload
if (!in_array($user['role'], ['admin', 'superadmin'])) {
    jsonError('Forbidden', 403);
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    jsonError('File tidak valid', 400);
}

$file = $_FILES['file'];

// MIME whitelist (SVG dihapus)
$allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
];

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    jsonError('Tipe file tidak diizinkan', 400);
}

$maxSize = 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    jsonError('Ukuran file maksimal 5MB', 400);
}

// Mapping extension dari MIME saja
$extMap = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/gif' => 'gif',
    'image/webp' => 'webp',
    'application/pdf' => 'pdf'
];

$ext = $extMap[$mimeType];

$uploadDir = dirname(__DIR__) . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$filename = bin2hex(random_bytes(16)) . '.' . $ext;
$destination = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    jsonError('Gagal menyimpan file', 500);
}

jsonResponse([
    'success' => true,
    'url' => '/uploads/' . $filename,
]);

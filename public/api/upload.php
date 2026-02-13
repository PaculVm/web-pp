<?php
require_once 'helpers.php';
require_once 'jwt.php';

// Hanya method POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

// Pastikan user login
$user = requireAuth();

// Cek apakah ada file (image atau file)
$field = null;
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
  $field = 'image';
} elseif (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
  $field = 'file';
}

if ($field === null) {
    $errors = [
        UPLOAD_ERR_INI_SIZE   => 'File terlalu besar (melebihi batas server)',
        UPLOAD_ERR_FORM_SIZE  => 'File terlalu besar',
        UPLOAD_ERR_PARTIAL    => 'File hanya terupload sebagian',
        UPLOAD_ERR_NO_FILE    => 'Tidak ada file yang dipilih',
        UPLOAD_ERR_NO_TMP_DIR => 'Folder temporary tidak ditemukan',
        UPLOAD_ERR_CANT_WRITE => 'Gagal menulis file',
    ];
    $errCode = $_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE;
    $msg = $errors[$errCode] ?? 'Upload gagal';
    jsonError($msg, 400);
}

$file = $_FILES[$field];

// Validasi tipe file (tambahkan PDF untuk brosur)
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    jsonError('Tipe file tidak diizinkan. Gunakan JPG, PNG, GIF, WebP, SVG, atau PDF.', 400);
}

// Validasi ukuran (max 5MB)
$maxSize = 5 * 1024 * 1024; // 5MB
if ($file['size'] > $maxSize) {
    jsonError('Ukuran file maksimal 5MB', 400);
}

// Buat folder uploads jika belum ada
$uploadDir = dirname(__DIR__) . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate nama file unik
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
if (!$ext) {
    $extMap = [
        'image/jpeg' => 'jpg',
        'image/jpg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
        'image/svg+xml' => 'svg',
    ];
    $ext = $extMap[$mimeType] ?? 'jpg';
}
$filename = date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . strtolower($ext);

$destination = $uploadDir . $filename;

// Pindahkan file
if (!move_uploaded_file($file['tmp_name'], $destination)) {
    jsonError('Gagal menyimpan file', 500);
}

// Return URL
$imageUrl = '/uploads/' . $filename;

jsonResponse([
    'success' => true,
    'url' => $imageUrl,
    'filename' => $filename,
    'size' => $file['size'],
    'type' => $mimeType
]);

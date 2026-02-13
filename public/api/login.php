<?php
require_once 'db.php';
require_once 'helpers.php';
require_once 'jwt.php';

// Rate limiting sederhana menggunakan session
session_start();
$ip = $_SERVER['REMOTE_ADDR'];
$rateKey = "login_attempts_$ip";
$maxAttempts = 10;
$windowSeconds = 600; // 10 menit

if (!isset($_SESSION[$rateKey])) {
    $_SESSION[$rateKey] = ['count' => 0, 'start' => time()];
}

$rateData = $_SESSION[$rateKey];

// Reset jika window sudah lewat
if (time() - $rateData['start'] > $windowSeconds) {
    $_SESSION[$rateKey] = ['count' => 0, 'start' => time()];
    $rateData = $_SESSION[$rateKey];
}

// Cek rate limit
if ($rateData['count'] >= $maxAttempts) {
    jsonError('Terlalu banyak percobaan login, silakan coba lagi beberapa menit lagi.', 429);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

$input = getJsonInput();
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if (!$username || !$password) {
    jsonError('Username dan password wajib diisi', 400);
}

// Increment attempt
$_SESSION[$rateKey]['count']++;

// Cari user
$stmt = $pdo->prepare('SELECT * FROM users WHERE username = ?');
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user) {
    jsonError('Username atau password salah', 401);
}

// Verifikasi password
if (!password_verify($password, $user['password'])) {
    jsonError('Username atau password salah', 401);
}

// Reset rate limit setelah login sukses
$_SESSION[$rateKey] = ['count' => 0, 'start' => time()];

// Buat token
$payload = [
    'id' => $user['id'],
    'name' => $user['name'],
    'username' => $user['username'],
    'role' => $user['role']
];

$token = createJWT($payload);

jsonResponse([
    'user' => $payload,
    'token' => $token
]);

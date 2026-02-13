<?php
// JWT Secret Key - Ganti dengan kunci rahasia Anda
define('JWT_SECRET', 'kunci_rahasia');

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

function createJWT($payload, $expiry = 600) { // default 10 menit
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    
    $payload['iat'] = time();
    $payload['exp'] = time() + $expiry;
    
    $headerEncoded = base64UrlEncode(json_encode($header));
    $payloadEncoded = base64UrlEncode(json_encode($payload));
    
    $signature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", JWT_SECRET, true);
    $signatureEncoded = base64UrlEncode($signature);
    
    return "$headerEncoded.$payloadEncoded.$signatureEncoded";
}

function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    
    [$headerEncoded, $payloadEncoded, $signatureEncoded] = $parts;
    
    $signature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", JWT_SECRET, true);
    $expectedSignature = base64UrlEncode($signature);
    
    if (!hash_equals($expectedSignature, $signatureEncoded)) return false;
    
    $payload = json_decode(base64UrlDecode($payloadEncoded), true);
    
    if (!$payload || !isset($payload['exp'])) return false;
    if ($payload['exp'] < time()) return false;
    
    return $payload;
}

function getAuthUser() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return null;
    }
    
    return verifyJWT($matches[1]);
}

function requireAuth() {
    $user = getAuthUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    return $user;
}

function requireAdmin() {
    $user = requireAuth();
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: Admin only']);
        exit;
    }
    return $user;
}

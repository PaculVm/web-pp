<?php
require_once __DIR__ . '/env.php';

$jwtSecret = getenv('JWT_SECRET');

if (!$jwtSecret) {
    http_response_code(500);
    exit('JWT secret not configured.');
}

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

function createJWT($payload, $expiry = 3600) {
    global $jwtSecret;

    $header = ['alg' => 'HS256', 'typ' => 'JWT'];

    $payload['iat'] = time();
    $payload['exp'] = time() + $expiry;
    $payload['iss'] = 'ppds-api';
    $payload['aud'] = 'ppds-client';

    $headerEncoded = base64UrlEncode(json_encode($header));
    $payloadEncoded = base64UrlEncode(json_encode($payload));

    $signature = hash_hmac(
        'sha256',
        "$headerEncoded.$payloadEncoded",
        $jwtSecret,
        true
    );

    $signatureEncoded = base64UrlEncode($signature);

    return "$headerEncoded.$payloadEncoded.$signatureEncoded";
}

function verifyJWT($token) {
    global $jwtSecret;

    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;

    [$headerEncoded, $payloadEncoded, $signatureEncoded] = $parts;

    $expectedSignature = base64UrlEncode(
        hash_hmac(
            'sha256',
            "$headerEncoded.$payloadEncoded",
            $jwtSecret,
            true
        )
    );

    if (!hash_equals($expectedSignature, $signatureEncoded)) return false;

    $payload = json_decode(base64UrlDecode($payloadEncoded), true);

    if (!$payload) return false;
    if (!isset($payload['exp']) || $payload['exp'] < time()) return false;
    if (($payload['iss'] ?? '') !== 'ppds-api') return false;
    if (($payload['aud'] ?? '') !== 'ppds-client') return false;

    return $payload;
}

function getAuthUser() {
    if (!empty($_COOKIE['ppds_token'])) {
        return verifyJWT($_COOKIE['ppds_token']);
    }
    return null;
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
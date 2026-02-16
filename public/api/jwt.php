<?php
require_once __DIR__ . '/env.php';
require_once __DIR__ . '/helpers.php';

$jwtSecret = getenv('JWT_SECRET');

if (!$jwtSecret) {
    http_response_code(500);
    exit('JWT secret not configured.');
}

function base64UrlEncode($data)
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data)
{
    return base64_decode(strtr($data, '-_', '+/'), true);
}

function isHttpsRequest()
{
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        return true;
    }

    if (($_SERVER['SERVER_PORT'] ?? null) === '443') {
        return true;
    }

    return false;
}

function buildCookieOptions($expires)
{
    return [
        'expires' => $expires,
        'path' => '/',
        'secure' => isHttpsRequest(),
        'httponly' => true,
        'samesite' => 'Strict'
    ];
}

function createJWT($payload, $expiry = 3600)
{
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

function verifyJWT($token)
{
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

    $payloadJson = base64UrlDecode($payloadEncoded);
    if ($payloadJson === false) return false;

    $payload = json_decode($payloadJson, true);

    if (!is_array($payload)) return false;
    if (!isset($payload['exp']) || $payload['exp'] < time()) return false;
    if (($payload['iss'] ?? '') !== 'ppds-api') return false;
    if (($payload['aud'] ?? '') !== 'ppds-client') return false;

    return $payload;
}

function setAuthCookies($token)
{
    $authOptions = buildCookieOptions(time() + 3600);

    setcookie('ppds_token', $token, $authOptions);

    $csrfToken = bin2hex(random_bytes(32));
    setcookie(
        'ppds_csrf',
        $csrfToken,
        [
            'expires' => $authOptions['expires'],
            'path' => '/',
            'secure' => $authOptions['secure'],
            'httponly' => false,
            'samesite' => 'Strict'
        ]
    );
}

function clearAuthCookies()
{
    $expired = time() - 3600;
    $options = buildCookieOptions($expired);

    setcookie('ppds_token', '', $options);
    setcookie(
        'ppds_csrf',
        '',
        [
            'expires' => $expired,
            'path' => '/',
            'secure' => $options['secure'],
            'httponly' => false,
            'samesite' => 'Strict'
        ]
    );
}

function requireCsrfToken()
{
    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

    if (in_array($method, ['GET', 'HEAD', 'OPTIONS'], true)) {
        return;
    }

    $cookieToken = $_COOKIE['ppds_csrf'] ?? '';
    $headerToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';

    if (
        !$cookieToken ||
        !$headerToken ||
        !hash_equals($cookieToken, $headerToken)
    ) {
        jsonError('Invalid CSRF token', 419);
    }
}

function getAuthUser()
{
    if (!empty($_COOKIE['ppds_token'])) {
        return verifyJWT($_COOKIE['ppds_token']);
    }
    return null;
}

function requireAuth($enforceCsrf = true)
{
    $user = getAuthUser();
    if (!$user) {
        jsonError('Unauthorized', 401);
    }

    if ($enforceCsrf) {
        requireCsrfToken();
    }

    return $user;
}

function requireRoleLevel($minimumLevel)
{
    $user = requireAuth();
    $userLevel = (int)($user['level'] ?? 0);

    if ($userLevel < (int)$minimumLevel) {
        jsonError('Forbidden', 403);
    }

    return $user;
}

function requireAdmin()
{
    return requireRoleLevel(5);
}

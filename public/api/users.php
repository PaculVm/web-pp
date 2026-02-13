<?php
require_once 'db.php';
require_once 'helpers.php';
require_once 'jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

// Semua endpoint users memerlukan admin
$user = requireAdmin();

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare('SELECT id, name, username, role FROM users WHERE id = ?');
            $stmt->execute([$id]);
            jsonResponse($stmt->fetch() ?: null);
        } else {
            $stmt = $pdo->query('SELECT id, name, username, role FROM users ORDER BY id ASC');
            jsonResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        $input = getJsonInput();
        $name = trim($input['name'] ?? '');
        $username = trim($input['username'] ?? '');
        $password = $input['password'] ?? '';
        $role = $input['role'] ?? 'editor';
        
        if (!$name || !$username || !$password) {
            jsonError('Nama, username, dan password wajib diisi', 400);
        }
        
        // Cek username sudah ada
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            jsonError('Username sudah digunakan', 409);
        }
        
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        $stmt = $pdo->prepare('INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)');
        $stmt->execute([$name, $username, $hashedPassword, $role]);
        
        $newId = $pdo->lastInsertId();
        $stmt = $pdo->prepare('SELECT id, name, username, role FROM users WHERE id = ?');
        $stmt->execute([$newId]);
        jsonResponse($stmt->fetch());
        break;

    case 'PUT':
        if (!$id) jsonError('ID is required', 400);
        
        $input = getJsonInput();
        $name = trim($input['name'] ?? '');
        $username = trim($input['username'] ?? '');
        $password = $input['password'] ?? '';
        $role = $input['role'] ?? 'editor';
        
        if (!$name || !$username) {
            jsonError('Nama dan username wajib diisi', 400);
        }
        
        // Cek username sudah dipakai user lain
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? AND id != ?');
        $stmt->execute([$username, $id]);
        if ($stmt->fetch()) {
            jsonError('Username sudah digunakan', 409);
        }
        
        if ($password) {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare('UPDATE users SET name = ?, username = ?, password = ?, role = ? WHERE id = ?');
            $stmt->execute([$name, $username, $hashedPassword, $role, $id]);
        } else {
            $stmt = $pdo->prepare('UPDATE users SET name = ?, username = ?, role = ? WHERE id = ?');
            $stmt->execute([$name, $username, $role, $id]);
        }
        
        $stmt = $pdo->prepare('SELECT id, name, username, role FROM users WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse($stmt->fetch());
        break;

    case 'DELETE':
        if (!$id) jsonError('ID is required', 400);
        
        // Jangan hapus diri sendiri
        if ($user['id'] == $id) {
            jsonError('Tidak dapat menghapus akun sendiri', 400);
        }
        
        $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse(['success' => true]);
        break;

    default:
        jsonError('Method not allowed', 405);
}

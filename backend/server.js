import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());

// ===== RATE LIMITING =====
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 menit
  max: 10, // max 10 percobaan dalam 10 menit per IP
  message: { message: 'Terlalu banyak percobaan login, silakan coba lagi beberapa menit lagi.' },
});

// ===== AUTH MIDDLEWARE =====
const JWT_SECRET = process.env.JWT_SECRET || 'ppds-secret-dev';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin only' });
  }
  next();
}

const safeJson = (value, fallback) => {
  try {
    if (value === null || value === undefined) return fallback;
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (error) {
    return fallback;
  }
};

const mapSekilasPandang = (row) => ({
  id: row.id,
  title: row.title,
  content: row.content,
  image: row.image,
  stats: safeJson(row.stats, []),
});

const mapVisiMisi = (row) => ({
  id: row.id,
  visi: row.visi,
  misi: safeJson(row.misi, []),
});

const mapPendidikan = (row) => ({
  id: row.id,
  formal: safeJson(row.formal, []),
  nonFormal: safeJson(row.non_formal, []),
  extracurriculars: safeJson(row.extracurriculars, []),
  schedule: safeJson(row.schedule, []),
});

const mapPendaftaran = (row) => ({
  id: row.id,
  isOpen: Boolean(row.is_open),
  description: row.description,
  descriptionExtra: row.description_extra,
  requirements: safeJson(row.requirements, []),
  waves: safeJson(row.waves, []),
  registrationUrl: row.registration_url,
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ===== HERO SLIDES =====
app.get('/api/hero', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM hero_slides ORDER BY sort_order ASC, id ASC');
  res.json(rows);
});

app.post('/api/hero', async (req, res) => {
  const { title, subtitle, description, image_url, button_text, button_link, sort_order } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });
  const [result] = await pool.query(
    'INSERT INTO hero_slides (title, subtitle, description, image_url, button_text, button_link, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, subtitle || null, description || null, image_url || null, button_text || null, button_link || null, sort_order || 0]
  );
  const [rows] = await pool.query('SELECT * FROM hero_slides WHERE id = ?', [result.insertId]);
  res.json(rows[0]);
});

app.put('/api/hero/:id', async (req, res) => {
  const { id } = req.params;
  const { title, subtitle, description, image_url, button_text, button_link, sort_order } = req.body;
  await pool.query(
    'UPDATE hero_slides SET title = ?, subtitle = ?, description = ?, image_url = ?, button_text = ?, button_link = ?, sort_order = ? WHERE id = ?',
    [title, subtitle, description, image_url, button_text, button_link, sort_order || 0, id]
  );
  const [rows] = await pool.query('SELECT * FROM hero_slides WHERE id = ?', [id]);
  res.json(rows[0]);
});

app.delete('/api/hero/:id', async (req, res) => {
  await pool.query('DELETE FROM hero_slides WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ===== SEKILAS PANDANG =====
app.get('/api/sekilas-pandang', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM sekilas_pandang WHERE id = 1');
  if (!rows.length) return res.json(null);
  res.json(mapSekilasPandang(rows[0]));
});

app.put('/api/sekilas-pandang', async (req, res) => {
  const { title, content, image, stats } = req.body;
  await pool.query(
    'UPDATE sekilas_pandang SET title = ?, content = ?, image = ?, stats = ? WHERE id = 1',
    [title, content, image, JSON.stringify(stats || [])]
  );
  const [rows] = await pool.query('SELECT * FROM sekilas_pandang WHERE id = 1');
  res.json(mapSekilasPandang(rows[0]));
});

// ===== VISI MISI =====
app.get('/api/visi-misi', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM visi_misi WHERE id = 1');
  if (!rows.length) return res.json(null);
  res.json(mapVisiMisi(rows[0]));
});

app.put('/api/visi-misi', async (req, res) => {
  const { visi, misi } = req.body;
  await pool.query('UPDATE visi_misi SET visi = ?, misi = ? WHERE id = 1', [visi, JSON.stringify(misi || [])]);
  const [rows] = await pool.query('SELECT * FROM visi_misi WHERE id = 1');
  res.json(mapVisiMisi(rows[0]));
});

// ===== PENGASUH =====
app.get('/api/pengasuh', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM pengasuh ORDER BY id DESC');
  res.json(rows);
});

app.post('/api/pengasuh', async (req, res) => {
  const { name, role, image, bio } = req.body;
  const [result] = await pool.query(
    'INSERT INTO pengasuh (name, role, image, bio) VALUES (?, ?, ?, ?)',
    [name, role, image, bio]
  );
  const [rows] = await pool.query('SELECT * FROM pengasuh WHERE id = ?', [result.insertId]);
  res.json(rows[0]);
});

app.put('/api/pengasuh/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role, image, bio } = req.body;
  await pool.query('UPDATE pengasuh SET name = ?, role = ?, image = ?, bio = ? WHERE id = ?', [name, role, image, bio, id]);
  const [rows] = await pool.query('SELECT * FROM pengasuh WHERE id = ?', [id]);
  res.json(rows[0]);
});

app.delete('/api/pengasuh/:id', async (req, res) => {
  await pool.query('DELETE FROM pengasuh WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ===== PENDIDIKAN =====
app.get('/api/pendidikan', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM pendidikan WHERE id = 1');
  if (!rows.length) return res.json(null);
  res.json(mapPendidikan(rows[0]));
});

app.put('/api/pendidikan', async (req, res) => {
  const { formal, nonFormal, extracurriculars, schedule } = req.body;
  await pool.query(
    'UPDATE pendidikan SET formal = ?, non_formal = ?, extracurriculars = ?, schedule = ? WHERE id = 1',
    [JSON.stringify(formal || []), JSON.stringify(nonFormal || []), JSON.stringify(extracurriculars || []), JSON.stringify(schedule || [])]
  );
  const [rows] = await pool.query('SELECT * FROM pendidikan WHERE id = 1');
  res.json(mapPendidikan(rows[0]));
});

// ===== POJOK SANTRI =====
app.get('/api/pojok-santri', async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 9999);
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    'SELECT * FROM pojok_santri ORDER BY date DESC, id DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
  const [[count]] = await pool.query('SELECT COUNT(*) as total FROM pojok_santri');
  res.json({ data: rows, total: count.total, page, limit });
});

app.get('/api/pojok-santri/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM pojok_santri WHERE id = ?', [req.params.id]);
  res.json(rows[0] || null);
});

app.post('/api/pojok-santri', async (req, res) => {
  const { title, content, author, authorRole, date, image, category } = req.body;
  const [result] = await pool.query(
    'INSERT INTO pojok_santri (title, content, author, author_role, date, image, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, content, author, authorRole, date, image, category]
  );
  const [rows] = await pool.query('SELECT * FROM pojok_santri WHERE id = ?', [result.insertId]);
  res.json(rows[0]);
});

app.put('/api/pojok-santri/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, author, authorRole, date, image, category } = req.body;
  await pool.query(
    'UPDATE pojok_santri SET title = ?, content = ?, author = ?, author_role = ?, date = ?, image = ?, category = ? WHERE id = ?',
    [title, content, author, authorRole, date, image, category, id]
  );
  const [rows] = await pool.query('SELECT * FROM pojok_santri WHERE id = ?', [id]);
  res.json(rows[0]);
});

app.delete('/api/pojok-santri/:id', async (req, res) => {
  await pool.query('DELETE FROM pojok_santri WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ===== PENGUMUMAN =====
app.get('/api/pengumuman', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM pengumuman ORDER BY date DESC, id DESC');
  res.json(rows);
});

app.get('/api/pengumuman/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM pengumuman WHERE id = ?', [req.params.id]);
  res.json(rows[0] || null);
});

app.post('/api/pengumuman', async (req, res) => {
  const { title, content, date, important } = req.body;
  const [result] = await pool.query(
    'INSERT INTO pengumuman (title, content, date, important) VALUES (?, ?, ?, ?)',
    [title, content, date, important ? 1 : 0]
  );
  const [rows] = await pool.query('SELECT * FROM pengumuman WHERE id = ?', [result.insertId]);
  res.json(rows[0]);
});

app.put('/api/pengumuman/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, date, important } = req.body;
  await pool.query(
    'UPDATE pengumuman SET title = ?, content = ?, date = ?, important = ? WHERE id = ?',
    [title, content, date, important ? 1 : 0, id]
  );
  const [rows] = await pool.query('SELECT * FROM pengumuman WHERE id = ?', [id]);
  res.json(rows[0]);
});

app.delete('/api/pengumuman/:id', async (req, res) => {
  await pool.query('DELETE FROM pengumuman WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ===== PENDAFTARAN =====
app.get('/api/pendaftaran', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM pendaftaran WHERE id = 1');
  if (!rows.length) return res.json(null);
  res.json(mapPendaftaran(rows[0]));
});

app.put('/api/pendaftaran', async (req, res) => {
  const { isOpen, description, descriptionExtra, requirements, waves, registrationUrl } = req.body;
  await pool.query(
    'UPDATE pendaftaran SET is_open = ?, description = ?, description_extra = ?, requirements = ?, waves = ?, registration_url = ? WHERE id = 1',
    [isOpen ? 1 : 0, description, descriptionExtra, JSON.stringify(requirements || []), JSON.stringify(waves || []), registrationUrl]
  );
  const [rows] = await pool.query('SELECT * FROM pendaftaran WHERE id = 1');
  res.json(mapPendaftaran(rows[0]));
});

// ===== USERS =====
app.get('/api/users', authMiddleware, adminOnly, async (req, res) => {
  const [rows] = await pool.query('SELECT id, name, username, role FROM users ORDER BY id ASC');
  res.json(rows);
});

app.post('/api/users', authMiddleware, adminOnly, async (req, res) => {
  const { name, username, password, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)',
      [name, username, hashed, role]
    );
    const [rows] = await pool.query('SELECT id, name, username, role FROM users WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (error) {
    res.status(409).json({ message: 'Username already exists' });
  }
});

app.put('/api/users/:id', authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { name, username, password, role } = req.body;
  try {
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET name = ?, username = ?, password = ?, role = ? WHERE id = ?', [name, username, hashed, role, id]);
    } else {
      await pool.query('UPDATE users SET name = ?, username = ?, role = ? WHERE id = ?', [name, username, role, id]);
    }
    const [rows] = await pool.query('SELECT id, name, username, role FROM users WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(409).json({ message: 'Username already exists' });
  }
});

app.delete('/api/users/:id', authMiddleware, adminOnly, async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ===== AUTH =====
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  if (!rows.length) return res.status(401).json({ message: 'Username atau password salah' });

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Username atau password salah' });

  const payload = { id: user.id, name: user.name, username: user.username, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

  res.json({ user: payload, token });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

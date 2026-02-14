// Base URL - akan otomatis menyesuaikan environment
const API_BASE = '';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const entry = document.cookie.split('; ').find((item) => item.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.split('=')[1]) : null;
}

async function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('ppds_token') : null;
  const csrfToken = typeof window !== 'undefined'
    ? (localStorage.getItem('ppds_csrf') || getCookie('ppds_csrf'))
    : null;

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!SAFE_METHODS.has(method) && csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Request failed');
  }

  return res.json();
}

// ===== PUBLIC =====
export async function getHero() {
  return apiFetch('/api/hero.php');
}

export async function getArticles(page = 1, limit = 6, status = 'published') {
  return apiFetch(`/api/pojok_santri.php?page=${page}&limit=${limit}&status=${status}`);
}

export async function getArticleById(id) {
  const data = await apiFetch(`/api/pojok_santri.php?id=${id}`);
  return { data };
}

export async function getPengumuman() {
  return apiFetch('/api/pengumuman.php');
}

export async function getPengumumanById(id) {
  return apiFetch(`/api/pengumuman.php?id=${id}`);
}

export async function getSekilasPandang() {
  return apiFetch('/api/sekilas_pandang.php');
}

export async function getVisiMisi() {
  return apiFetch('/api/visi_misi.php');
}

export async function getPengasuh() {
  return apiFetch('/api/pengasuh.php');
}

export async function getPendidikan() {
  return apiFetch('/api/pendidikan.php');
}

export async function getPendaftaran() {
  return apiFetch('/api/pendaftaran.php');
}

// ===== ADMIN CRUD =====
export async function createHeroSlide(payload) {
  return apiFetch('/api/hero.php', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateHeroSlideApi(id, payload) {
  return apiFetch(`/api/hero.php?id=${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteHeroSlideApi(id) {
  return apiFetch(`/api/hero.php?id=${id}`, { method: 'DELETE' });
}

export async function updateSekilasPandangApi(payload) {
  return apiFetch('/api/sekilas_pandang.php', { method: 'PUT', body: JSON.stringify(payload) });
}

export async function updateVisiMisiApi(payload) {
  return apiFetch('/api/visi_misi.php', { method: 'PUT', body: JSON.stringify(payload) });
}

export async function createPengasuh(payload) {
  return apiFetch('/api/pengasuh.php', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updatePengasuhApi(id, payload) {
  return apiFetch(`/api/pengasuh.php?id=${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deletePengasuhApi(id) {
  return apiFetch(`/api/pengasuh.php?id=${id}`, { method: 'DELETE' });
}

export async function updatePendidikanApi(payload) {
  return apiFetch('/api/pendidikan.php', { method: 'PUT', body: JSON.stringify(payload) });
}

export async function createPojokSantri(payload) {
  return apiFetch('/api/pojok_santri.php', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updatePojokSantriApi(id, payload) {
  return apiFetch(`/api/pojok_santri.php?id=${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deletePojokSantriApi(id) {
  return apiFetch(`/api/pojok_santri.php?id=${id}`, { method: 'DELETE' });
}

export async function createPengumuman(payload) {
  return apiFetch('/api/pengumuman.php', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updatePengumumanApi(id, payload) {
  return apiFetch(`/api/pengumuman.php?id=${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deletePengumumanApi(id) {
  return apiFetch(`/api/pengumuman.php?id=${id}`, { method: 'DELETE' });
}

export async function updatePendaftaranApi(payload) {
  return apiFetch('/api/pendaftaran.php', { method: 'PUT', body: JSON.stringify(payload) });
}

// ===== USERS =====
export async function loginApi(payload) {
  return apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });
}

export async function logoutApi() {
  return apiFetch('/api/auth/logout', { method: 'POST' });
}

export async function getUsers() {
  return apiFetch('/api/users.php');
}

export async function createUser(payload) {
  return apiFetch('/api/users.php', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateUserApi(id, payload) {
  return apiFetch(`/api/users.php?id=${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteUserApi(id) {
  return apiFetch(`/api/users.php?id=${id}`, { method: 'DELETE' });
}

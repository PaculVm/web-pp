import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { loginApi, getUsers, createUser, updateUserApi, deleteUserApi } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Inisialisasi sinkron dari localStorage agar tidak null di render pertama (mencegah redirect ke login saat reload)
  const [user, setUser] = useState(() => {
    try {
      if (typeof window === 'undefined') return null;
      const storedUser = localStorage.getItem('ppds_user');
      if (storedUser) return JSON.parse(storedUser);
      // Rebuild dari token jika user tidak ada
      const token = localStorage.getItem('ppds_token');
      if (token) {
        const parts = token.split('.');
        if (parts.length === 3) {
          const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const pad = b64.length % 4;
          const b64p = pad ? b64 + '='.repeat(4 - pad) : b64;
          const payload = JSON.parse(atob(b64p));
          if (payload && payload.id && payload.role) {
            const rebuilt = { id: payload.id, name: payload.name, username: payload.username, role: payload.role };
            localStorage.setItem('ppds_user', JSON.stringify(rebuilt));
            return rebuilt;
          }
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  });
  const [users, setUsers] = useState([]);

  // Refs untuk timeout/interval session
  const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 menit
  const inactivityRef = useRef(null);
  const tokenExpiryRef = useRef(null);

  const clearSessionTimers = () => {
    if (inactivityRef.current) {
      clearTimeout(inactivityRef.current);
      inactivityRef.current = null;
    }
    if (tokenExpiryRef.current) {
      clearTimeout(tokenExpiryRef.current);
      tokenExpiryRef.current = null;
    }
  };

  const scheduleInactivityTimeout = () => {
    if (!user) return;
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    inactivityRef.current = setTimeout(() => {
      // Auto logout karena tidak ada aktivitas
      logout();
    }, INACTIVITY_LIMIT);
  };

  const activityHandler = () => {
    // Reset timer saat ada aktivitas
    scheduleInactivityTimeout();
  };

  const attachActivityListeners = () => {
    window.addEventListener('mousemove', activityHandler);
    window.addEventListener('keydown', activityHandler);
    window.addEventListener('click', activityHandler);
    window.addEventListener('touchstart', activityHandler);
    window.addEventListener('scroll', activityHandler);
  };

  const detachActivityListeners = () => {
    window.removeEventListener('mousemove', activityHandler);
    window.removeEventListener('keydown', activityHandler);
    window.removeEventListener('click', activityHandler);
    window.removeEventListener('touchstart', activityHandler);
    window.removeEventListener('scroll', activityHandler);
  };

  const scheduleTokenExpiryTimeout = () => {
    if (!user) return;
    const token = localStorage.getItem('ppds_token');
    if (!token) return;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return;
      const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const pad = b64.length % 4;
      const b64p = pad ? b64 + '='.repeat(4 - pad) : b64;
      const payload = JSON.parse(atob(b64p));
      if (!payload?.exp) return;
      const msLeft = payload.exp * 1000 - Date.now();
      if (msLeft <= 0) {
        logout();
        return;
      }
      if (tokenExpiryRef.current) clearTimeout(tokenExpiryRef.current);
      tokenExpiryRef.current = setTimeout(() => {
        logout();
      }, msLeft);
    } catch {}
  };

  useEffect(() => {
    if (user) {
      attachActivityListeners();
      scheduleInactivityTimeout();
      scheduleTokenExpiryTimeout();
    } else {
      detachActivityListeners();
      clearSessionTimers();
    }
    return () => {
      detachActivityListeners();
      clearSessionTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const login = async (username, password) => {
    try {
      const res = await loginApi({ username, password });
      if (res?.user && res?.token) {
        setUser(res.user);
        localStorage.setItem('ppds_user', JSON.stringify(res.user));
        localStorage.setItem('ppds_token', res.token);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ppds_user');
    localStorage.removeItem('ppds_token');
  };


  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to load users', error);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  // ===== USERS CRUD =====
  const addUser = async (newUser) => {
    try {
      const created = await createUser(newUser);
      setUsers((prev) => [...prev, created]);
      return true;
    } catch (error) {
      return false;
    }
  };

  const updateUser = async (id, updatedUser) => {
    try {
      const updated = await updateUserApi(id, updatedUser);
      setUsers((prev) => prev.map((u) => (String(u.id) === String(id) ? updated : u)));
      if (user && String(user.id) === String(id)) {
        const nextUser = { ...user, ...updated };
        setUser(nextUser);
        localStorage.setItem('ppds_user', JSON.stringify(nextUser));
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const deleteUser = async (id) => {
    if (user && String(user.id) === String(id)) return false;
    await deleteUserApi(id);
    setUsers((prev) => prev.filter((u) => String(u.id) !== String(id)));
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, addUser, updateUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

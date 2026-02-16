import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { useData } from '../contexts/DataContext';
import { createPojokSantri } from '../lib/api';
import { useNotification } from '../contexts/NotificationContext';
import { stripHTML } from '../utils/text';

export function PojokSantriPage() {
  const { pojokSantri } = useData();
  const { showToast } = useNotification();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    author: '',
    authorRole: '',
  });

  // Hanya tampilkan artikel yang sudah dipublikasikan di halaman publik
  const publishedArticles = Array.isArray(pojokSantri)
    ? pojokSantri.filter((a) => (a.status || 'published') === 'published')
    : [];

  const safeImage = (url) => {
    if (!url) return '/images/placeholder.svg';
    if (url.startsWith('/uploads/')) return url;
    if (url.startsWith(window.location.origin)) return url;
    return '/images/placeholder.svg';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim() || !form.author.trim()) {
      showToast('Judul, Isi, dan Nama Penulis wajib diisi', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await createPojokSantri({
        ...form,
        image: '',
        category: 'Cerita',
        date: new Date().toISOString().split('T')[0],
        status: 'draft',
      });
      showToast('Artikel berhasil dikirim, menunggu review admin.', 'success');
      setForm({ title: '', content: '', author: '', authorRole: '' });
      setShowForm(false);
    } catch (err) {
      showToast('Gagal mengirim artikel. Silakan coba lagi.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!pojokSantri) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">Memuat konten...</div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-emerald-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold">Pojok Santri</h1>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-white text-emerald-700 text-sm font-semibold shadow-sm hover:bg-emerald-50 transition-colors w-fit"
            >
              Kirim Artikel
            </button>
          </div>
          <p className="text-emerald-300">Tulisan, cerita, dan pengalaman dari para santri</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {showForm && (
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Kirim Artikel Pojok Santri</h2>
            <p className="text-sm text-gray-500 mb-6">
              Tulisan Anda akan dikirim ke admin dan disimpan sebagai <span className="font-semibold text-emerald-600">draf</span> sebelum dipublikasikan.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Artikel *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm"
                  placeholder="Tulis judul artikel"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penulis *</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm"
                    placeholder="Nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelas/Jabatan (opsional)</label>
                  <input
                    type="text"
                    value={form.authorRole}
                    onChange={(e) => setForm({ ...form, authorRole: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm"
                    placeholder="Misal: Kelas XI MA"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Isi Artikel *</label>
                <textarea
                  rows={6}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm resize-none"
                  placeholder="Tulis cerita atau pengalaman Anda di sini..."
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Artikel'}
                </button>
              </div>
            </form>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedArticles.map((item) => (
            <Link key={item.id} to={`/pojok-santri/${item.id}`} className="group">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={safeImage(item.image)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <span className="inline-block text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-fit mb-3">
                    {item.category}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                    {item.excerpt
                      ? item.excerpt
                      : stripHTML(item.content || '').substring(0, 120) + '...'}
                  </p>
                  <div className="text-sm text-gray-400 border-t border-gray-100 pt-4">
                    <p>{item.author}</p>
                    <p>{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}

import { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Save, CheckCircle, Info, Layout, Eye } from 'lucide-react';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { RichTextEditor } from '../../components/ui/RichTextEditor';

export function AdminSekilasPandang() {
  const { sekilasPandang, updateSekilasPandang } = useData();
  const [form, setForm] = useState({
    title: sekilasPandang.title || '',
    content: sekilasPandang.content || '',
    image: sekilasPandang.image || '',
  });
  const [saved, setSaved] = useState(false);

  // Sync form when data loaded/refreshed from context
  useEffect(() => {
    setForm({
      title: sekilasPandang.title || '',
      content: sekilasPandang.content || '',
      image: sekilasPandang.image || '',
    });
  }, [sekilasPandang]);

	const handleSave = async () => {
    if (saving) return;

    if (!form.title.trim()) {
      alert('Judul tidak boleh kosong');
      return;
    }

    setSaving(true);

    try {
      await updateSekilasPandang(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header Section - Compact */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <Layout className="text-emerald-600" size={19} />
            Sekilas Pandang
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            Personalisasi narasi utama pondok pesantren
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleSave}
            disabled={saved}
            className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 ${
              saved 
                ? 'bg-emerald-100 text-emerald-600 cursor-default' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
            }`}
          >
            {saved ? (
              <><CheckCircle size={14} /> Tersimpan</>
            ) : (
              <><Save size={14} /> Simpan</>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid Layout - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Kolom Kiri: Media & Tips */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm overflow-hidden">
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3 flex items-center gap-1.5">
              <Eye size={11} /> Preview Gambar
            </h3>
            <ImageUpload
              label="Foto Utama Halaman"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
            />
          </div>

          <div className="bg-emerald-900 rounded-2xl p-4 text-emerald-50 shadow-lg shadow-emerald-900/20">
            <div className="flex items-center gap-1.5 mb-2">
              <Info size={14} className="text-emerald-400" />
              <h4 className="font-bold text-xs">Informasi Penulisan</h4>
            </div>
            <p className="text-[10px] leading-relaxed text-emerald-100/80 font-medium">
              Gunakan editor teks di samping untuk mengatur struktur kalimat. Gunakan <strong>Tebal</strong> untuk poin penting dan <strong>Bullet Points</strong> untuk daftar sejarah atau fasilitas pesantren.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Editor Konten */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Judul Profil
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Sejarah & Filosofi Kami"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 text-base"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Narasi Sekilas Pandang
                </label>
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  <RichTextEditor
                    value={form.content}
                    onChange={(val) => setForm({ ...form, content: val })}
                    placeholder="Tuliskan sejarah, visi umum, dan kehangatan pesantren..."
                  />
                </div>
              </div>
            </div>
            
            {/* Footer Form Info - Compact */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
              </span>
              <div className="flex gap-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-200" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

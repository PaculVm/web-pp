import { useParams, Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { useData } from '../contexts/DataContext';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { PublicRichTextRenderer } from '../components/ui/PublicRichTextRenderer';

export function PojokSantriDetailPage() {
  const { id } = useParams();
  const { pojokSantri } = useData();

  if (!pojokSantri) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">Memuat konten...</div>
      </PublicLayout>
    );
  }

  const article = pojokSantri.find((item) => String(item.id) === String(id));

  // Jangan tampilkan artikel jika status bukan published di halaman publik
  if (!article || (article.status && article.status !== 'published')) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Artikel tidak ditemukan</h1>
          <Link to="/pojok-santri" className="text-emerald-600 hover:text-emerald-700 font-medium">
            ← Kembali ke Pojok Santri
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-emerald-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/pojok-santri" className="inline-flex items-center gap-1 text-emerald-200 hover:text-white text-sm mb-6">
            <ArrowLeft size={16} /> Kembali ke Pojok Santri
          </Link>
          <span className="block text-xs font-medium text-emerald-300 bg-emerald-700/50 px-2.5 py-1 rounded-full w-fit mb-3">
            {article.category}
          </span>
          <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-4">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-emerald-200 text-sm">
            <span className="flex items-center gap-1"><User size={14} /> {article.author}</span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(article.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl overflow-hidden mb-8">
          <img src={article.image} alt={article.title} className="w-full h-64 md:h-96 object-cover" />
        </div>
        <PublicRichTextRenderer content={article.content} />
      </div>
    </PublicLayout>
  );
}

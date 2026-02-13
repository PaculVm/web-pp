import { PublicLayout } from "../components/PublicLayout";
import { useData } from "../contexts/DataContext";
import { PublicRichTextRenderer } from '../components/ui/PublicRichTextRenderer';

export function SekilasPandangPage() {
  const { sekilasPandang } = useData();

  if (!sekilasPandang?.title) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">
          Memuat konten...
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Page Header */}
      <div className="bg-emerald-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {sekilasPandang.title}
          </h1>
          <p className="text-emerald-200">
            Mengenal lebih dekat Pondok Pesantren Darussalam
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Konten kiri */}
          <div className="lg:col-span-3">
            <PublicRichTextRenderer content={sekilasPandang.content} />
          </div>

          {/* Sidebar kanan */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-2xl overflow-hidden">
              <img
                src={sekilasPandang.image}
                alt="Pondok Pesantren Darussalam Panusupan"
                className="w-full h-64 object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(sekilasPandang.stats || []).map((stat) => (
                <div
                  key={stat.label}
                  className="bg-emerald-50 rounded-xl p-5 text-center"
                >
                  <p className="text-2xl font-bold text-emerald-700">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

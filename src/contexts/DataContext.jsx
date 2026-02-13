import { createContext, useContext, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  getHero,
  getSekilasPandang,
  getVisiMisi,
  getPengasuh,
  getPendidikan,
  getArticles,
  getPengumuman,
  getPendaftaran,
  createHeroSlide,
  updateHeroSlideApi,
  deleteHeroSlideApi,
  updateSekilasPandangApi,
  updateVisiMisiApi,
  createPengasuh,
  updatePengasuhApi,
  deletePengasuhApi,
  updatePendidikanApi,
  createPojokSantri,
  updatePojokSantriApi,
  deletePojokSantriApi,
  createPengumuman,
  updatePengumumanApi,
  deletePengumumanApi,
  updatePendaftaranApi,
} from '../lib/api';

const DataContext = createContext(null);

const initialData = {
  heroSlides: [],
  sekilasPandang: { title: '', content: '', image: '', stats: [] },
  visiMisi: { visi: '', misi: [] },
  pengasuh: [],
  pendidikan: { formal: [], nonFormal: [], extracurriculars: [], schedule: [] },
  pojokSantri: [],
  pengumuman: [],
  pendaftaran: {
    isOpen: false,
    description: '',
    descriptionExtra: '',
    requirements: [],
    waves: [],
    registrationUrl: '',
    brochureUrl: ''
  },
};

/* ============================= */
/* ===== SANITIZE UTILITY ===== */
/* ============================= */

const sanitizeRichText = (html = '') => {
  if (!html || typeof window === 'undefined') return html;

  const normalized = html
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/<p><br><\/p>/g, '')
    .trim();

  return DOMPurify.sanitize(normalized, {
    USE_PROFILES: { html: true }
  });
};

export function DataProvider({ children }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);

  /* ============================= */
  /* ===== FETCH ALL DATA ======= */
  /* ============================= */

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [
        heroSlides,
        sekilasPandang,
        visiMisi,
        pengasuh,
        pendidikan,
        pojokSantriResponse,
        pengumuman,
        pendaftaran,
      ] = await Promise.all([
        getHero(),
        getSekilasPandang(),
        getVisiMisi(),
        getPengasuh(),
        getPendidikan(),
        getArticles(1, 200, 'all'),
        getPengumuman(),
        getPendaftaran(),
      ]);

      setData({
        heroSlides: heroSlides || [],
        sekilasPandang: sekilasPandang || initialData.sekilasPandang,
        visiMisi: visiMisi || initialData.visiMisi,
        pengasuh: pengasuh || [],
        pendidikan: pendidikan || initialData.pendidikan,
        pojokSantri: pojokSantriResponse?.data || [],
        pengumuman: pengumuman || [],
        pendaftaran: pendaftaran || initialData.pendaftaran,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* ============================= */
  /* ===== HERO SLIDES ========= */
  /* ============================= */

  const addHeroSlide = async (slide) => {
    const created = await createHeroSlide(slide);
    setData((prev) => ({
      ...prev,
      heroSlides: [...prev.heroSlides, created]
    }));
  };

  const updateHeroSlide = async (id, updatedSlide) => {
    const updated = await updateHeroSlideApi(id, updatedSlide);
    setData((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.map((s) =>
        String(s.id) === String(id) ? updated : s
      ),
    }));
  };

  const deleteHeroSlide = async (id) => {
    await deleteHeroSlideApi(id);
    setData((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((s) =>
        String(s.id) !== String(id)
      ),
    }));
  };

  /* ============================= */
  /* ===== SEKILAS PANDANG ===== */
  /* ============================= */

  const updateSekilasPandang = async (newData) => {
    const cleaned = {
      ...newData,
      content: sanitizeRichText(newData.content),
    };

    const updated = await updateSekilasPandangApi(cleaned);

    setData((prev) => ({
      ...prev,
      sekilasPandang: updated || prev.sekilasPandang,
    }));
  };

  /* ============================= */
  /* ===== VISI MISI ============ */
  /* ============================= */

  const updateVisiMisi = async (newData) => {
    const updated = await updateVisiMisiApi(newData);
    setData((prev) => ({
      ...prev,
      visiMisi: updated || prev.visiMisi,
    }));
  };

  /* ============================= */
  /* ===== PENGASUH ============ */
  /* ============================= */

  const addPengasuh = async (pengasuh) => {
    const created = await createPengasuh(pengasuh);
    setData((prev) => ({
      ...prev,
      pengasuh: [created, ...prev.pengasuh],
    }));
  };

  const updatePengasuh = async (newPengasuh) => {
    setData((prev) => ({
      ...prev,
      pengasuh: newPengasuh,
    }));
  };

  const deletePengasuh = async (id) => {
    await deletePengasuhApi(id);
    setData((prev) => ({
      ...prev,
      pengasuh: prev.pengasuh.filter((p) =>
        String(p.id) !== String(id)
      ),
    }));
  };

  /* ============================= */
  /* ===== PENDIDIKAN ========== */
  /* ============================= */

  const updatePendidikan = async (newPendidikan) => {
    const updated = await updatePendidikanApi(newPendidikan);
    setData((prev) => ({
      ...prev,
      pendidikan: updated || prev.pendidikan,
    }));
  };

  /* ============================= */
  /* ===== POJOK SANTRI ======== */
  /* ============================= */

  const addPojokSantri = async (article) => {
    const cleaned = {
      ...article,
      content: sanitizeRichText(article.content),
    };

    const created = await createPojokSantri(cleaned);

    setData((prev) => ({
      ...prev,
      pojokSantri: [created, ...prev.pojokSantri],
    }));
  };

  const updatePojokSantri = async (id, newData) => {
    const cleaned = {
      ...newData,
      content: sanitizeRichText(newData.content),
    };

    const updated = await updatePojokSantriApi(id, cleaned);

    setData((prev) => ({
      ...prev,
      pojokSantri: prev.pojokSantri.map((a) =>
        String(a.id) === String(id) ? updated : a
      ),
    }));
  };

  const deletePojokSantri = async (id) => {
    await deletePojokSantriApi(id);
    setData((prev) => ({
      ...prev,
      pojokSantri: prev.pojokSantri.filter((a) =>
        String(a.id) !== String(id)
      ),
    }));
  };

  /* ============================= */
  /* ===== PENGUMUMAN ========== */
  /* ============================= */

  const addPengumuman = async (item) => {
    const cleaned = {
      ...item,
      content: sanitizeRichText(item.content),
    };

    const created = await createPengumuman(cleaned);

    setData((prev) => ({
      ...prev,
      pengumuman: [created, ...prev.pengumuman],
    }));
  };

  const updatePengumuman = async (id, newData) => {
    const cleaned = {
      ...newData,
      content: sanitizeRichText(newData.content),
    };

    const updated = await updatePengumumanApi(id, cleaned);

    setData((prev) => ({
      ...prev,
      pengumuman: prev.pengumuman.map((a) =>
        String(a.id) === String(id) ? updated : a
      ),
    }));
  };

  const deletePengumuman = async (id) => {
    await deletePengumumanApi(id);
    setData((prev) => ({
      ...prev,
      pengumuman: prev.pengumuman.filter((a) =>
        String(a.id) !== String(id)
      ),
    }));
  };

  /* ============================= */
  /* ===== PENDAFTARAN ========= */
  /* ============================= */

  const updatePendaftaran = async (newData) => {
    const cleaned = {
      ...newData,
      description: sanitizeRichText(newData.description || ''),
      descriptionExtra: sanitizeRichText(newData.descriptionExtra || ''),
    };

    const updated = await updatePendaftaranApi(cleaned);

    setData((prev) => ({
      ...prev,
      pendaftaran: updated || prev.pendaftaran,
    }));
  };

  return (
    <DataContext.Provider
      value={{
        ...data,
        loading,
        addHeroSlide,
        updateHeroSlide,
        deleteHeroSlide,
        updateSekilasPandang,
        updateVisiMisi,
        addPengasuh,
        updatePengasuh,
        deletePengasuh,
        updatePendidikan,
        addPojokSantri,
        updatePojokSantri,
        deletePojokSantri,
        addPengumuman,
        updatePengumuman,
        deletePengumuman,
        updatePendaftaran,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
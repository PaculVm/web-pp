-- Schema untuk database ppds
-- Jalankan file ini di phpMyAdmin Hostinger

CREATE DATABASE IF NOT EXISTS ppds;
USE ppds;

-- Tabel Hero Slides
CREATE TABLE IF NOT EXISTS hero_slides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  image_url TEXT,
  button_text VARCHAR(100),
  button_link VARCHAR(255),
  sort_order INT DEFAULT 0
);

-- Tabel Sekilas Pandang
CREATE TABLE IF NOT EXISTS sekilas_pandang (
  id INT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  image TEXT,
  stats JSON
);

-- Tabel Visi Misi
CREATE TABLE IF NOT EXISTS visi_misi (
  id INT PRIMARY KEY,
  visi TEXT,
  misi JSON
);

-- Tabel Pengasuh
CREATE TABLE IF NOT EXISTS pengasuh (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  image TEXT,
  bio TEXT
);

-- Tabel Pendidikan
CREATE TABLE IF NOT EXISTS pendidikan (
  id INT PRIMARY KEY,
  formal JSON,
  non_formal JSON,
  extracurriculars JSON,
  schedule JSON
);

-- Tabel Pojok Santri
CREATE TABLE IF NOT EXISTS pojok_santri (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT,
  author VARCHAR(255),
  author_role VARCHAR(255),
  date DATE,
  image TEXT,
  category VARCHAR(100)
);

-- Tabel Pengumuman
CREATE TABLE IF NOT EXISTS pengumuman (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT,
  date DATE,
  important TINYINT(1) DEFAULT 0
);

-- Tabel Pendaftaran
CREATE TABLE IF NOT EXISTS pendaftaran (
  id INT PRIMARY KEY,
  is_open TINYINT(1) DEFAULT 1,
  description TEXT,
  description_extra TEXT,
  requirements JSON,
  waves JSON,
  registration_url TEXT,
  brochure_url TEXT
);

-- Tabel Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'editor'
);

-- =====================
-- DATA AWAL (SEED)
-- =====================

-- Hero Slides
INSERT INTO hero_slides (title, subtitle, description, image_url, button_text, button_link, sort_order) VALUES
('Pondok Pesantren Darussalam', 'Selamat Datang di', 'Membentuk generasi muslim yang berilmu, berakhlak mulia, dan berdaya saing tinggi.', '/images/placeholder.svg', 'Daftar Sekarang', '/pendaftaran', 1),
('Pendidikan Islam Terpadu', 'Program Unggulan', 'Memadukan kurikulum nasional dengan nilai-nilai kepesantrenan untuk mencetak santri yang unggul.', '/images/placeholder.svg', 'Lihat Program', '/pendidikan', 2);

-- Sekilas Pandang
INSERT INTO sekilas_pandang (id, title, content, image, stats) VALUES
(1, 'Sekilas Pandang', 'Pondok Pesantren Darussalam didirikan di Desa Panusupan, Kecamatan Cilongok, Kabupaten Banyumas, Jawa Tengah. Pesantren ini hadir sebagai jawaban atas kebutuhan masyarakat akan pendidikan Islam yang berkualitas.\n\nDengan mengusung visi membentuk generasi muslim yang berilmu, berakhlak mulia, dan berdaya saing tinggi, Pondok Pesantren Darussalam terus berkembang menjadi lembaga pendidikan Islam yang dipercaya masyarakat.\n\nPesantren ini menyelenggarakan pendidikan formal (MTs dan MA) serta pendidikan kepesantrenan yang meliputi Madrasah Diniyah dan program Tahfidzul Quran.', '/images/placeholder.svg',
JSON_ARRAY(
  JSON_OBJECT('label', 'Santri Aktif', 'value', '100+'),
  JSON_OBJECT('label', 'Tahun Berdiri', 'value', '1990'),
  JSON_OBJECT('label', 'Tenaga Pengajar', 'value', '30+'),
  JSON_OBJECT('label', 'Luas Area', 'value', '1 Ha')
));

-- Visi Misi
INSERT INTO visi_misi (id, visi, misi) VALUES
(1, 'Menjadi lembaga pendidikan Islam yang unggul dalam membentuk generasi muslim yang berilmu, berakhlak mulia, mandiri, dan berdaya saing tinggi di tingkat nasional maupun internasional.',
JSON_ARRAY(
  'Menyelenggarakan pendidikan Islam yang berkualitas dengan memadukan kurikulum nasional dan kurikulum kepesantrenan.',
  'Membentuk santri yang memiliki akhlakul karimah dan kepribadian Islami yang kuat.',
  'Mengembangkan potensi santri dalam bidang akademik, tahfidz Al-Quran, dan keterampilan hidup.',
  'Menciptakan lingkungan belajar yang kondusif, nyaman, dan mendukung perkembangan santri.',
  'Menjalin kerjasama dengan berbagai pihak untuk meningkatkan kualitas pendidikan.'
));

-- Pendidikan
INSERT INTO pendidikan (id, formal, non_formal, extracurriculars, schedule) VALUES
(1,
JSON_ARRAY(
  JSON_OBJECT('id', 'f1', 'level', 'MTs Darussalam Cilongok', 'desc', 'Sekolah Menengah Pertama yang mengintegrasikan kurikulum nasional dengan nilai-nilai kepesantrenan. Menekankan pada pembentukan karakter dan penguasaan dasar-dasar ilmu agama.', 'features', JSON_ARRAY('Kurikulum K13 & Merdeka', 'Program Tahfidz Juz 30', 'Bahasa Arab & Inggris Dasar', 'Pembiasaan Sholat Berjamaah')),
  JSON_OBJECT('id', 'f2', 'level', 'MA Darussalam Cilongok', 'desc', 'Sekolah Menengah Atas dengan jurusan IPA dan IPS. Fokus pada persiapan santri menuju jenjang pendidikan tinggi dan penguasaan kitab kuning tingkat lanjut.', 'features', JSON_ARRAY('Persiapan UTBK/SNBT', 'Kajian Kitab Kuning Fathul Qorib & Bulughul Maram', 'Program Entrepreneurship', 'Ekstrakurikuler Multimedia'))
),
JSON_ARRAY(
  JSON_OBJECT('id', 'nf1', 'name', 'Madrasah Diniyah', 'desc', 'Pendidikan keagamaan berjenjang yang wajib diikuti seluruh santri.', 'levels', JSON_ARRAY('Ula (Tingkat Dasar)', 'Wustho (Tingkat Menengah)', 'Ulya (Tingkat Atas)'), 'subjects', JSON_ARRAY('Fiqh', 'Tauhid', 'Akhlak', 'Nahwu Shorof', 'Tarikh Islam', 'Hadits', 'Tafsir')),
  JSON_OBJECT('id', 'nf2', 'name', 'Tahfidzul Quran', 'desc', 'Program menghafal Al-Quran dengan target hafalan yang disesuaikan dengan kemampuan santri.', 'programs', JSON_ARRAY('Tahfidz Reguler (Target 1-5 Juz)', 'Tahfidz Takhassus (Target 30 Juz)', 'Tahsin & Tilawah'))
),
JSON_ARRAY('Pramuka', 'Pencak Silat (Pagar Nusa)', 'Hadroh & Sholawat', 'Kaligrafi', 'Jurnalistik', 'Muhadhoroh (Public Speaking)', 'Kewirausahaan', 'Bahasa Asing (Arab & Inggris)'),
JSON_ARRAY(
  JSON_OBJECT('time', '03.30 - 04.30', 'activity', 'Qiyamul Lail & Sholat Subuh'),
  JSON_OBJECT('time', '07.00 - 13.00', 'activity', 'Sekolah Formal (MTs/MA)'),
  JSON_OBJECT('time', '14.00 - 15.00', 'activity', 'Madrasah Diniyah'),
  JSON_OBJECT('time', '18.00 - 20.30', 'activity', 'Kegiatan Mengaji & Belajar Malam')
));

-- Pendaftaran
INSERT INTO pendaftaran (id, is_open, description, description_extra, requirements, waves, registration_url) VALUES
(1, 1,
'Penerimaan Santri Baru (PSB) Pondok Pesantren Darussalam dibuka untuk jenjang pendidikan MTs dan MA. Kami berkomitmen mencetak generasi yang tidak hanya unggul dalam ilmu agama, tetapi juga berprestasi dalam ilmu pengetahuan umum.',
'Proses pendaftaran kini dapat dilakukan secara online melalui website resmi PSB kami. Silakan persiapkan berkas-berkas yang diperlukan sebelum mengisi formulir.',
JSON_ARRAY('Mengisi formulir pendaftaran', 'Fotokopi Ijazah & SKHUN (legalisir)', 'Fotokopi Kartu Keluarga (KK) & Akta Kelahiran', 'Pas foto terbaru 3x4 (4 lembar)', 'Surat Keterangan Sehat dari Dokter'),
JSON_ARRAY(
  JSON_OBJECT('name', 'Gelombang 1', 'period', '1 Januari - 31 Maret', 'active', true),
  JSON_OBJECT('name', 'Gelombang 2', 'period', '1 April - 30 Juni', 'active', false)
),
'http://psb.darussalampanusupan.net');

-- Users (password sudah di-hash dengan bcrypt)
-- Password: admin123
INSERT INTO users (name, username, password, role) VALUES
('Admini', 'admin', '$2y$10$/R4TyRJe07H1Fn1QX3/Jhu6vRwGEv.fUJ4W9P5.CeFZQjqmjSvWp6', 'admin');

-- Password: humas123  
INSERT INTO users (name, username, password, role) VALUES
('Staf Editor', 'ppds', '$2y$10$/R4TyRJe07H1Fn1QX3/Jhu6vRwGEv.fUJ4W9P5.CeFZQjqmjSvWp6', 'editor');

-- Password: daftar123
INSERT INTO users (name, username, password, role) VALUES
('Staf Pendaftaran', 'psb', '$2y$10$/R4TyRJe07H1Fn1QX3/Jhu6vRwGEv.fUJ4W9P5.CeFZQjqmjSvWp6', 'editor');

-- Contoh Pengumuman
INSERT INTO pengumuman (title, content, date, important) VALUES
('Pembukaan Pendaftaran Santri Baru 2026/2027', 'Assalamualaikum Warahmatullahi Wabarakatuh.\n\nDengan ini kami mengumumkan bahwa pendaftaran santri baru untuk tahun ajaran 2026/2027 telah resmi dibuka.\n\nPendaftaran dapat dilakukan secara online melalui website PSB kami. Informasi lebih lanjut dapat menghubungi panitia pendaftaran.', '2024-12-01', 1),
('Libur Akhir Semester Ganjil', 'Diberitahukan kepada seluruh santri dan wali santri bahwa libur akhir semester ganjil akan dilaksanakan pada tanggal 20 Desember 2025 - 5 Januari 2026.', '2025-12-10', 0);

-- Contoh Pojok Santri
INSERT INTO pojok_santri (title, content, author, author_role, date, image, category) VALUES
('Pengalaman Mengikuti Lomba Tahfidz Tingkat Provinsi', 'Alhamdulillah, segala puji bagi Allah SWT yang telah memberikan kesempatan kepada saya untuk mengikuti lomba tahfidz tingkat provinsi.\n\nPerjalanan ini dimulai dari seleksi internal pesantren, kemudian berlanjut ke tingkat kabupaten, dan akhirnya sampai di tingkat provinsi. Banyak pengalaman berharga yang saya dapatkan selama perjalanan ini.', 'Ahmad Fauzi', 'Kelas XII MA', '2024-11-15', '/images/placeholder.svg', 'Prestasi'),
('Tips Menghafal Al-Quran dengan Mudah', 'Menghafal Al-Quran memerlukan kesabaran dan konsistensi. Berikut beberapa tips yang bisa membantu dalam proses menghafal:\n\n1. Niatkan karena Allah\n2. Pilih waktu yang tepat (setelah subuh)\n3. Baca berulang-ulang sebelum menghafal\n4. Muraja''ah secara rutin\n5. Minta bantuan guru untuk tasmi''', 'Siti Aisyah', 'Kelas XI MA', '2024-11-10', '/images/placeholder.svg', 'Tips & Trik');

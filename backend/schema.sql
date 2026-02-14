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

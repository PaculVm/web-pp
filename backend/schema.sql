CREATE DATABASE IF NOT EXISTS ppds
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ppds;

-- =====================================
-- USERS
-- =====================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('editor','admin','superadmin') NOT NULL DEFAULT 'editor',

  failed_attempts INT DEFAULT 0,
  locked_until DATETIME NULL,

  last_login DATETIME NULL,
  last_ip VARCHAR(45) NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX(role),
  INDEX(locked_until)
) ENGINE=InnoDB;

-- =====================================
-- HERO SLIDES
-- =====================================
CREATE TABLE IF NOT EXISTS hero_slides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  image_url TEXT,
  button_text VARCHAR(100),
  button_link VARCHAR(255),
  sort_order INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX(sort_order)
) ENGINE=InnoDB;

-- =====================================
-- SEKILAS PANDANG
-- =====================================
CREATE TABLE IF NOT EXISTS sekilas_pandang (
  id INT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT,
  image TEXT,
  stats JSON,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================
-- VISI MISI
-- =====================================
CREATE TABLE IF NOT EXISTS visi_misi (
  id INT PRIMARY KEY,
  visi LONGTEXT,
  misi JSON,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================
-- PENGASUH
-- =====================================
CREATE TABLE IF NOT EXISTS pengasuh (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  image TEXT,
  bio LONGTEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================
-- PENDIDIKAN
-- =====================================
CREATE TABLE IF NOT EXISTS pendidikan (
  id INT PRIMARY KEY,
  formal JSON,
  non_formal JSON,
  extracurriculars JSON,
  schedule JSON,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================
-- POJOK SANTRI
-- =====================================
CREATE TABLE IF NOT EXISTS pojok_santri (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT,
  author VARCHAR(255),
  author_role VARCHAR(255),
  date DATE,
  image TEXT,
  category VARCHAR(100),
  status ENUM('draft','published') DEFAULT 'draft',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX(status),
  INDEX(date),
  INDEX(category)
) ENGINE=InnoDB;

-- =====================================
-- PENGUMUMAN
-- =====================================
CREATE TABLE IF NOT EXISTS pengumuman (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT,
  date DATE,
  important TINYINT(1) DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX(date),
  INDEX(important)
) ENGINE=InnoDB;

-- =====================================
-- PENDAFTARAN
-- =====================================
CREATE TABLE IF NOT EXISTS pendaftaran (
  id INT PRIMARY KEY,
  is_open TINYINT(1) DEFAULT 1,
  description LONGTEXT,
  description_extra LONGTEXT,
  requirements JSON,
  waves JSON,
  registration_url TEXT,
  brochure_url TEXT,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================
-- USER SESSIONS (TOKEN REVOCATION READY)
-- =====================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX(user_id),
  INDEX(token_hash),

  CONSTRAINT fk_user_sessions_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
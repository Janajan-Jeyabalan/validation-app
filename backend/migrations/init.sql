-- Run this SQL against your MySQL server to create the initial schema

CREATE DATABASE IF NOT EXISTS validation_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE validation_app;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS validations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS validation_steps (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  validation_id BIGINT NOT NULL,
  step_name VARCHAR(255),
  data JSON,
  completed_at DATETIME,
  FOREIGN KEY (validation_id) REFERENCES validations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS uploaded_files (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  validation_id BIGINT,
  filename VARCHAR(512),
  filesize BIGINT,
  mime VARCHAR(255),
  path VARCHAR(1024),
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (validation_id) REFERENCES validations(id) ON DELETE SET NULL
);

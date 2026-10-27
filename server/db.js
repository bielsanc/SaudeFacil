const mysql = require('mysql2/promise');

const databaseName = process.env.DB_NAME || 'saudefacil';
if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
  throw new Error('DB_NAME deve conter somente letras, números e _.');
}

const connectionOptions = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
};

let pool;

async function initializeDatabase() {
  const admin = await mysql.createConnection(connectionOptions);
  try {
    await admin.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  } finally {
    await admin.end();
  }

  pool = mysql.createPool({ ...connectionOptions, database: databaseName, decimalNumbers: true, dateStrings: true });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      weight_kg DECIMAL(6,2) NOT NULL,
      height_cm SMALLINT UNSIGNED NOT NULL,
      phone VARCHAR(30) NOT NULL,
      birth_date DATE NOT NULL,
      blood_type VARCHAR(3) NOT NULL,
      photo_uri TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS imc_records (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      age TINYINT UNSIGNED NOT NULL,
      gender VARCHAR(20) NOT NULL,
      weight_kg DECIMAL(6,2) NOT NULL,
      height_cm SMALLINT UNSIGNED NOT NULL,
      bmi DECIMAL(5,2) NOT NULL,
      category VARCHAR(40) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_imc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_imc_user_date (user_id, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS water_logs (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      log_date DATE NOT NULL,
      consumed_ml INT UNSIGNED NOT NULL DEFAULT 0,
      weight_kg DECIMAL(6,2) NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_water_user_date (user_id, log_date),
      CONSTRAINT fk_water_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  return pool;
}

function getPool() {
  if (!pool) throw new Error('Banco de dados ainda não inicializado.');
  return pool;
}

module.exports = { initializeDatabase, getPool };

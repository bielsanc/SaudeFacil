require('dotenv').config({ path: require('node:path').resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initializeDatabase, getPool } = require('./db');

const app = express();
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('Configure JWT_SECRET com pelo menos 32 caracteres no arquivo server/.env.');
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));

function publicUser(row) {
  return {
    id: row.id,
    nome: row.name,
    email: row.email,
    peso: Number(row.weight_kg),
    altura: Number(row.height_cm),
    telefone: row.phone,
    nascimento: String(row.birth_date).slice(0, 10).split('-').reverse().join('/'),
    tipoSanguineo: row.blood_type,
    fotoUri: row.photo_uri || null,
  };
}

function authRequired(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'NAO_AUTENTICADO' });
  try {
    req.userId = jwt.verify(token, jwtSecret).userId;
    next();
  } catch {
    res.status(401).json({ error: 'NAO_AUTENTICADO' });
  }
}

function criarToken(userId) {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '30d' });
}

function parseDate(value) {
  const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
  return date.getUTCFullYear() === Number(year) && date.getUTCMonth() + 1 === Number(month) && date.getUTCDate() === Number(day)
    ? `${year}-${month}-${day}` : null;
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { nome, email, peso, altura, telefone, nascimento, tipoSanguineo, senha } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const birthDate = parseDate(nascimento);
    if (!nome?.trim() || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || !birthDate || !tipoSanguineo ||
        !Number.isFinite(Number(peso)) || Number(peso) <= 0 || !Number.isFinite(Number(altura)) || Number(altura) <= 0 ||
        !telefone || String(senha || '').length < 6) {
      return res.status(400).json({ error: 'DADOS_INVALIDOS' });
    }
    const passwordHash = await bcrypt.hash(senha, 12);
    const [result] = await getPool().execute(
      'INSERT INTO users (name, email, password_hash, weight_kg, height_cm, phone, birth_date, blood_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nome.trim(), normalizedEmail, passwordHash, Number(peso), Math.round(Number(altura)), String(telefone), birthDate, String(tipoSanguineo)]
    );
    const [rows] = await getPool().execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const user = publicUser(rows[0]);
    res.status(201).json({ user, token: criarToken(user.id) });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'EMAIL_EXISTENTE' });
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const [rows] = await getPool().execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows[0] || !(await bcrypt.compare(String(req.body?.senha || ''), rows[0].password_hash))) {
      return res.status(401).json({ error: 'CREDENCIAIS_INVALIDAS' });
    }
    const user = publicUser(rows[0]);
    res.json({ user, token: criarToken(user.id) });
  } catch (error) { next(error); }
});

app.get('/api/auth/me', authRequired, async (req, res, next) => {
  try {
    const [rows] = await getPool().execute('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (!rows[0]) return res.status(404).json({ error: 'USUARIO_NAO_ENCONTRADO' });
    res.json({ user: publicUser(rows[0]) });
  } catch (error) { next(error); }
});

app.patch('/api/auth/me', authRequired, async (req, res, next) => {
  try {
    const allowed = { nome: 'name', peso: 'weight_kg', altura: 'height_cm', telefone: 'phone', tipoSanguineo: 'blood_type', fotoUri: 'photo_uri' };
    const updates = Object.entries(req.body || {}).filter(([key]) => allowed[key]);
    if (!updates.length) return res.status(400).json({ error: 'DADOS_INVALIDOS' });
    const columns = updates.map(([key]) => `\`${allowed[key]}\` = ?`).join(', ');
    const values = updates.map(([key, value]) => key === 'nome' ? String(value).trim() : value);
    await getPool().execute(`UPDATE users SET ${columns} WHERE id = ?`, [...values, req.userId]);
    const [rows] = await getPool().execute('SELECT * FROM users WHERE id = ?', [req.userId]);
    res.json({ user: publicUser(rows[0]) });
  } catch (error) { next(error); }
});

app.post('/api/imc', authRequired, async (req, res, next) => {
  try {
    const { idade, genero, peso, altura, imc, categoria } = req.body || {};
    const values = [idade, peso, altura, imc].map(Number);
    if (!Number.isInteger(values[0]) || values[0] < 1 || values[0] > 120 || values.slice(1).some((n) => !Number.isFinite(n) || n <= 0) || !categoria) {
      return res.status(400).json({ error: 'DADOS_INVALIDOS' });
    }
    const [result] = await getPool().execute(
      'INSERT INTO imc_records (user_id, age, gender, weight_kg, height_cm, bmi, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.userId, values[0], String(genero || ''), values[1], Math.round(values[2]), values[3], String(categoria)]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) { next(error); }
});

app.get('/api/water/today', authRequired, async (req, res, next) => {
  try {
    const [rows] = await getPool().execute(
      'SELECT consumed_ml AS consumido, weight_kg AS peso FROM water_logs WHERE user_id = ? AND log_date = CURDATE()', [req.userId]
    );
    res.json({ consumido: Number(rows[0]?.consumido || 0), peso: rows[0]?.peso == null ? null : Number(rows[0].peso) });
  } catch (error) { next(error); }
});

app.put('/api/water/today', authRequired, async (req, res, next) => {
  try {
    const consumido = Number(req.body?.consumido);
    const peso = req.body?.peso == null ? null : Number(req.body.peso);
    if (!Number.isInteger(consumido) || consumido < 0 || !Number.isFinite(peso) || peso <= 0) {
      return res.status(400).json({ error: 'DADOS_INVALIDOS' });
    }
    await getPool().execute(
      `INSERT INTO water_logs (user_id, log_date, consumed_ml, weight_kg) VALUES (?, CURDATE(), ?, ?)
       ON DUPLICATE KEY UPDATE consumed_ml = VALUES(consumed_ml), weight_kg = VALUES(weight_kg)`,
      [req.userId, consumido, peso]
    );
    res.json({ consumido, peso });
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error('API error:', error.message);
  res.status(500).json({ error: 'ERRO_INTERNO' });
});

initializeDatabase()
  .then(() => app.listen(port, '0.0.0.0', () => console.log(`SaudeFacil API pronta na porta ${port}.`)))
  .catch((error) => {
    console.error('Não foi possível conectar ao MySQL do XAMPP:', error.message);
    process.exit(1);
  });

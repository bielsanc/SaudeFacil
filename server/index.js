require('dotenv').config({ path: require('node:path').resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initializeDatabase, getPool } = require('./db');

const app = express();
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET;
const ubsCache = new Map();
let lastNominatimRequestAt = 0;

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
    alergias: row.allergies || '',
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

app.get('/api/ubs', async (req, res) => {
  const latitude = Number(req.query.latitude);
  const longitude = Number(req.query.longitude);
  const radius = Math.min(Math.max(Number(req.query.radius) || 5000, 500), 10000);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return res.status(400).json({ error: 'COORDENADAS_INVALIDAS' });
  }
  const cacheKey = `${latitude.toFixed(3)}:${longitude.toFixed(3)}:${radius}`;
  const cached = ubsCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return res.json({ ...cached.data, cache: true });
  try {
    const query = `[out:json][timeout:20];(nwr(around:${radius},${latitude},${longitude})[amenity~"^(clinic|doctors)$"];nwr(around:${radius},${latitude},${longitude})[healthcare~"^(clinic|centre|doctor|doctors)$"];nwr(around:${radius},${latitude},${longitude})[name~"UBS|Unidade Básica|Unidade Basica",i];);out center tags;`;
    const endpoints = [...new Set([
      process.env.OVERPASS_URL,
      'https://overpass-api.de/api/interpreter',
      'https://lz4.overpass-api.de/api/interpreter',
      'https://z.overpass-api.de/api/interpreter',
      'https://overpass.private.coffee/api/interpreter',
    ].filter(Boolean))];
    let data;
    let lastError;
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'User-Agent': 'SaudeFacil/1.0 (UBS nearby search)' },
          body: new URLSearchParams({ data: query }),
          signal: AbortSignal.timeout(3500),
        });
        if (!response.ok) throw new Error(`Overpass respondeu ${response.status}`);
        data = await response.json();
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (!data) throw lastError || new Error('Nenhuma instância Overpass disponível');
    const unidades = (data.elements || []).map((element) => {
      const tags = element.tags || {};
      const point = element.lat != null ? element : element.center;
      if (!point) return null;
      const lat = Number(point.lat);
      const lon = Number(point.lon);
      const distance = distanceInKm(latitude, longitude, lat, lon);
      return {
        id: `${element.type}-${element.id}`,
        nome: tags.name || tags['name:pt'] || tags.official_name || 'Unidade de saúde',
        endereco: [tags['addr:street'], tags['addr:housenumber'], tags['addr:suburb'] || tags['addr:city']].filter(Boolean).join(', '),
        latitude: lat,
        longitude: lon,
        distanciaKm: Number(distance.toFixed(1)),
      };
    }).filter(Boolean).sort((a, b) => a.distanciaKm - b.distanciaKm).slice(0, 50);
    if (unidades.length) return sendUbsResult(res, cacheKey, { unidades, fonte: 'OpenStreetMap', raioMetros: radius });
    throw new Error('Overpass não encontrou UBS; tentando busca por nome.');
  } catch (error) {
    console.error('UBS lookup error:', error.message);
    try {
      const unidades = await buscarUbsNominatim(latitude, longitude, radius);
      return sendUbsResult(res, cacheKey, { unidades, fonte: 'OpenStreetMap', raioMetros: radius });
    } catch (fallbackError) {
      console.error('UBS fallback error:', fallbackError.message);
      return res.status(502).json({ error: 'BUSCA_UBS_INDISPONIVEL' });
    }
  }
});

function sendUbsResult(res, cacheKey, data) {
  ubsCache.set(cacheKey, { data, expiresAt: Date.now() + 10 * 60 * 1000 });
  if (ubsCache.size > 100) ubsCache.delete(ubsCache.keys().next().value);
  return res.json(data);
}

async function buscarUbsNominatim(latitude, longitude, radius) {
  const waitMs = Math.max(0, 1000 - (Date.now() - lastNominatimRequestAt));
  if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
  lastNominatimRequestAt = Date.now();

  const latitudeDelta = (radius / 1000) / 111;
  const longitudeDelta = latitudeDelta / Math.max(Math.cos(latitude * Math.PI / 180), 0.01);
  const params = new URLSearchParams({
    format: 'jsonv2',
    q: 'UBS',
    viewbox: `${longitude - longitudeDelta},${latitude + latitudeDelta},${longitude + longitudeDelta},${latitude - latitudeDelta}`,
    bounded: '1',
    limit: '50',
    addressdetails: '1',
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'User-Agent': 'SaudeFacil/1.0 (UBS nearby search)', Referer: 'http://localhost:3000/' },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Nominatim respondeu ${response.status}`);
  const places = await response.json();
  return places.map((place) => {
    const lat = Number(place.lat);
    const lon = Number(place.lon);
    const address = place.address || {};
    return {
      id: `nominatim-${place.osm_type}-${place.osm_id}`,
      nome: place.name || String(place.display_name || 'UBS').split(',')[0],
      endereco: [address.road, address.house_number, address.suburb || address.city || address.town].filter(Boolean).join(', '),
      latitude: lat,
      longitude: lon,
      distanciaKm: Number(distanceInKm(latitude, longitude, lat, lon).toFixed(1)),
    };
  }).filter((place) => place.distanciaKm <= radius / 1000).sort((a, b) => a.distanciaKm - b.distanciaKm);
}

app.get('/api/fruit/:name', async (req, res) => {
  const name = String(req.params.name || '').trim();
  if (!name || name.length > 80) return res.status(400).json({ error: 'NOME_FRUTA_INVALIDO' });
  try {
    const response = await fetch(`https://www.fruityvice.com/api/fruit/${encodeURIComponent(name)}`, { signal: AbortSignal.timeout(12000) });
    if (response.status === 404) return res.status(404).json({ error: 'FRUTA_NAO_ENCONTRADA' });
    if (!response.ok) throw new Error(`Fruityvice respondeu ${response.status}`);
    res.json(await response.json());
  } catch (error) {
    console.error('Fruit lookup error:', error.message);
    res.status(502).json({ error: 'BUSCA_FRUTA_INDISPONIVEL' });
  }
});

app.post('/api/translate/batch', async (req, res) => {
  const texts = req.body?.texts;
  if (!Array.isArray(texts) || texts.length > 100 || texts.some((text) => typeof text !== 'string' || text.length > 200)) {
    return res.status(400).json({ error: 'TEXTOS_INVALIDOS' });
  }
  if (!process.env.DEEPL_API_KEY) return res.status(503).json({ error: 'TRADUCAO_NAO_CONFIGURADA' });
  try {
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: { Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: texts, source_lang: 'EN', target_lang: 'PT-BR' }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`DeepL respondeu ${response.status}`);
    const data = await response.json();
    res.json({ translations: data.translations || [] });
  } catch (error) {
    console.error('Translation error:', error.message);
    res.status(502).json({ error: 'TRADUCAO_INDISPONIVEL' });
  }
});

function distanceInKm(lat1, lon1, lat2, lon2) {
  const radians = (degrees) => degrees * Math.PI / 180;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { nome, email, peso, altura, telefone, nascimento, tipoSanguineo, alergias, senha } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const birthDate = parseDate(nascimento);
    const allergyText = String(alergias || '').trim();
    if (!nome?.trim() || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || !birthDate || !tipoSanguineo ||
        !Number.isFinite(Number(peso)) || Number(peso) <= 0 || !Number.isFinite(Number(altura)) || Number(altura) <= 0 ||
        !telefone || String(senha || '').length < 6 || allergyText.length > 500) {
      return res.status(400).json({ error: 'DADOS_INVALIDOS' });
    }
    const passwordHash = await bcrypt.hash(senha, 12);
    const [result] = await getPool().execute(
      'INSERT INTO users (name, email, password_hash, weight_kg, height_cm, phone, birth_date, blood_type, allergies) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nome.trim(), normalizedEmail, passwordHash, Number(peso), Math.round(Number(altura)), String(telefone), birthDate, String(tipoSanguineo), allergyText || null]
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
    const allowed = { nome: 'name', peso: 'weight_kg', altura: 'height_cm', telefone: 'phone', tipoSanguineo: 'blood_type', alergias: 'allergies', fotoUri: 'photo_uri' };
    const updates = Object.entries(req.body || {}).filter(([key]) => allowed[key]);
    if (!updates.length) return res.status(400).json({ error: 'DADOS_INVALIDOS' });
    if (updates.some(([key, value]) => key === 'alergias' && (typeof value !== 'string' || value.length > 500))) {
      return res.status(400).json({ error: 'DADOS_INVALIDOS' });
    }
    const columns = updates.map(([key]) => `\`${allowed[key]}\` = ?`).join(', ');
    const values = updates.map(([key, value]) => key === 'nome' || key === 'alergias' ? (String(value).trim() || null) : value);
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

function measuredAtFrom(body) {
  const date = parseDate(body?.date);
  const time = String(body?.time || '');
  if (!date || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  return `${date} ${time}:00`;
}

app.get('/api/pressure', authRequired, async (req, res, next) => {
  try {
    const [rows] = await getPool().execute('SELECT id, systolic, diastolic, heart_rate AS heartRate, context, notes, measured_at AS measuredAt FROM pressure_records WHERE user_id = ? ORDER BY measured_at DESC LIMIT 90', [req.userId]);
    res.json({ records: rows.map((row) => ({ ...row, id: Number(row.id), systolic: Number(row.systolic), diastolic: Number(row.diastolic), heartRate: row.heartRate == null ? null : Number(row.heartRate) })) });
  } catch (error) { next(error); }
});

app.post('/api/pressure', authRequired, async (req, res, next) => {
  try {
    const { systolic, diastolic, heartRate, context, notes } = req.body || {};
    const measuredAt = measuredAtFrom(req.body);
    if (!Number.isInteger(Number(systolic)) || Number(systolic) < 1 || Number(systolic) > 400 || !Number.isInteger(Number(diastolic)) || Number(diastolic) < 1 || Number(diastolic) > 300 || (heartRate != null && (!Number.isInteger(Number(heartRate)) || Number(heartRate) < 1 || Number(heartRate) > 300)) || !['Em repouso', 'Após atividade', 'Outro'].includes(context) || !measuredAt || String(notes || '').length > 500) return res.status(400).json({ error: 'DADOS_INVALIDOS' });
    const [result] = await getPool().execute('INSERT INTO pressure_records (user_id, systolic, diastolic, heart_rate, context, notes, measured_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.userId, Number(systolic), Number(diastolic), heartRate == null ? null : Number(heartRate), context, String(notes || '').trim() || null, measuredAt]);
    res.status(201).json({ id: Number(result.insertId) });
  } catch (error) { next(error); }
});

app.get('/api/glucose', authRequired, async (req, res, next) => {
  try {
    const [rows] = await getPool().execute('SELECT id, glucose_mg_dl AS value, context, notes, measured_at AS measuredAt FROM glucose_records WHERE user_id = ? ORDER BY measured_at DESC LIMIT 90', [req.userId]);
    res.json({ records: rows.map((row) => ({ ...row, id: Number(row.id), value: Number(row.value) })) });
  } catch (error) { next(error); }
});

app.post('/api/glucose', authRequired, async (req, res, next) => {
  try {
    const value = Number(req.body?.value);
    const { context, notes } = req.body || {};
    const measuredAt = measuredAtFrom(req.body);
    if (!Number.isFinite(value) || value <= 0 || value > 1500 || !['Em jejum', 'Antes da refeição', '1–2h após refeição', 'Ao acaso'].includes(context) || !measuredAt || String(notes || '').length > 500) return res.status(400).json({ error: 'DADOS_INVALIDOS' });
    const [result] = await getPool().execute('INSERT INTO glucose_records (user_id, glucose_mg_dl, context, notes, measured_at) VALUES (?, ?, ?, ?, ?)', [req.userId, value, context, String(notes || '').trim() || null, measuredAt]);
    res.status(201).json({ id: Number(result.insertId) });
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

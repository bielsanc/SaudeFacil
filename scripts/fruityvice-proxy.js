const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

loadLocalEnvironment();

const port = Number(process.env.FRUIT_PROXY_PORT || 3001);
let deepLTranslationCache = null;

const server = http.createServer(async (request, response) => {
  const origin = request.headers.origin;
  if (isLocalOrigin(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204).end();
    return;
  }

  if (request.method === 'POST') {
    let pathname;
    try {
      pathname = new URL(request.url, `http://localhost:${port}`).pathname;
    } catch {
      sendJson(response, 400, { error: 'Invalid API request' });
      return;
    }
    if (pathname !== '/api/translate/batch') {
      sendJson(response, 404, { error: 'API endpoint not found' });
      return;
    }
    await translateFruitCatalog(request, response);
    return;
  }

  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  let fruitName;
  try {
    const requestUrl = new URL(request.url, `http://localhost:${port}`);
    const match = requestUrl.pathname.match(/^\/api\/fruit\/([^/]+)$/);
    if (!match) {
      sendJson(response, 404, { error: 'API endpoint not found' });
      return;
    }
    fruitName = decodeURIComponent(match[1]).trim();
  } catch {
    sendJson(response, 400, { error: 'Invalid API request' });
    return;
  }

  if (!fruitName) {
    sendJson(response, 400, { error: 'Fruit name is required' });
    return;
  }

  try {
    const apiResponse = await fetch(`https://www.fruityvice.com/api/fruit/${encodeURIComponent(fruitName)}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(12000),
    });
    const body = await apiResponse.text();
    response.writeHead(apiResponse.status, {
      'Content-Type': apiResponse.headers.get('content-type') || 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    }).end(body);
  } catch (error) {
    const status = error.name === 'TimeoutError' ? 504 : 502;
    sendJson(response, status, { error: 'Could not reach Fruityvice' });
  }
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Fruityvice web proxy is already listening on http://localhost:${port}`);
    process.exit(0);
    return;
  }
  console.error('Could not start the Fruityvice web proxy:', error.message);
  process.exit(1);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Fruityvice web proxy listening on http://localhost:${port}`);
});

function isLocalOrigin(origin) {
  if (!origin) return false;
  try {
    const { protocol, hostname } = new URL(origin);
    return protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1');
  } catch {
    return false;
  }
}

function sendJson(response, status, data) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(data));
}

async function translateFruitCatalog(request, response) {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    sendJson(response, 503, { error: 'DeepL API key is not configured' });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request, 8192);
  } catch (error) {
    sendJson(response, error.statusCode || 400, { error: error.statusCode === 413 ? 'Request body is too large' : 'Invalid JSON body' });
    return;
  }

  const texts = body?.texts;
  if (!Array.isArray(texts) || texts.length < 1 || texts.length > 50
    || texts.some((text) => typeof text !== 'string' || !text.trim() || text.length > 80)) {
    sendJson(response, 400, { error: 'Expected 1 to 50 fruit names in texts' });
    return;
  }

  const cacheKey = JSON.stringify(texts);
  if (deepLTranslationCache?.key === cacheKey) {
    sendJson(response, 200, deepLTranslationCache.value);
    return;
  }

  const endpoint = apiKey.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com';
  try {
    const apiResponse = await fetch(`${endpoint}/v2/translate`, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        text: texts,
        source_lang: 'EN',
        target_lang: 'PT-BR',
        context: 'Nomes de frutas em uma aplicação de informações nutricionais para usuários brasileiros.',
      }),
      signal: AbortSignal.timeout(20000),
    });
    const responseBody = await apiResponse.text();
    if (apiResponse.ok) {
      const result = JSON.parse(responseBody);
      deepLTranslationCache = { key: cacheKey, value: result };
      sendJson(response, apiResponse.status, result);
      return;
    }
    response.writeHead(apiResponse.status, {
      'Content-Type': apiResponse.headers.get('content-type') || 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    }).end(responseBody);
  } catch (error) {
    const status = error.name === 'TimeoutError' ? 504 : 502;
    sendJson(response, status, { error: 'Could not reach DeepL' });
  }
}

async function readJsonBody(request, maxBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) {
      const error = new Error('Request body is too large');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function loadLocalEnvironment() {
  for (const filename of ['.env.local', '.env']) {
    const envPath = path.resolve(__dirname, '..', filename);
    if (!fs.existsSync(envPath)) continue;
    const contents = fs.readFileSync(envPath, 'utf8');
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || process.env[match[1]] !== undefined) continue;
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
}

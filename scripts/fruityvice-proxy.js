const http = require('node:http');

const port = Number(process.env.FRUIT_PROXY_PORT || 3001);

const server = http.createServer(async (request, response) => {
  const origin = request.headers.origin;
  if (isLocalOrigin(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204).end();
    return;
  }

  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  let fruitName;
  let translation;
  try {
    const requestUrl = new URL(request.url, `http://localhost:${port}`);
    if (requestUrl.pathname === '/api/translate') {
      const text = requestUrl.searchParams.get('text')?.trim();
      const from = requestUrl.searchParams.get('from');
      const to = requestUrl.searchParams.get('to');
      if (!text || text.length > 100 || ![['pt', 'en'], ['en', 'pt']].some(([source, target]) => source === from && target === to)) {
        sendJson(response, 400, { error: 'Invalid translation request' });
        return;
      }
      translation = { text, from, to };
    } else {
      const match = requestUrl.pathname.match(/^\/api\/fruit\/([^/]+)$/);
      if (!match) {
        sendJson(response, 404, { error: 'API endpoint not found' });
        return;
      }
      fruitName = decodeURIComponent(match[1]).trim();
    }
  } catch {
    sendJson(response, 400, { error: 'Invalid API request' });
    return;
  }

  if (!translation && !fruitName) {
    sendJson(response, 400, { error: 'Fruit name is required' });
    return;
  }

  try {
    let apiUrl;
    if (translation) {
      const translationUrl = new URL('https://api.mymemory.translated.net/get');
      translationUrl.searchParams.set('q', translation.text);
      translationUrl.searchParams.set('langpair', `${translation.from}|${translation.to}`);
      apiUrl = translationUrl;
    } else {
      apiUrl = `https://www.fruityvice.com/api/fruit/${encodeURIComponent(fruitName)}`;
    }
    const apiResponse = await fetch(apiUrl, {
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

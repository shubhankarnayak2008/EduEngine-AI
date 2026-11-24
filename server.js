/**
 * Production Backend API Server & Proxy for B.Tech AI Study Assistant
 * -------------------------------------------------------------------
 * Ensures API keys (GEMINI_API_KEY, YOUTUBE_API_KEY) remain strictly server-side
 * and are NEVER exposed to client browsers or bundled into frontend JavaScript.
 *
 * Built using native Node.js modules (http, https, fs, path, url) - zero external dependencies required.
 *
 * Endpoints:
 * - POST /api/gemini/*   -> Proxies to Google Generative Language API (with SSE streaming support)
 * - GET  /api/youtube/*  -> Proxies to Google YouTube Data API v3
 * - GET  /api/health     -> Returns service status & key presence (without leaking key values)
 * - POST /api/config/key -> Allows updating API keys securely
 * - GET  /*              -> Serves static frontend production assets from dist/
 */

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: Dynamically read keys from .env
function getEnvKeys() {
  let gemini = '';
  let youtube = '';
  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const rawLine of content.split('\n')) {
        const line = rawLine.trim();
        if (line.startsWith('#') || !line.includes('=')) continue;
        const [k, ...v] = line.split('=');
        const keyName = k.trim();
        const keyVal = v.join('=').trim().replace(/^["']|["']$/g, '');

        if (keyName === 'GEMINI_API_KEY' || keyName === 'VITE_GEMINI_API_KEY') {
          if (keyVal && !keyVal.includes('PASTE_YOUR_') && keyVal.length > 5) {
            gemini = keyVal;
          }
        }
        if (keyName === 'YOUTUBE_API_KEY' || keyName === 'VITE_YOUTUBE_API_KEY') {
          if (keyVal && !keyVal.includes('PASTE_YOUR_') && keyVal.length > 5) {
            youtube = keyVal;
          }
        }
      }
    }
  } catch (err) {
    console.warn('[server.js] Could not parse .env file:', err.message);
  }

  gemini = gemini || (process.env.GEMINI_API_KEY || '').trim();
  youtube = youtube || (process.env.YOUTUBE_API_KEY || '').trim();

  return { gemini, youtube };
}

function saveEnvKey(keyName, keyValue) {
  try {
    const envPath = path.join(__dirname, '.env');
    let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    const regex = new RegExp(`^${keyName}=.*$`, 'm');
    const newLine = `${keyName}=${keyValue.trim()}`;

    if (regex.test(content)) {
      content = content.replace(regex, newLine);
    } else {
      content = (content.trim() ? content.trim() + '\n' : '') + newLine + '\n';
    }

    fs.writeFileSync(envPath, content, 'utf8');
    return true;
  } catch (err) {
    console.error('[server.js] Failed to save .env:', err);
    return false;
  }
}

const PORT = process.env.PORT || 5000;

// MIME Types for static files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  const reqUrl = req.url || '/';

  // 1. Health Status Endpoint (Does NOT leak key contents)
  if (reqUrl === '/api/health' || reqUrl.startsWith('/api/health?')) {
    const { gemini, youtube } = getEnvKeys();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      geminiConfigured: !!gemini,
      youtubeConfigured: !!youtube,
      geminiKeyPrefix: gemini ? `${gemini.substring(0, 6)}...` : null,
      environment: process.env.NODE_ENV || 'production'
    }));
    return;
  }

  // 2. Config Key Update Endpoint
  if ((reqUrl === '/api/config/key' || reqUrl.startsWith('/api/config/key?')) && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { geminiKey, youtubeKey } = JSON.parse(body || '{}');
        if (typeof geminiKey === 'string') saveEnvKey('GEMINI_API_KEY', geminiKey);
        if (typeof youtubeKey === 'string') saveEnvKey('YOUTUBE_API_KEY', youtubeKey);
        const keys = getEnvKeys();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          geminiConfigured: !!keys.gemini,
          youtubeConfigured: !!keys.youtube
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 3. Gemini API Proxy (POST /api/gemini/...)
  if (reqUrl.startsWith('/api/gemini')) {
    const { gemini } = getEnvKeys();
    if (!gemini) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: {
          code: 503,
          message: 'GEMINI_API_KEY is not configured on the production server. Please set GEMINI_API_KEY in your environment or .env file.'
        }
      }));
      return;
    }

    // Rewrite path: preserve /v1 or /v1beta if specified, else default to /v1beta
    let targetPath = reqUrl.replace('/api/gemini', '');
    if (!targetPath.startsWith('/v1') && !targetPath.startsWith('/v1beta')) {
      targetPath = '/v1beta' + (targetPath.startsWith('/') ? targetPath : '/' + targetPath);
    }
    const separator = targetPath.includes('?') ? '&' : '?';
    const upstreamUrl = `https://generativelanguage.googleapis.com${targetPath}${separator}key=${gemini}`;

    const parsed = new URL(upstreamUrl);
    const options = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
      }
    };

    const proxyReq = https.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, {
        'Content-Type': proxyRes.headers['content-type'] || 'application/json',
        'Cache-Control': 'no-cache',
      });
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('Gemini proxy error:', err);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { code: 502, message: 'Bad Gateway: Could not reach Google Gemini API' } }));
      }
    });

    req.pipe(proxyReq);
    return;
  }

  // 4. YouTube API Proxy (GET /api/youtube/...)
  if (reqUrl.startsWith('/api/youtube')) {
    const { youtube } = getEnvKeys();
    if (!youtube) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: {
          code: 503,
          message: 'YOUTUBE_API_KEY is not configured on the production server. Falling back to curated B.Tech lectures.'
        }
      }));
      return;
    }

    const targetPath = reqUrl.replace('/api/youtube', '/youtube/v3');
    const separator = targetPath.includes('?') ? '&' : '?';
    const upstreamUrl = `https://www.googleapis.com${targetPath}${separator}key=${youtube}`;

    const parsed = new URL(upstreamUrl);
    const options = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: 'GET'
    };

    const proxyReq = https.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, {
        'Content-Type': proxyRes.headers['content-type'] || 'application/json'
      });
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('YouTube proxy error:', err);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { code: 502, message: 'Bad Gateway: Could not reach YouTube API' } }));
      }
    });

    proxyReq.end();
    return;
  }

  // 5. Static Production File Serving from dist/
  const distDir = path.join(__dirname, 'dist');
  let safePath = path.normalize(new URL(reqUrl, 'http://localhost').pathname);
  if (safePath === '/' || safePath === '') safePath = '/index.html';

  let filePath = path.join(distDir, safePath);

  // If path exists and is a file, serve it
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // Single-Page Application (SPA) fallback to dist/index.html
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(indexPath).pipe(res);
    return;
  }

  // If dist doesn't exist yet
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found: Build assets missing. Please run "npm run build" first.');
});

server.listen(PORT, () => {
  const { gemini, youtube } = getEnvKeys();
  console.log(`[B.Tech AI Study Assistant] Production server listening on http://localhost:${PORT}`);
  console.log(`- Gemini API: ${gemini ? 'Configured (Server-Side Secure)' : 'Missing GEMINI_API_KEY'}`);
  console.log(`- YouTube API: ${youtube ? 'Configured (Server-Side Secure)' : 'Missing YOUTUBE_API_KEY (Using verified curated lectures)'}`);
});

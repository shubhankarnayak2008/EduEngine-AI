import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

/**
 * Dynamically reads API keys from .env on each request so changes
 * take effect immediately without needing to restart the Vite server.
 */
function getEnvKeys() {
  let gemini = '';
  let youtube = '';
  try {
    const envPath = path.resolve(process.cwd(), '.env');
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
    console.warn('[vite.config.js] Could not parse .env file:', err.message);
  }

  gemini = gemini || (process.env.GEMINI_API_KEY || '').trim();
  youtube = youtube || (process.env.YOUTUBE_API_KEY || '').trim();

  return { gemini, youtube };
}

/**
 * Persists an updated API key into .env file
 */
function saveEnvKey(keyName, keyValue) {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
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
    console.error('[vite.config.js] Failed to save .env:', err);
    return false;
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    emptyOutDir: true,
  },
  plugins: [
    react(),
    // Custom server-side middleware to manage endpoints & key security
    {
      name: 'api-security-interceptor',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';

          // Endpoint: GET /api/health - check server API key status
          if (url === '/api/health' || url.startsWith('/api/health?')) {
            const { gemini, youtube } = getEnvKeys();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              geminiConfigured: !!gemini,
              youtubeConfigured: !!youtube,
              geminiKeyPrefix: gemini ? `${gemini.substring(0, 6)}...` : null
            }));
            return;
          }

          // Endpoint: POST /api/config/key - securely update API key from UI
          if ((url === '/api/config/key' || url.startsWith('/api/config/key?')) && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const { geminiKey, youtubeKey } = JSON.parse(body || '{}');
                if (typeof geminiKey === 'string') {
                  saveEnvKey('GEMINI_API_KEY', geminiKey);
                }
                if (typeof youtubeKey === 'string') {
                  saveEnvKey('YOUTUBE_API_KEY', youtubeKey);
                }
                const updated = getEnvKeys();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  geminiConfigured: !!updated.gemini,
                  youtubeConfigured: !!updated.youtube
                }));
              } catch (err) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }

          // Check if Gemini request but key is missing on the server
          if (url.startsWith('/api/gemini')) {
            const { gemini } = getEnvKeys();
            if (!gemini) {
              res.statusCode = 503;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                error: {
                  code: 503,
                  message: 'GEMINI_API_KEY is not configured on the server. Please add your GEMINI_API_KEY to the .env file or configure it in the Gemini API modal.',
                  status: 'UNAVAILABLE'
                }
              }));
              return;
            }
          }

          // Check if YouTube request but key is missing on the server
          if (url.startsWith('/api/youtube')) {
            const { youtube } = getEnvKeys();
            if (!youtube) {
              res.statusCode = 503;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                error: {
                  code: 503,
                  message: 'YOUTUBE_API_KEY is not configured on the server. Using verified curated B.Tech lectures catalog.',
                  status: 'UNAVAILABLE'
                }
              }));
              return;
            }
          }

          next();
        });
      }
    }
  ],
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Proxy /api/gemini to Google Generative Language API
      // Dynamically attaches server-side GEMINI_API_KEY so it is NEVER exposed to the client
      '/api/gemini': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        secure: true,
        rewrite: (reqPath) => {
          const { gemini } = getEnvKeys();
          let geminiPath = reqPath.replace('/api/gemini', '');
          // If path doesn't specify /v1 or /v1beta, default to /v1beta
          if (!geminiPath.startsWith('/v1') && !geminiPath.startsWith('/v1beta')) {
            geminiPath = '/v1beta' + (geminiPath.startsWith('/') ? geminiPath : '/' + geminiPath);
          }
          const separator = geminiPath.includes('?') ? '&' : '?';
          return `${geminiPath}${separator}key=${gemini}`;
        },
      },
      // Proxy /api/youtube to Google YouTube Data API v3
      // Dynamically attaches server-side YOUTUBE_API_KEY so it is NEVER exposed to the client
      '/api/youtube': {
        target: 'https://www.googleapis.com',
        changeOrigin: true,
        secure: true,
        rewrite: (reqPath) => {
          const { youtube } = getEnvKeys();
          const ytPath = reqPath.replace('/api/youtube', '/youtube/v3');
          const separator = ytPath.includes('?') ? '&' : '?';
          return `${ytPath}${separator}key=${youtube}`;
        },
      },
    },
  },
});

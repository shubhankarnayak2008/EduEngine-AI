// Netlify Serverless Function: Proxies requests to Google Generative Language API
// Keeps GEMINI_API_KEY secure in Netlify Environment Variables
const https = require('https');

exports.handler = async function(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }

  const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          code: 503,
          message: 'GEMINI_API_KEY is not configured in Netlify Environment Variables.'
        }
      })
    };
  }

  // Parse path: /.netlify/functions/gemini/:splat or path after gemini
  let targetPath = event.path.replace(/^\/api\/gemini/, '').replace(/^\/\.netlify\/functions\/gemini/, '');
  if (!targetPath.startsWith('/v1') && !targetPath.startsWith('/v1beta')) {
    targetPath = '/v1beta' + (targetPath.startsWith('/') ? targetPath : '/' + targetPath);
  }

  const queryParams = event.queryStringParameters || {};
  queryParams['key'] = apiKey;
  const queryString = Object.keys(queryParams).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`).join('&');

  const upstreamUrl = `https://generativelanguage.googleapis.com${targetPath}?${queryString}`;

  return new Promise((resolve) => {
    const parsed = new URL(upstreamUrl);
    const req = https.request({
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: event.httpMethod,
      headers: {
        'Content-Type': event.headers['content-type'] || 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 200,
          headers: {
            'Content-Type': res.headers['content-type'] || 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: { message: err.message || 'Upstream gateway error' } })
      });
    });

    if (event.body) {
      req.write(event.body);
    }
    req.end();
  });
};

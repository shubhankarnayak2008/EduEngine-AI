// Netlify Serverless Function: Health Check
exports.handler = async function() {
  const gemini = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
  const youtube = (process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY || '').trim();

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      geminiConfigured: !!gemini,
      youtubeConfigured: !!youtube,
      geminiKeyPrefix: gemini ? `${gemini.substring(0, 6)}...` : null
    })
  };
};

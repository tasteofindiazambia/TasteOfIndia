// Simple test API to isolate the issue
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('Simple handler called:', req.method, req.url);
    
    return res.json({
      message: 'Simple API working',
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Simple API error:', error);
    return res.status(500).json({
      error: 'Simple API failed',
      details: error.message
    });
  }
}

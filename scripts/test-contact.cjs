// Simple contact POST test (CommonJS)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

(async () => {
  const base = process.env.API_URL || 'http://localhost:3001/api';
  const url = `${base}/contact`;
  const payload = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+260971234567',
    subject: 'private-event',
    message: 'Automated test message from script.'
  };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await res.json().catch(() => ({}));
    console.log('Status:', res.status);
    console.log('Response:', body);
  } catch (e) {
    console.error('Request failed:', e.message);
  }
})();

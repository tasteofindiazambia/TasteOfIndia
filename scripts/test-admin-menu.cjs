// Admin menu E2E test
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const base = process.env.API_URL || 'http://localhost:3001/api';
  const headers = { 'Content-Type': 'application/json' };
  const fetchJson = async (url, opts={}) => {
    const res = await fetch(url, opts);
    const body = await res.json().catch(()=>({}));
    return { status: res.status, body };
  };
  // 1) Login
  let r = await fetchJson(`${base}/auth/login`, { method: 'POST', headers, body: JSON.stringify({ username: 'admin', password: 'admin123' }) });
  console.log('login:', r.status, r.body && r.body.success);
  const token = r.body && r.body.token; if (!token) { console.log('no token'); process.exit(1); }
  const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  // 2) Create item (restaurant 1)
  const payload = { name: 'Test Admin Item', description: 'E2E created', price: 123, category_id: 1, restaurant_id: 1, available: true, dynamic_pricing: false, packaging_price: 2.5, listing_preference: 'mid', pieces_count: 1, preparation_time: 10 };
  r = await fetchJson(`${base}/admin/menu`, { method: 'POST', headers: auth, body: JSON.stringify(payload) });
  console.log('create:', r.status, r.body && r.body.id);
  const id = r.body && r.body.id; if (!id) { console.log('no id from create'); process.exit(1); }
  // 3) Update fields
  const upd = { price: 129, packaging_price: 3.5, dynamic_pricing: true, listing_preference: 'high' };
  r = await fetchJson(`${base}/admin/menu/${id}`, { method: 'PUT', headers: auth, body: JSON.stringify(upd) });
  console.log('update:', r.status, r.body && r.body.price, r.body && r.body.packaging_price, r.body && r.body.dynamic_pricing, r.body && r.body.listing_preference);
  // 4) Toggle availability off
  r = await fetchJson(`${base}/admin/menu/${id}`, { method: 'PUT', headers: auth, body: JSON.stringify({ available: false }) });
  console.log('toggle off:', r.status, r.body && r.body.available);
  // 5) Verify not returned in GET menu list
  r = await fetchJson(`${base}/menu/1`);
  const presentWhenOff = Array.isArray(r.body) && r.body.some(it => it.id === id);
  console.log('present_when_off:', presentWhenOff);
  // 6) Toggle on
  r = await fetchJson(`${base}/admin/menu/${id}`, { method: 'PUT', headers: auth, body: JSON.stringify({ available: true }) });
  console.log('toggle on:', r.status, r.body && r.body.available);
  // 7) Verify appears in GET
  r = await fetchJson(`${base}/menu/1`);
  const presentWhenOn = Array.isArray(r.body) && r.body.some(it => it.id === id);
  console.log('present_when_on:', presentWhenOn);
})();

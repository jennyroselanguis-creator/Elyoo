/**
 * Run: node scripts/verify-supabase.mjs
 * Checks Supabase tables, RPCs, and optional admin login.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) return {};
  const text = readFileSync(envPath, 'utf8');
  const out = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) out[m[1].trim()] = m[2].trim();
  }
  return out;
}

function loadJsonConfig() {
  for (const p of ['public/supabase.connection.json', 'supabase.connection.json']) {
    const full = resolve(root, p);
    if (existsSync(full)) {
      return JSON.parse(readFileSync(full, 'utf8'));
    }
  }
  return null;
}

const env = loadEnv();
const json = loadJsonConfig();
const url = env.REACT_APP_SUPABASE_URL || json?.url || '';
const anonKey = env.REACT_APP_SUPABASE_ANON_KEY || json?.anonKey || '';

const results = [];

function pass(label) {
  results.push({ ok: true, label });
  console.log(`  OK  ${label}`);
}
function fail(label, detail) {
  results.push({ ok: false, label, detail });
  console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`);
}

if (!url || !anonKey) {
  console.error('Missing Supabase URL/key in .env or supabase.connection.json');
  process.exit(1);
}

const supabase = createClient(url, anonKey);
console.log(`\nElyoo Supabase verify → ${url}\n`);

async function checkTable(name, select = 'id') {
  const { data, error } = await supabase.from(name).select(select).limit(3);
  if (error) return fail(`Table: ${name}`, error.message);
  pass(`Table: ${name} (${data?.length ?? 0} sample row(s))`);
  return data;
}

async function checkRpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) return fail(`RPC: ${name}`, error.message);
  pass(`RPC: ${name}`);
  return data;
}

await checkTable('brands');
await checkTable('products', 'id, name, price');
await checkTable('orders', 'id, order_number, status');
await checkTable('profiles', 'id, email, role');
await checkTable('newsletter_subscribers', 'id, email');

const track = await supabase.rpc('track_order', {
  p_order_number: 'ELY-NONE',
  p_email: 'none@elyoo.com',
});
if (track.error && /function|does not exist/i.test(track.error.message)) {
  fail('RPC: track_order', track.error.message);
} else {
  pass('RPC: track_order');
}

const secure = await supabase.rpc('place_secure_order', {
  p_customer_name: 'Test',
  p_customer_email: 'test@example.com',
  p_customer_phone: '09171234567',
  p_customer_address: 'Test St, Manila',
  p_items: [],
});
if (secure.error && /function|does not exist/i.test(secure.error.message)) {
  fail('RPC: place_secure_order', secure.error.message);
} else {
  pass('RPC: place_secure_order (reachable)');
}

const adminRpc = await supabase.rpc('admin_create_product', {
  p_brand_id: 1,
  p_name: 'x',
  p_model: '',
  p_description: '',
  p_price: 10000,
  p_stock: 1,
  p_image: '/images/iphone/iphone15.jpg',
  p_featured: false,
});
if (adminRpc.error && /function|does not exist/i.test(adminRpc.error.message)) {
  fail('RPC: admin_create_product', adminRpc.error.message);
} else if (adminRpc.error && /not signed in|administrator/i.test(adminRpc.error.message)) {
  pass('RPC: admin_create_product (exists; needs admin JWT)');
} else if (adminRpc.error) {
  fail('RPC: admin_create_product', adminRpc.error.message);
} else {
  pass('RPC: admin_create_product');
}

const adminEmail = 'jireh@elyoo.com';
const adminPass = 'faith';
const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
  email: adminEmail,
  password: adminPass,
});
if (authErr) {
  fail('Auth: jireh@elyoo.com', authErr.message);
} else {
  pass(`Auth: ${adminEmail} signed in`);
  const { data: prof, error: profErr } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', authData.user.id)
    .single();
  if (profErr) fail('Profile read after login', profErr.message);
  else pass(`Profile role: ${prof?.role || 'unknown'}`);

  const testName = `Verify ${Date.now()}`;
  const { data: created, error: createErr } = await supabase.rpc('admin_create_product', {
    p_brand_id: 1,
    p_name: testName,
    p_model: 'Test',
    p_description: 'Auto verify script',
    p_price: 10000,
    p_stock: 1,
    p_image: '/images/iphone/iphone15.jpg',
    p_featured: false,
  });
  if (createErr) fail('Admin create product (authenticated)', createErr.message);
  else {
    const row = Array.isArray(created) ? created[0] : created;
    pass(`Admin create product → id ${row?.id}`);
    if (row?.id) {
      await supabase.from('products').delete().eq('id', row.id);
      pass('Cleaned up test product');
    }
  }
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.\n`);
process.exit(failed.length ? 1 : 0);

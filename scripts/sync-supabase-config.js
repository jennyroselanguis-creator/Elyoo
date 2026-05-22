/**
 * Syncs supabase.connection.json → .env + public/supabase.connection.json
 * Run automatically before npm start
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const configPath = path.join(root, 'supabase.connection.json');
const publicPath = path.join(root, 'public', 'supabase.connection.json');
const envPath = path.join(root, '.env');

function readConfig() {
  if (!fs.existsSync(configPath)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const url = data.url || data.supabaseUrl || data.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey =
      data.anonKey ||
      data.anon_key ||
      data.publishableKey ||
      data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !anonKey) return null;
    if (!url.includes('supabase.co')) return null;
    return { url: url.replace(/\/$/, ''), anonKey };
  } catch {
    return null;
  }
}

function updateEnv(cfg) {
  let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const setLine = (key, value) => {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, 'm');
    env = re.test(env) ? env.replace(re, line) : `${env.trim()}\n${line}\n`;
  };
  setLine('REACT_APP_SUPABASE_URL', cfg.url);
  setLine('REACT_APP_SUPABASE_ANON_KEY', cfg.anonKey);
  setLine('SUPABASE_URL', cfg.url);
  setLine('SUPABASE_ANON_KEY', cfg.anonKey);
  fs.writeFileSync(envPath, env.trim() + '\n');
}

function main() {
  const cfg = readConfig();
  if (!cfg) {
    console.log('[supabase] No supabase.connection.json — using local demo mode.');
    return;
  }

  fs.mkdirSync(path.join(root, 'public'), { recursive: true });
  fs.writeFileSync(
    publicPath,
    JSON.stringify({ url: cfg.url, anonKey: cfg.anonKey }, null, 2)
  );
  updateEnv(cfg);
  console.log('[supabase] Connected config synced from supabase.connection.json');
  console.log(`[supabase] Project: ${cfg.url}`);
}

main();

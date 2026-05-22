import { createClient } from '@supabase/supabase-js';

let supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
let supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
let supabaseClient = null;
let connectionSource = null;

/** Set during app bootstrap after verifySupabaseConnection() */
let connectionHealth = {
  configured: false,
  verified: false,
  error: null,
  source: null,
};

export function setConnectionHealth(patch) {
  connectionHealth = { ...connectionHealth, ...patch };
}

export function getConnectionHealth() {
  return { ...connectionHealth };
}

function isValidKey(key) {
  if (!key || typeof key !== 'string') return false;
  if (key === 'your-anon-key-here') return false;
  // Legacy JWT anon key or new publishable key (sb_publishable_...)
  return key.startsWith('eyJ') || key.startsWith('sb_publishable_') || key.length > 30;
}

function isValidConfig(url, key) {
  return Boolean(
    url &&
      key &&
      typeof url === 'string' &&
      url.includes('supabase.co') &&
      !url.includes('YOUR_PROJECT') &&
      isValidKey(key)
  );
}

export function isSupabaseConfigured() {
  return isValidConfig(supabaseUrl, supabaseAnonKey);
}

export function getSupabaseConnectionSource() {
  return connectionSource;
}

function applyConfig(url, key, source) {
  if (!isValidConfig(url, key)) return false;
  supabaseUrl = url.replace(/\/$/, '');
  supabaseAnonKey = key;
  connectionSource = source;
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return true;
}

function requireClient() {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase is not connected. Add supabase.connection.json or .env keys.');
  }
  return client;
}

export function getSupabase() {
  if (supabaseClient) return supabaseClient;
  if (isSupabaseConfigured()) {
    return applyConfig(supabaseUrl, supabaseAnonKey, connectionSource || 'env')
      ? supabaseClient
      : null;
  }
  return null;
}

/** Try .env, then /supabase.connection.json — call once before app data loads */
export async function initSupabaseConnection() {
  if (isSupabaseConfigured()) {
    getSupabase();
    return { connected: true, source: connectionSource || 'env' };
  }

  const paths = ['/supabase.connection.json', '/supabase.connection.example.json'];

  for (const path of paths) {
    try {
      const res = await fetch(`${process.env.PUBLIC_URL || ''}${path}`, {
        cache: 'no-store',
      });
      if (!res.ok) continue;
      const data = await res.json();
      const url =
        data.url ||
        data.supabaseUrl ||
        data.SUPABASE_URL ||
        data.NEXT_PUBLIC_SUPABASE_URL;
      const key =
        data.anonKey ||
        data.anon_key ||
        data.SUPABASE_ANON_KEY ||
        data.publishableKey ||
        data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (applyConfig(url, key, 'file')) {
        return { connected: true, source: 'file' };
      }
    } catch {
      /* try next */
    }
  }

  return { connected: false, source: null };
}

/** Test live connection to Supabase */
export async function verifySupabaseConnection() {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'Not configured' };
  try {
    const { error } = await client.from('brands').select('id').limit(1);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

if (isValidConfig(supabaseUrl, supabaseAnonKey)) {
  applyConfig(supabaseUrl, supabaseAnonKey, 'env');
}

/** Backward-compatible export for dataService */
export const supabase = {
  get auth() {
    return requireClient().auth;
  },
  from(table) {
    return requireClient().from(table);
  },
  rpc(fn, args, opts) {
    return requireClient().rpc(fn, args, opts);
  },
  get storage() {
    return requireClient().storage;
  },
};

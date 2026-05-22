const TOKEN_KEY = 'authToken';

/** Store auth token in sessionStorage (cleared when browser closes) */
export function setAuthToken(token) {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthToken() {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function clearAuthToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

/** Team login without Supabase JWT (local-demo-token / local-staff-token-*) */
export function isLocalTeamSession() {
  const t = getAuthToken();
  return t === 'local-demo-token' || (typeof t === 'string' && t.startsWith('local-staff-token-'));
}

export function isCatalogPolicyError(err) {
  const msg = String(err?.message || err?.details || err || '').toLowerCase();
  const code = String(err?.code || '');
  return (
    isProfilesRlsRecursionError(err) ||
    code === '42501' ||
    msg.includes('row-level security') ||
    msg.includes('permission denied') ||
    msg.includes('policy')
  );
}

/** Escape text for safe display (XSS mitigation) */
export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Generic message — avoids leaking whether email/order exists */
export const SECURE_MESSAGES = {
  TRACK_NOT_FOUND: 'No order found. Verify your order number and email, then try again.',
  LOGIN_FAILED: 'Invalid email or password.',
  ORDER_FAILED: 'Unable to place order. Please check your details and try again.',
  DATABASE_SETUP:
    'Supabase database is not set up yet. Open Supabase → SQL Editor, run supabase/schema.sql, then run supabase/secure_checkout.sql.',
};

export function isSupabaseSchemaError(err) {
  const msg = String(err?.message || err?.details || err || '').toLowerCase();
  return (
    msg.includes('could not find the table') ||
    msg.includes('schema cache') ||
    (msg.includes('relation') && msg.includes('does not exist'))
  );
}

export function isProfilesRlsRecursionError(err) {
  const msg = String(err?.message || err?.details || err || '').toLowerCase();
  return msg.includes('infinite recursion') && msg.includes('profiles');
}

export function formatSupabaseError(err) {
  const msg = String(err?.message || err || '');
  if (isProfilesRlsRecursionError(err)) {
    return 'Database policy error. In Supabase SQL Editor, run supabase/fix_profiles_rls.sql, then try again.';
  }
  if (isSupabaseSchemaError(err)) {
    return SECURE_MESSAGES.DATABASE_SETUP;
  }
  if (msg.includes('invalid input syntax for type bigint') && msg.includes('local-prod')) {
    return 'This product was saved on this device only. Delete it again — it will not touch Supabase.';
  }
  return msg || 'Something went wrong';
}

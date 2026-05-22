import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { findTeamByUsername, TEAM_ACCOUNTS } from '../config/teamAccounts';
import { isLocalTeamSession, setAuthToken } from './security';

const DEFAULT_PRODUCT_IMAGE = '/images/iphone/iphone15.jpg';
const PRODUCT_IMAGE_BUCKET = 'product-images';

export const DEPLOY_AUTH_HELP =
  'Sign out, then sign in again. In Supabase: Authentication → Users → add jireh@elyoo.com (password: faith), run supabase/fix_profiles_rls.sql, then supabase/TEAM_USERS.sql.';

export function isSupabaseAccessToken(token) {
  return (
    typeof token === 'string' &&
    token.length > 40 &&
    !token.startsWith('local-') &&
    token !== 'local-demo-token'
  );
}

export function resolveTeamRoleByEmail(email) {
  const mail = String(email || '').trim().toLowerCase();
  const account = TEAM_ACCOUNTS.find((a) => a.email.toLowerCase() === mail);
  if (account?.role) return account.role;
  // Dynamic staff: any @elyoo.com email is treated as staff when Supabase is active
  if (isSupabaseConfigured() && mail.endsWith('@elyoo.com') && mail !== '') {
    return 'staff';
  }
  return null;
}

/** Ensures admin actions use a real Supabase JWT (required for cloud catalog). */
export async function requireSupabaseAdminSession() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
  }

  if (isLocalTeamSession()) {
    throw new Error(
      `You are in local demo mode — products will not save to Supabase. ${DEPLOY_AUTH_HELP}`
    );
  }

  const client = getSupabase();
  const { data, error } = await client.auth.getSession();
  if (error) throw new Error(error.message || 'Could not read Supabase session');

  if (!data.session?.access_token) {
    throw new Error(`Not signed in to Supabase. ${DEPLOY_AUTH_HELP}`);
  }

  setAuthToken(data.session.access_token);
  return data.session;
}

/** Sync profile role in DB (SECURITY DEFINER RPC). */
export async function ensureTeamProfileInCloud(team, userId) {
  if (!team || !userId) return;
  const client = getSupabase();
  const { error } = await client.rpc('ensure_team_profile', {
    p_role: team.role,
    p_full_name: team.full_name,
    p_email: team.email,
  });
  if (error) {
    const { error: upsertErr } = await client.from('profiles').upsert(
      {
        id: userId,
        email: team.email,
        full_name: team.full_name,
        role: team.role,
      },
      { onConflict: 'id' }
    );
    if (upsertErr) console.warn('[Supabase] profile sync:', upsertErr.message);
  }
}

/** Upload base64 product photo to Supabase Storage (public bucket). */
export async function uploadProductImageToStorage(dataUrl, productId) {
  if (!dataUrl?.startsWith('data:') || !productId) return null;

  const client = getSupabase();
  const mime = dataUrl.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
  const base64 = dataUrl.split(',')[1];
  if (!base64) return null;

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

  const path = `products/${productId}.${ext}`;
  const { error } = await client.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, bytes, {
    contentType: mime,
    upsert: true,
  });

  if (error) {
    console.warn('[Supabase] image upload:', error.message);
    return null;
  }

  const { data } = client.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

/** Image value safe for products.image column (no multi-MB data URLs). */
export async function resolveCloudProductImage(image, productId = null) {
  const trimmed = String(image || '').trim();
  if (!trimmed) return DEFAULT_PRODUCT_IMAGE;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (!trimmed.startsWith('data:')) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }
  if (productId) {
    const url = await uploadProductImageToStorage(trimmed, productId);
    if (url) return url;
  }
  return DEFAULT_PRODUCT_IMAGE;
}

export function teamRoleForUser(user, profile) {
  if (profile?.role && profile.role !== 'customer') return profile.role;
  const fromEmail = resolveTeamRoleByEmail(user?.email);
  if (fromEmail) return fromEmail;
  const fromUsername = findTeamByUsername(user?.user_metadata?.username);
  if (fromUsername?.role) return fromUsername.role;
  // Dynamic staff: if user email matches @elyoo.com pattern
  const userEmail = String(user?.email || '').toLowerCase();
  if (isSupabaseConfigured() && userEmail.endsWith('@elyoo.com')) {
    return 'staff';
  }
  return profile?.role || 'customer';
}

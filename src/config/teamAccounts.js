/** Store team logins — username + password (email used only for Supabase Auth) */
import { isSupabaseConfigured } from '../lib/supabase';

export const TEAM_ACCOUNTS = [
  {
    username: 'jireh',
    email: 'jireh@elyoo.com',
    password: 'faith',
    role: 'admin',
    full_name: 'Jireh',
  },
];

const USERNAME_REGEX = /^[a-z][a-z0-9._-]{2,31}$/;
const LOCAL_STAFF_KEY = 'elyoo-staff-accounts';

/** Look up local staff accounts stored in localStorage */
function loadLocalStaffList() {
  try {
    const saved = localStorage.getItem(LOCAL_STAFF_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [];
}

/** Find a matching local staff account by username (email prefix) or email */
function findLocalStaffByUsername(username) {
  const u = String(username || '').trim().toLowerCase();
  if (!u) return null;
  const locals = loadLocalStaffList();
  return locals.find((a) => {
    const localUsername = (a.email || '').split('@')[0].toLowerCase();
    return localUsername === u || (a.username && a.username.toLowerCase() === u);
  }) || null;
}

export function findTeamByUsername(username) {
  const u = String(username || '').trim().toLowerCase();
  if (!u) return null;

  // 1. Check hardcoded team accounts first (e.g. admin jireh)
  const hardcoded = TEAM_ACCOUNTS.find((a) => a.username.toLowerCase() === u);
  if (hardcoded) return hardcoded;

  // 2. Check local staff accounts in localStorage
  const localStaff = findLocalStaffByUsername(u);
  if (localStaff) {
    return {
      username: u,
      email: localStaff.email || `${u}@elyoo.com`,
      role: 'staff',
      full_name: localStaff.full_name || u,
    };
  }

  // 3. If Supabase is configured, allow any valid username as dynamic staff
  if (isSupabaseConfigured() && USERNAME_REGEX.test(u)) {
    return {
      username: u,
      email: `${u}@elyoo.com`,
      role: 'staff',
      full_name: u.charAt(0).toUpperCase() + u.slice(1),
    };
  }

  return null;
}

/** Supabase Auth still requires an email — mapped from username */
export function authEmailForUsername(username) {
  const account = findTeamByUsername(username);
  if (account?.email) return account.email;
  // Fallback: derive email from username
  const u = String(username || '').trim().toLowerCase();
  return u ? `${u}@elyoo.com` : '';
}

export function findTeamAccount(username, password) {
  const account = findTeamByUsername(username);
  const pwd = String(password || '');
  if (!account || account.password !== pwd) return null;
  return account;
}

export function validateTeamUsername(username) {
  const u = String(username || '').trim().toLowerCase();
  if (!u) return { valid: false, error: 'Username is required' };
  if (!USERNAME_REGEX.test(u)) {
    return { valid: false, error: 'Use letters, numbers, dots or dashes (min. 3 characters)' };
  }
  const account = findTeamByUsername(u);
  if (!account) {
    return { valid: false, error: 'Unknown username' };
  }
  return { valid: true, value: u, account };
}

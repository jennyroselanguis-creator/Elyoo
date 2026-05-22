import React from 'react';
import { useStore } from '../store/store';
import { isLocalTeamSession } from '../utils/security';

export default function AdminDbStatus() {
  const { supabaseConnected, supabaseSource } = useStore();
  const localOnly = isLocalTeamSession();

  if (localOnly) {
    return (
      <div className="admin-alert admin-alert--warn" role="status">
        <strong>Local demo login</strong> — catalog and orders are not saving to Supabase. Sign out,
        then sign in as <code>jireh</code> / <code>faith</code> after creating{' '}
        <code>jireh@elyoo.com</code> in Supabase Authentication → Users.
      </div>
    );
  }

  if (!supabaseConnected) {
    return (
      <div className="admin-alert admin-alert--warn" role="status">
        <strong>Supabase not verified</strong> — check <code>.env</code> or{' '}
        <code>public/supabase.connection.json</code>. Run <code>node scripts/verify-supabase.mjs</code>.
      </div>
    );
  }

  return (
    <div className="admin-alert admin-alert--ok" role="status">
      <strong>Supabase connected</strong>
      {supabaseSource ? ` (${supabaseSource})` : ''} — products and orders sync to the cloud when you
      are signed in with a team account.
    </div>
  );
}

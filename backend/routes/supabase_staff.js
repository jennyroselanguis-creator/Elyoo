const express = require('express');
const router = express.Router();

// Create Supabase auth user + profile using service role key
router.post('/staff', async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const SUPABASE_URL = process.env.SUPABASE_URL || '';
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return res.status(500).json({ error: 'Supabase service role key not configured on server' });
    }

    const adminUrl = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users`;
    const profileUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/profiles`;

    // Supabase requires min 6-char passwords — pad short ones the same way the frontend does
    const supabasePassword = password.length < 6 ? password.padEnd(6, '0') : password;

    // Create user via admin API (email_confirm: true skips email verification)
    const userResp = await fetch(adminUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({
        email,
        password: supabasePassword,
        email_confirm: true,
        user_metadata: { 
          full_name: full_name || 'Staff Member',
          role: 'staff'
        },
      }),
    });

    const userJson = await userResp.json();
    let userId = userJson.id;

    // If user already exists, fetch their ID and update their password
    if (!userResp.ok) {
      const errMsg = String(userJson?.message || userJson?.error || '').toLowerCase();
      if (errMsg.includes('already registered') || errMsg.includes('already exists')) {
        // Look up existing user by email
        const listResp = await fetch(
          `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
          {
            headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
          }
        );
        const listJson = await listResp.json();
        const existingUser = listJson?.users?.[0] || listJson?.[0];
        if (existingUser?.id) {
          userId = existingUser.id;
          // Update password on the existing user
          await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              apikey: SERVICE_KEY,
              Authorization: `Bearer ${SERVICE_KEY}`,
            },
            body: JSON.stringify({ password: supabasePassword, email_confirm: true }),
          });
        } else {
          return res.status(400).json({ error: 'User already registered' });
        }
      } else {
        return res.status(400).json({ error: userJson?.message || 'Failed to create Supabase user' });
      }
    }

    if (!userId) {
      return res.status(500).json({ error: 'User created but ID missing' });
    }

    // Upsert profile — always set role='staff'
    const profileResp = await fetch(profileUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({ id: userId, email, full_name: full_name || 'Staff Member', role: 'staff' }),
    });
    let profileJson = await profileResp.json();

    // Explicitly update profile via PATCH using service key to override the trigger-enforced default role
    const patchResp = await fetch(`${profileUrl}?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ role: 'staff', full_name: full_name || 'Staff Member', email }),
    });
    if (patchResp.ok) {
      const patchJson = await patchResp.json();
      if (patchJson && patchJson.length > 0) {
        profileJson = patchJson[0];
      }
    }

    return res.json({
      success: true,
      user: { id: userId, email, full_name: full_name || 'Staff Member' },
      profile: Array.isArray(profileJson) ? profileJson[0] : profileJson,
    });
  } catch (err) {
    next(err);
  }
});

// Reset staff password
router.post('/staff/reset', async (req, res, next) => {
  try {
    const { username, new_password } = req.body || {};
    if (!username || !new_password) return res.status(400).json({ error: 'Missing username or new_password' });

    const SUPABASE_URL = process.env.SUPABASE_URL || '';
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return res.status(500).json({ error: 'Supabase service role key not configured on server' });
    }

    const email = username.includes('@') ? username : `${username}@elyoo.com`;
    const supabasePassword = new_password.length < 6 ? new_password.padEnd(6, '0') : new_password;

    // Find user by email
    const listResp = await fetch(
      `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
      {
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
      }
    );
    const listJson = await listResp.json();
    const user = listJson?.users?.[0] || listJson?.[0];
    if (!user?.id) return res.status(404).json({ error: 'User not found' });

    const updateResp = await fetch(
      `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users/${user.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ password: supabasePassword }),
      }
    );
    if (!updateResp.ok) {
      const body = await updateResp.json();
      return res.status(400).json({ error: body?.message || 'Failed to reset password' });
    }
    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Get all orders (admin-only server-side endpoint using service role key)
router.get('/orders', async (req, res, next) => {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL || '';
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return res.status(500).json({ error: 'Supabase service role key not configured on server' });
    }

    const status = req.query.status ? String(req.query.status) : null;
    let url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/orders?select=*&order=created_at.desc`;
    if (status) url += `&status=eq.${encodeURIComponent(status)}`;

    const resp = await fetch(url, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const body = await resp.text();
    const http = resp.status;
    if (!resp.ok) return res.status(http).json({ error: 'Supabase request failed', body });

    const data = JSON.parse(body || '[]');
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;


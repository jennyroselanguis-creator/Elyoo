const { createClient } = require('@supabase/supabase-js');

const url = 'https://chtihwnijsbpbnuovgbo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodGlod25panNicGJudW92Z2JvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM2OTA5NywiZXhwIjoyMDk0OTQ1MDk3fQ.GkKkVegF47wOxHjsQb91xUrIQOK4CERBMUlteY28m3k';
const anonKey = 'sb_publishable_NPNf-dpt7gxo_JcIyHNVgw_M2Mk-iiJ';

const adminClient = createClient(url, serviceRoleKey);
const client = createClient(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function run() {
  const userId = '09ef0da4-ddba-46b2-a74f-13639ea18dfb'; // staff1@elyoo.com ID
  console.log('Resetting staff1 password to 212121...');
  const { error: resetErr } = await adminClient.auth.admin.updateUserById(userId, {
    password: '212121'
  });
  if (resetErr) {
    console.error('Password reset failed:', resetErr.message);
    return;
  }
  console.log('Password reset successful.');

  console.log('Logging in as staff1@elyoo.com...');
  const { data: authData, error: loginErr } = await client.auth.signInWithPassword({
    email: 'staff1@elyoo.com',
    password: '212121'
  });
  if (loginErr) {
    console.error('Login failed:', loginErr.message);
    return;
  }
  console.log('Login successful! Testing profile synchronization...');

  // Mock team object
  const team = {
    username: 'staff1',
    email: 'staff1@elyoo.com',
    role: 'staff',
    full_name: 'Staff1'
  };

  console.log('Calling client-side RPC to sync profile...');
  const { error: rpcErr } = await client.rpc('ensure_team_profile', {
    p_role: team.role,
    p_full_name: team.full_name,
    p_email: team.email
  });

  if (rpcErr) {
    console.error('RPC ensure_team_profile failed:', rpcErr.message);
  } else {
    console.log('RPC ensure_team_profile succeeded!');
  }

  console.log('Fetching profile from database again...');
  const { data: profile, error: profErr } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profErr) {
    console.error('Error fetching updated profile:', profErr.message);
  } else {
    console.log('Updated profile:', profile);
  }
}

run();

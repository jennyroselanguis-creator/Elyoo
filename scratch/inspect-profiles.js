const { createClient } = require('@supabase/supabase-js');

const url = 'https://chtihwnijsbpbnuovgbo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodGlod25panNicGJudW92Z2JvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM2OTA5NywiZXhwIjoyMDk0OTQ1MDk3fQ.GkKkVegF47wOxHjsQb91xUrIQOK4CERBMUlteY28m3k';

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function run() {
  console.log('Fetching all profiles from database...');
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
  if (pError) {
    console.error('Error fetching profiles:', pError);
  } else {
    console.log('Profiles:');
    console.table(profiles);
  }

  console.log('\nFetching auth users (using admin auth API)...');
  const { data: { users }, error: uError } = await supabase.auth.admin.listUsers();
  if (uError) {
    console.error('Error fetching auth users:', uError);
  } else {
    console.log('Auth Users:');
    const simplifiedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      last_sign_in_at: u.last_sign_in_at,
      created_at: u.created_at
    }));
    console.table(simplifiedUsers);
  }
}

run();

const { createClient } = require('@supabase/supabase-js');

const url = 'https://chtihwnijsbpbnuovgbo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodGlod25panNicGJudW92Z2JvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM2OTA5NywiZXhwIjoyMDk0OTQ1MDk3fQ.GkKkVegF47wOxHjsQb91xUrIQOK4CERBMUlteY28m3k';

const supabase = createClient(url, serviceRoleKey);

async function run() {
  console.log('Fetching auth users...');
  const { data: { users }, error: uError } = await supabase.auth.admin.listUsers();
  if (uError) {
    console.error('Error fetching users:', uError);
    return;
  }

  for (const user of users) {
    console.log(`Checking user: ${user.email} (Confirmed: ${!!user.email_confirmed_at})`);
    if (!user.email_confirmed_at) {
      console.log(`Confirming email for user ${user.email}...`);
      const { data, error } = await supabase.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
      );
      if (error) {
        console.error(`Failed to confirm email for ${user.email}:`, error.message);
      } else {
        console.log(`Confirmed email for ${user.email} successfully!`);
      }
    }
  }
}

run();

const { createClient } = require('@supabase/supabase-js');

const url = 'https://chtihwnijsbpbnuovgbo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodGlod25panNicGJudW92Z2JvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM2OTA5NywiZXhwIjoyMDk0OTQ1MDk3fQ.GkKkVegF47wOxHjsQb91xUrIQOK4CERBMUlteY28m3k';

const supabase = createClient(url, serviceRoleKey);

async function run() {
  console.log('Fetching policies on orders table...');
  // We can query pg_policies since we are service_role (superuser bypass)
  const { data, error } = await supabase.rpc('get_policies_debug');
  if (error) {
    // If RPC doesn't exist, we can use a direct SQL execution if possible, or try checking via an RPC we can create or look up.
    console.error('Error fetching policies via RPC:', error);
    
    // Let's check if we can run raw SQL. In Supabase, direct SQL query via API is not directly exposed unless we have an RPC like exec_sql.
    // Let's check what functions/RPC are available in pg_proc.
    console.log('Checking available RPC functions...');
    const { data: functions, error: funcError } = await supabase.from('pg_proc').select('proname').limit(5);
    console.log('pg_proc query result:', { functions, funcError });
  } else {
    console.log('Policies:', data);
  }
}

run();

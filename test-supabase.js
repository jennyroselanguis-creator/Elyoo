const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://chtihwnijsbpbnuovgbo.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodGlod25panNicGJudW92Z2JvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM2OTA5NywiZXhwIjoyMDk0OTQ1MDk3fQ.GkKkVegF47wOxHjsQb91xUrIQOK4CERBMUlteY28m3k";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function run() {
  const { data, error, count } = await supabase
    .from('orders')
    .select('*', { count: 'exact' });

  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Total orders in Supabase:", count || data.length);
    console.log("Data length:", data.length);
  }
}

run();

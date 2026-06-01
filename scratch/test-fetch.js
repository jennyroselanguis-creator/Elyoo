const SUPABASE_URL = "https://chtihwnijsbpbnuovgbo.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodGlod25panNicGJudW92Z2JvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM2OTA5NywiZXhwIjoyMDk0OTQ1MDk3fQ.GkKkVegF47wOxHjsQb91xUrIQOK4CERBMUlteY28m3k";

async function run() {
  const url = `${SUPABASE_URL}/rest/v1/orders?select=*`;
  const resp = await globalThis.fetch(url, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  console.log("Status:", resp.status);
  const data = await resp.json();
  console.log("Total orders in Supabase:", data.length);
  if (Array.isArray(data)) {
    console.log("First 5 orders:", data.slice(0, 5).map(o => ({ id: o.id, number: o.order_number, email: o.customer_email })));
  } else {
    console.log("Response:", data);
  }
}

run().catch(console.error);

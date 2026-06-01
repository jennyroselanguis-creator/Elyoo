const { createClient } = require('@supabase/supabase-js');

const url = 'https://chtihwnijsbpbnuovgbo.supabase.co';
const anonKey = 'sb_publishable_NPNf-dpt7gxo_JcIyHNVgw_M2Mk-iiJ';

console.log('Connecting with anon key to:', url);
const supabase = createClient(url, anonKey);

async function run() {
  console.log('Testing RPC track_order connection...');
  const { data, error } = await supabase.rpc('track_order', {
    p_order_number: 'ELY-1234567890',
    p_email: 'jireh@elyoo.com'
  });

  if (error) {
    console.error('Error returned from track_order:', error);
  } else {
    console.log('Connection successful! Returned data:', data);
  }
}

run();

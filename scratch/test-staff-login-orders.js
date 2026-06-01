const { createClient } = require('@supabase/supabase-js');

const url = 'https://chtihwnijsbpbnuovgbo.supabase.co';
const anonKey = 'sb_publishable_NPNf-dpt7gxo_JcIyHNVgw_M2Mk-iiJ';

const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function run() {
  const email = 'jai@elyoo.com';
  // Note: in signIn, passwords under 6 characters are padded with '0' up to 6 characters.
  // '212121' is 6 characters, so it shouldn't need padding, but let's be sure.
  const password = '212121';

  console.log(`Signing in as ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) {
    console.error('Login failed:', authError.message);
    return;
  }

  console.log('Login successful! User ID:', authData.user.id);
  console.log('Fetching user profile...');
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError.message);
  } else {
    console.log('User profile role:', profile?.role, profile);
  }

  console.log('\nFetching orders...');
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: true });

  if (ordersError) {
    console.error('Error fetching orders:', ordersError.message);
  } else {
    console.log(`Orders fetched successfully! Count: ${orders ? orders.length : 0}`);
    if (orders && orders.length > 0) {
      console.log('First 3 orders:');
      console.log(orders.slice(0, 3).map(o => ({
        id: o.id,
        order_number: o.order_number,
        customer_name: o.customer_name,
        created_at: o.created_at,
        status: o.status
      })));
    } else {
      console.log('No orders returned. Orders array:', orders);
    }
  }
}

run();

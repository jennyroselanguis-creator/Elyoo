# Supabase Setup for Elyoo Mobile Devices

## 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. **New project** → choose a name and database password
3. Wait for the project to finish provisioning

## 2. Run the database schema

1. Open **SQL Editor** in your Supabase dashboard
2. Copy all contents from `supabase/schema.sql`
3. Click **Run**

This creates `brands`, `products`, `orders`, `profiles`, and `newsletter_subscribers` with sample data.

4. Copy all contents from `supabase/secure_checkout.sql` and click **Run** again (secure checkout).

If you skip step 2, checkout may show: *Could not find the table 'public.orders'*.

## 3. Get your API keys

1. Go to **Project Settings → API**
2. Copy:
   - **Project URL** → `REACT_APP_SUPABASE_URL` and `SUPABASE_URL`
   - **anon public** key → `REACT_APP_SUPABASE_ANON_KEY` and `SUPABASE_ANON_KEY`

## 4. Configure this project

Copy `.env.example` to `.env` and paste your keys:

```env
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
```

## 5. Create an admin user

1. In Supabase: **Authentication → Users → Add user**
2. Enter email and password
3. In **SQL Editor**, run:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
```

## 6. Run the website

**React (recommended):**

```bash
npm start
```

Open http://localhost:3000 — header shows **● Live** when Supabase is connected.

**PHP (XAMPP):**

Open http://localhost/webPro/index.php — uses Supabase when keys are in `.env`.

## Demo mode (no Supabase)

Without keys, the site runs in **Demo** mode with built-in sample products.

- React login: `admin@elyoo.com` / `admin123`
- Orders are stored in memory until Supabase is configured

## Order tracking (existing projects)

If you already ran the schema, also run `supabase/order_tracking.sql` in the SQL Editor to enable guest order lookup.

## Features powered by Supabase

- Product catalog (live sync)
- Order checkout with stock updates
- **Customer order tracking** (by order # + email, or all orders for an email)
- Admin order management
- Newsletter signups
- Secure admin authentication

# Create your Supabase database (5 minutes)

Your app is **connected** to Supabase, but the **tables** are not created until you run SQL once.

## Step-by-step

### 1. Open Supabase

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click your project (URL like `chtihwnijsbpbnuovgbo`)

### 2. Open SQL Editor

1. Left menu → **SQL Editor**
2. Click **New query**

### 3. Run the setup file

1. On your PC, open this file in the project folder:

   **`supabase/SETUP_ALL.sql`**

2. Select **all** text (`Ctrl+A`) → Copy (`Ctrl+C`)
3. Paste into the Supabase SQL Editor
4. Click **Run** (or `Ctrl+Enter`)
5. You should see **Success** and a result row like:

   | message              | brands | products | orders |
   |----------------------|--------|----------|--------|
   | Elyoo database ready | 6      | 8        | 0      |

### 4. Confirm in Table Editor

Left menu → **Table Editor**. You should see:

- `brands`
- `products`
- `orders`
- `profiles`
- `newsletter_subscribers`

### 5. Create team logins (admin + staff)

1. **Authentication** → **Users** → **Add user** (create **two** users):

| Role  | Email             | Password |
|-------|-------------------|----------|
| Admin | `jireh@elyoo.com` | `faith`  |
| Staff | `jai@elyoo.com`   | `212121` |

2. **SQL Editor** → run `supabase/TEAM_USERS.sql` (sets admin/staff roles)

3. Restart `npm start`

**Sign in on the site** (username works too):

| Portal       | Username | Password |
|--------------|----------|----------|
| Admin login  | `jireh`  | `faith`  |
| Staff login  | `jai`    | `212121` |

Until Supabase users exist, the same username/password still works in **local team mode**.

### 6. Fix admin product save (if you see "infinite recursion" on profiles)

Run **`supabase/fix_profiles_rls.sql`** in SQL Editor (one time).

### 7. Test checkout

Place a test order on the cart page. It should succeed without the `public.orders` error.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `relation already exists` | Tables exist — skip to admin user step |
| `permission denied` | Use the same project as in `supabase.connection.json` |
| Still no tables | Make sure you clicked **Run** on the full `SETUP_ALL.sql` |
| Login fails | User must exist under **Authentication → Users**, then `UPDATE profiles` |

## File location

Full path on your machine:

`c:\xampp2.0\htdocs\webPro\supabase\SETUP_ALL.sql`

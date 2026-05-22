# Deploy Elyoo with Supabase (products in the cloud)

## 1. Supabase project setup (one time)

In [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**, run these files **in order**:

1. `supabase/SETUP_ALL.sql` — tables, seed products, RLS helpers  
2. `supabase/fix_profiles_rls.sql` — fixes admin save + `admin_create_product` + image storage  
3. `supabase/secure_checkout.sql` — secure orders (if not already in SETUP_ALL)  
4. `supabase/TEAM_USERS.sql` — after step 2  

## 2. Authentication users

**Authentication → Users → Add user**

| Email | Password | Role (via SQL) |
|-------|----------|----------------|
| `jireh@elyoo.com` | `faith` | admin |
| `jai@elyoo.com` | `212121` | staff |

Turn off **Confirm email** for team accounts (Authentication → Providers → Email) so sign-in works immediately.

## 3. App environment (production build)

Set in hosting or `.env`:

```
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

Or ship `public/supabase.connection.json` with the same values.

## 4. Sign in before adding products

1. Open the site → **Team login**  
2. Username `jireh`, password `faith`  
3. Admin sidebar must show **● Supabase live**  
4. Add a product — toast should say **Product saved to Supabase (#123)**  

If you see “local demo mode”, sign out and sign in again after completing steps 1–2.

## 5. Verify in Supabase

**Table Editor → products** — new rows appear with numeric `id` (not `local-prod-…`).

# Elyoo — full test checklist (Supabase connected)

Run automated check first:

```bash
npm run verify:supabase
```

## One-time Supabase setup

1. SQL Editor → `supabase/SETUP_ALL.sql` (if new project)
2. SQL Editor → `supabase/fix_profiles_rls.sql`
3. Authentication → Users → **jireh@elyoo.com** / **faith**, **jai@elyoo.com** / **212121**
4. Authentication → Email → disable **Confirm email**
5. SQL Editor → `supabase/TEAM_USERS.sql`

## Admin (jireh / faith)

| Step | Expected |
|------|----------|
| Team login | Redirects to `/admin`, banner **Supabase connected** |
| Sidebar | **● Supabase live** |
| Products → Add product | Toast: **Product saved to Supabase (#number)** |
| Supabase → products table | New row with numeric `id` |
| Products → Delete test row | Removes from table |
| Brands → Add brand | Saves (no error) |
| Staff | Lists Jireh + Jai |
| Orders | Shows cloud + any local checkout orders |

## Storefront (guest)

| Step | Expected |
|------|----------|
| Home | Products load, header **Live** badge |
| Add to cart → Checkout | Order completes |
| My Orders (same email) | Order appears |
| Admin → Orders | Same order visible |

## If something fails

- **Local demo login** banner → sign out, create Auth user, sign in again
- **Cannot save to Supabase (policies)** → run `fix_profiles_rls.sql`
- **Invalid login credentials** → create user in Supabase Auth
- **local-prod-…** ids → old browser-only products; delete and re-add after cloud login

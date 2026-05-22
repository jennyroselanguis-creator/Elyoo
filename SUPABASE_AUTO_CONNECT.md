# Automatic Supabase connection

## One-time setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL in `supabase/schema.sql` (and `supabase/staff_policies.sql`) in the SQL Editor.
3. In Supabase: **Project Settings → API**, copy:
   - **Project URL**
   - **anon public** key

4. Either run:

```bash
npm run supabase:setup
```

and paste your URL and key when asked,

**or** copy the example file and edit it:

```bash
copy supabase.connection.example.json supabase.connection.json
```

Edit `supabase.connection.json`:

```json
{
  "url": "https://abcdefghijklmnop.supabase.co",
  "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

5. Start the app:

```bash
npm start
```

The `prestart` script syncs your config into `.env` and connects automatically.

## How it works

- `supabase.connection.json` (project root, not committed to git) holds your keys
- Before `npm start`, `scripts/sync-supabase-config.js` copies keys to `.env` and `public/supabase.connection.json`
- On load, the React app connects to Supabase and shows **Live** in the header when the database responds
- PHP (`index.php`) reads the same JSON file if `.env` is empty

## Admin user

After creating a user in Supabase Auth:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

## Without Supabase

If `supabase.connection.json` is missing, the store runs in **local demo mode** (seed products + local admin login).

# Supabase

Database migrations and RLS policies for APIVerse.

## Running migrations

### Option A — via the dashboard (quickest for first-time setup)

1. Open your Supabase project → **SQL Editor**.
2. Paste `migrations/001_initial_schema.sql` → **Run**.
3. Paste `migrations/002_rls_policies.sql` → **Run**.
4. Verify in the Table Editor that all tables appear with RLS enabled.

### Option B — via the Supabase CLI

```bash
brew install supabase/tap/supabase  # or: npm i -g supabase
supabase login
supabase link --project-ref gmewmstsqfppdxsjimuv
supabase db push
```

## Key facts

- All tables start with RLS **enabled**. Public read on `apis`, `profiles`,
  `demos`, `comments`, and `upvotes`. Everything else is strictly owner-scoped.
- `apis` is seeded via a service-role endpoint (`POST /api/seed`), not the CLI.
- New signups auto-create a `profiles` row via the `on_auth_user_created`
  trigger, so you don't have to handle that from the app.

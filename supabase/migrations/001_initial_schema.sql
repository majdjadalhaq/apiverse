-- ============================================================================
-- APIVerse :: initial schema
-- ----------------------------------------------------------------------------
-- Run this once in Supabase SQL Editor, or via `supabase db push` if you've
-- set up the CLI. All tables hang off auth.users via `profiles.id`.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles — extends auth.users with public-facing identity
-- ----------------------------------------------------------------------------
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now() not null
);

-- ----------------------------------------------------------------------------
-- apis — the catalog, seeded from a curated list of public APIs
-- ----------------------------------------------------------------------------
create table apis (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  category text not null,
  url text not null,
  auth text default 'No' not null,       -- 'No' | 'apiKey' | 'OAuth' | ...
  https boolean default true not null,
  cors text default 'Unknown' not null,  -- 'Yes' | 'No' | 'Unknown'
  slug text unique not null,
  created_at timestamptz default now() not null
);

create index apis_category_idx on apis (category);
create index apis_name_trgm_idx on apis using gin (name gin_trgm_ops);

-- Enable trigram search for nicer fuzzy matching on name
create extension if not exists pg_trgm;

-- ----------------------------------------------------------------------------
-- demos — official + community demos that show an API in action
-- ----------------------------------------------------------------------------
create table demos (
  id uuid primary key default gen_random_uuid(),
  api_id uuid references apis on delete cascade not null,
  title text not null,
  description text,
  author_id uuid references profiles on delete set null,
  upvotes_count integer default 0 not null,
  is_official boolean default false not null,
  created_at timestamptz default now() not null
);

create index demos_api_id_idx on demos (api_id);
create index demos_author_id_idx on demos (author_id);

-- ----------------------------------------------------------------------------
-- bookmarks — "save for later" on an API
-- ----------------------------------------------------------------------------
create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade not null,
  api_id uuid references apis on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (user_id, api_id)
);

-- ----------------------------------------------------------------------------
-- collections — named groupings of APIs, optionally public
-- ----------------------------------------------------------------------------
create table collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade not null,
  name text not null,
  description text,
  is_public boolean default false not null,
  created_at timestamptz default now() not null
);

create table collection_apis (
  collection_id uuid references collections on delete cascade not null,
  api_id uuid references apis on delete cascade not null,
  primary key (collection_id, api_id)
);

-- ----------------------------------------------------------------------------
-- comments — threaded discussion on a demo (v1 is flat, no replies)
-- ----------------------------------------------------------------------------
create table comments (
  id uuid primary key default gen_random_uuid(),
  demo_id uuid references demos on delete cascade not null,
  author_id uuid references profiles on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

create index comments_demo_id_idx on comments (demo_id);

-- ----------------------------------------------------------------------------
-- upvotes — one row per (user, demo). The denormalised counter on `demos`
-- is kept in sync via increment_upvotes / decrement_upvotes RPC functions.
-- ----------------------------------------------------------------------------
create table upvotes (
  user_id uuid references profiles on delete cascade not null,
  demo_id uuid references demos on delete cascade not null,
  primary key (user_id, demo_id)
);

-- ----------------------------------------------------------------------------
-- helpers — atomic counter updates for upvotes
-- ----------------------------------------------------------------------------
create or replace function increment_upvotes(target_demo_id uuid)
returns void language sql security definer as $$
  update demos set upvotes_count = upvotes_count + 1 where id = target_demo_id;
$$;

create or replace function decrement_upvotes(target_demo_id uuid)
returns void language sql security definer as $$
  update demos
     set upvotes_count = greatest(0, upvotes_count - 1)
   where id = target_demo_id;
$$;

-- ----------------------------------------------------------------------------
-- auto-create a profile when a new auth.users row is inserted
-- ----------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'user_name',
      new.raw_user_meta_data ->> 'preferred_username',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

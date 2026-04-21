-- ============================================================================
-- APIVerse :: Row Level Security
-- ----------------------------------------------------------------------------
-- RLS is on for every table. Read access is public where it makes sense;
-- write access is always scoped to the authenticated user who owns the row.
-- ============================================================================

alter table profiles        enable row level security;
alter table apis            enable row level security;
alter table demos           enable row level security;
alter table bookmarks       enable row level security;
alter table collections     enable row level security;
alter table collection_apis enable row level security;
alter table comments        enable row level security;
alter table upvotes         enable row level security;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
create policy "profiles: public read"
  on profiles for select using (true);

create policy "profiles: update own"
  on profiles for update using (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- apis — seeded via service role, read-only for everyone else
-- ----------------------------------------------------------------------------
create policy "apis: public read"
  on apis for select using (true);

-- ----------------------------------------------------------------------------
-- demos
-- ----------------------------------------------------------------------------
create policy "demos: public read"
  on demos for select using (true);

create policy "demos: auth insert own"
  on demos for insert with check (auth.uid() = author_id);

create policy "demos: update own"
  on demos for update using (auth.uid() = author_id);

create policy "demos: delete own"
  on demos for delete using (auth.uid() = author_id);

-- ----------------------------------------------------------------------------
-- bookmarks — strictly private to the user who owns them
-- ----------------------------------------------------------------------------
create policy "bookmarks: select own"
  on bookmarks for select using (auth.uid() = user_id);

create policy "bookmarks: insert own"
  on bookmarks for insert with check (auth.uid() = user_id);

create policy "bookmarks: delete own"
  on bookmarks for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- collections — readable if public OR owned
-- ----------------------------------------------------------------------------
create policy "collections: select public or own"
  on collections for select
  using (is_public = true or auth.uid() = user_id);

create policy "collections: insert own"
  on collections for insert with check (auth.uid() = user_id);

create policy "collections: update own"
  on collections for update using (auth.uid() = user_id);

create policy "collections: delete own"
  on collections for delete using (auth.uid() = user_id);

-- collection_apis: readable/writable only by the owner of the parent collection
create policy "collection_apis: select parent readable"
  on collection_apis for select using (
    exists (
      select 1 from collections c
       where c.id = collection_apis.collection_id
         and (c.is_public = true or c.user_id = auth.uid())
    )
  );

create policy "collection_apis: insert own collection"
  on collection_apis for insert with check (
    exists (
      select 1 from collections c
       where c.id = collection_apis.collection_id
         and c.user_id = auth.uid()
    )
  );

create policy "collection_apis: delete own collection"
  on collection_apis for delete using (
    exists (
      select 1 from collections c
       where c.id = collection_apis.collection_id
         and c.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- comments — public read, authenticated insert, own delete
-- ----------------------------------------------------------------------------
create policy "comments: public read"
  on comments for select using (true);

create policy "comments: auth insert own"
  on comments for insert with check (auth.uid() = author_id);

create policy "comments: delete own"
  on comments for delete using (auth.uid() = author_id);

-- ----------------------------------------------------------------------------
-- upvotes — public read (for counts), auth toggle own
-- ----------------------------------------------------------------------------
create policy "upvotes: public read"
  on upvotes for select using (true);

create policy "upvotes: insert own"
  on upvotes for insert with check (auth.uid() = user_id);

create policy "upvotes: delete own"
  on upvotes for delete using (auth.uid() = user_id);

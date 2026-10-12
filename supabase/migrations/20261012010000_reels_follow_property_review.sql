-- APPLIED to the shared database on 2026-10-12 (migration names:
-- reels_follow_property_review, then reels_protect_fields_as_invoker).
-- This file is the record of those two changes combined.
--
-- Reels: one flow for app, website and admin.
-- A reel belongs to a property and is public only while that property is
-- approved and the reel itself is 'active'. Statuses: active | private
-- (seller's choice) | hidden (admin moderation).

-- 1. Who can see a reel -------------------------------------------------------
drop policy if exists "Allow public select on property_reels" on public.property_reels;
create policy "Reels are public while active and their property is approved"
  on public.property_reels for select
  using (
    owner_id = auth.uid()
    or public.is_admin()
    or (
      status = 'active'
      and exists (
        select 1 from public.properties p
        where p.id = property_reels.property_id
          and p.status = 'approved'
      )
    )
  );

-- 2. Admin moderation ---------------------------------------------------------
create policy "Admins can update all reels"
  on public.property_reels for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete all reels"
  on public.property_reels for delete to authenticated
  using (public.is_admin());

-- A seller cannot attach a reel to someone else's listing.
drop policy if exists "Allow auth insert on property_reels" on public.property_reels;
create policy "Owners can add reels to their own listings"
  on public.property_reels for insert
  with check (
    auth.uid() = owner_id
    and exists (
      select 1 from public.properties p
      where p.id = property_id and p.owner_id = auth.uid()
    )
  );

-- 3. Sellers cannot undo moderation or edit their own counters ---------------
-- SECURITY INVOKER on purpose: the guard must see the calling role to tell a
-- direct API call (authenticated/anon) from the counter functions (owner).
create or replace function public.protect_reel_fields()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if current_user not in ('authenticated', 'anon') or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.views_count := 0; new.likes_count := 0; new.saves_count := 0;
    new.shares_count := 0; new.lead_count := 0;
    if new.status is null or new.status not in ('active', 'private') then
      new.status := 'active';
    end if;
    return new;
  end if;

  new.views_count  := old.views_count;
  new.likes_count  := old.likes_count;
  new.saves_count  := old.saves_count;
  new.shares_count := old.shares_count;
  new.lead_count   := old.lead_count;
  new.owner_id     := old.owner_id;
  new.property_id  := old.property_id;
  if old.status = 'hidden' or new.status not in ('active', 'private') then
    new.status := old.status;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
revoke execute on function public.protect_reel_fields() from public, anon, authenticated;

drop trigger if exists protect_reel_fields on public.property_reels;
create trigger protect_reel_fields
  before insert or update on public.property_reels
  for each row execute function public.protect_reel_fields();

-- 4. Likes and saves: counts follow the rows, so they cannot be inflated ------
create or replace function public.sync_reel_like_count()
returns trigger language plpgsql security definer
set search_path = public, pg_temp as $$
begin
  if tg_op = 'INSERT' then
    update public.property_reels set likes_count = likes_count + 1 where id = new.reel_id;
    return new;
  end if;
  update public.property_reels set likes_count = greatest(0, likes_count - 1) where id = old.reel_id;
  return old;
end; $$;

create or replace function public.sync_reel_save_count()
returns trigger language plpgsql security definer
set search_path = public, pg_temp as $$
begin
  if tg_op = 'INSERT' then
    update public.property_reels set saves_count = saves_count + 1 where id = new.reel_id;
    return new;
  end if;
  update public.property_reels set saves_count = greatest(0, saves_count - 1) where id = old.reel_id;
  return old;
end; $$;
revoke execute on function public.sync_reel_like_count() from public, anon, authenticated;
revoke execute on function public.sync_reel_save_count() from public, anon, authenticated;

drop trigger if exists sync_reel_like_count on public.property_reel_likes;
create trigger sync_reel_like_count after insert or delete on public.property_reel_likes
  for each row execute function public.sync_reel_like_count();
drop trigger if exists sync_reel_save_count on public.property_reel_saves;
create trigger sync_reel_save_count after insert or delete on public.property_reel_saves
  for each row execute function public.sync_reel_save_count();

-- The old client-called counters stay so released app builds keep working,
-- but they no longer change anything (the triggers above do the counting).
create or replace function public.increment_reel_likes(r_reel_id uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$ begin return; end; $$;
create or replace function public.decrement_reel_likes(r_reel_id uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$ begin return; end; $$;
create or replace function public.increment_reel_saves(r_reel_id uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$ begin return; end; $$;
create or replace function public.decrement_reel_saves(r_reel_id uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$ begin return; end; $$;

-- 5. Views: once per signed-in viewer -----------------------------------------
create table if not exists public.property_reel_views (
  reel_id uuid not null references public.property_reels(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (reel_id, user_id)
);
alter table public.property_reel_views enable row level security;
create policy "Users can see their own reel views"
  on public.property_reel_views for select using (auth.uid() = user_id);

create or replace function public.increment_reel_views(r_reel_id uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare inserted int;
begin
  if auth.uid() is null then return; end if;
  -- The owner watching their own reel is not a view.
  if exists (select 1 from public.property_reels where id = r_reel_id and owner_id = auth.uid()) then
    return;
  end if;
  insert into public.property_reel_views (reel_id, user_id)
  values (r_reel_id, auth.uid())
  on conflict do nothing;
  get diagnostics inserted = row_count;
  if inserted > 0 then
    update public.property_reels set views_count = views_count + 1 where id = r_reel_id;
  end if;
end; $$;
revoke execute on function public.increment_reel_views(uuid) from public, anon;
grant execute on function public.increment_reel_views(uuid) to authenticated;

create or replace function public.increment_reel_shares(r_reel_id uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if auth.uid() is null then return; end if;
  update public.property_reels set shares_count = shares_count + 1 where id = r_reel_id;
end; $$;
revoke execute on function public.increment_reel_shares(uuid) from public, anon;
grant execute on function public.increment_reel_shares(uuid) to authenticated;

-- 6. Reports: point at the real reels table, and let admins read them --------
alter table public.reel_reports drop constraint if exists reel_reports_reel_id_fkey;
alter table public.reel_reports
  add constraint reel_reports_reel_id_fkey
  foreign key (reel_id) references public.property_reels(id) on delete cascade;

create policy "Admins can view all reel reports"
  on public.reel_reports for select to authenticated using (public.is_admin());
create policy "Admins can delete reel reports"
  on public.reel_reports for delete to authenticated using (public.is_admin());

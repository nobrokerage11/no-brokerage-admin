-- APPLIED to the shared database on 2026-10-12 (migration names:
-- one_account_buyer_and_seller, then posting_a_listing_grants_seller_access).
-- This file is the record of both.
--
-- One account can both buy and sell.
--   is_seller : the account has turned on selling ("Become a seller").
--   user_type : which side of the app the account is using right now.
alter table public.users
  add column if not exists is_seller boolean not null default false;

-- Anyone already selling keeps seller access.
update public.users u
set is_seller = true
where u.user_type::text = 'seller'
   or exists (select 1 from public.properties p where p.owner_id = u.id);

-- Accounts that never picked a role start as buyers, like every new account.
update public.users set user_type = 'buyer' where user_type is null;
alter table public.users alter column user_type set default 'buyer';

-- Every new account starts as a buyer, whatever the sign-up form sent.
-- (Previously the role came from the sign-up form and overwrote an existing
-- row's role on conflict.)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.users (id, full_name, phone_number, user_type, status, otp_verified)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone_number',
    'buyer'::public.user_role,
    'active',
    false
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.users.full_name),
    phone_number = coalesce(excluded.phone_number, public.users.phone_number);
  return new;
end;
$$;

-- Posting a listing from anywhere (the website has no "Become a seller" step)
-- turns on seller access, so the same account sees its listings in the app.
create or replace function public.grant_seller_access_on_listing()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.users set is_seller = true
  where id = new.owner_id and is_seller is not true;
  return new;
end;
$$;
revoke execute on function public.grant_seller_access_on_listing() from public, anon, authenticated;

drop trigger if exists grant_seller_access_on_listing on public.properties;
create trigger grant_seller_access_on_listing
  after insert on public.properties
  for each row execute function public.grant_seller_access_on_listing();

-- APPLIED to the shared database on 2026-10-12 (migration names:
-- lead_flow_enquiry_statuses, then lead_flow). This file is the record.
--
-- One lead flow for app, website and admin.

-- Statuses: pending (shown as "New") -> contacted -> visit_scheduled ->
-- closed / not_interested. 'accepted' and 'rejected' stay for older builds.
alter type public.enquiry_status add value if not exists 'contacted';
alter type public.enquiry_status add value if not exists 'visit_scheduled';
alter type public.enquiry_status add value if not exists 'closed';
alter type public.enquiry_status add value if not exists 'not_interested';

-- ===== Property enquiries (buyer -> owner) ==================================
alter table public.enquiries
  add column if not exists source text not null default 'app',
  add column if not exists updated_at timestamptz not null default now();

create policy "Admins can view all enquiries"
  on public.enquiries for select to authenticated using (public.is_admin());
create policy "Admins can update all enquiries"
  on public.enquiries for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Two triggers each added 1 to the listing's enquiry count.
drop trigger if exists on_new_enquiry_increment_count on public.enquiries;

create or replace function public.lead_status_label(p_status text)
returns text language sql immutable as $$
  select case lower(coalesce(p_status, ''))
    when 'pending' then 'New'
    when 'new' then 'New'
    when 'contacted' then 'Contacted'
    when 'accepted' then 'Contacted'
    when 'visit_scheduled' then 'Visit scheduled'
    when 'closed' then 'Closed'
    when 'not_interested' then 'Not interested'
    when 'rejected' then 'Not interested'
    else initcap(replace(coalesce(p_status, ''), '_', ' '))
  end
$$;

create or replace function public.notify_enquiry_created()
returns trigger language plpgsql security definer
set search_path = public, pg_temp as $$
declare v_buyer text; v_title text;
begin
  select full_name into v_buyer from public.users where id = new.buyer_id;
  select title into v_title from public.properties where id = new.property_id;
  insert into public.notifications (user_id, title, body, chat_id, sender_id)
  values (
    new.seller_id,
    'New enquiry',
    coalesce(v_buyer, 'A buyer') || ' is interested in "' || coalesce(v_title, 'your property') || '".',
    new.id::text,
    new.buyer_id
  );
  return new;
end; $$;
revoke execute on function public.notify_enquiry_created() from public, anon, authenticated;

drop trigger if exists notify_enquiry_created on public.enquiries;
create trigger notify_enquiry_created after insert on public.enquiries
  for each row execute function public.notify_enquiry_created();

create or replace function public.notify_enquiry_status_changed()
returns trigger language plpgsql security definer
set search_path = public, pg_temp as $$
declare v_title text;
begin
  new.updated_at := now();
  if new.status is distinct from old.status then
    select title into v_title from public.properties where id = new.property_id;
    insert into public.notifications (user_id, title, body, chat_id, sender_id)
    values (
      new.buyer_id,
      'Enquiry update',
      'Your enquiry about "' || coalesce(v_title, 'a property') || '" is now: '
        || public.lead_status_label(new.status::text) || '.',
      new.id::text,
      new.seller_id
    );
  end if;
  return new;
end; $$;
revoke execute on function public.notify_enquiry_status_changed() from public, anon, authenticated;

drop trigger if exists notify_enquiry_status_changed on public.enquiries;
create trigger notify_enquiry_status_changed before update on public.enquiries
  for each row execute function public.notify_enquiry_status_changed();

do $$ begin
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'enquiries') then
    alter publication supabase_realtime add table public.enquiries;
  end if;
end $$;

-- ===== General leads (website forms, service requests) ======================
alter table public.leads
  add column if not exists user_id uuid references public.users(id) on delete set null,
  add column if not exists assigned_to uuid references public.admin_users(id) on delete set null,
  add column if not exists assigned_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

-- TRANSITIONAL: the 60-second clause exists only because the website build
-- live on 2026-10-12 reads back the row it has just inserted. Remove it once
-- the updated website is deployed (see supabase/proposed/).
drop policy if exists "Allow admins and owners to select leads" on public.leads;
create policy "Leads are visible to admins and their own customer"
  on public.leads for select
  using (
    public.is_admin()
    or (user_id is not null and user_id = auth.uid())
    or created_at > now() - interval '60 seconds'
  );

drop policy if exists "Allow anyone to insert leads" on public.leads;
create policy "Anyone can submit a lead"
  on public.leads for insert
  with check (user_id is null or user_id = auth.uid());

create or replace function public.notify_lead_status_changed()
returns trigger language plpgsql security definer
set search_path = public, pg_temp as $$
begin
  new.updated_at := now();
  if new.assigned_to is distinct from old.assigned_to then
    new.assigned_at := case when new.assigned_to is null then null else now() end;
  end if;
  if new.status is distinct from old.status and new.user_id is not null then
    insert into public.notifications (user_id, title, body)
    values (
      new.user_id,
      'Request update',
      'Your request (' || coalesce(new.type, 'enquiry') || ') is now: '
        || public.lead_status_label(new.status) || '.'
    );
  end if;
  return new;
end; $$;
revoke execute on function public.notify_lead_status_changed() from public, anon, authenticated;

drop trigger if exists notify_lead_status_changed on public.leads;
create trigger notify_lead_status_changed before update on public.leads
  for each row execute function public.notify_lead_status_changed();

-- ===== Chats stay private unless a participant reports one ==================
create table if not exists public.chat_reports (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null,
  reporter_id uuid not null references public.users(id) on delete cascade,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  unique (chat_id, reporter_id)
);
alter table public.chat_reports enable row level security;

create policy "Participants can report their own chat"
  on public.chat_reports for insert
  with check (
    reporter_id = auth.uid()
    and (
      exists (select 1 from public.chats c where c.id = chat_id
              and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()))
      or exists (select 1 from public.enquiries e where e.id = chat_id
              and (e.buyer_id = auth.uid() or e.seller_id = auth.uid()))
    )
  );
create policy "Reporters and admins can view chat reports"
  on public.chat_reports for select
  using (reporter_id = auth.uid() or public.is_admin());
create policy "Admins can update chat reports"
  on public.chat_reports for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can view reported chats"
  on public.chats for select to authenticated
  using (public.is_admin() and exists (select 1 from public.chat_reports r where r.chat_id = chats.id));
create policy "Admins can view messages of reported chats"
  on public.messages for select to authenticated
  using (public.is_admin() and exists (select 1 from public.chat_reports r where r.chat_id = messages.chat_id));

-- PROPOSED — NOT APPLIED. Review before running against the shared database.
-- Kept outside supabase/migrations on purpose so `supabase db push` ignores it.
--
-- The approval and featuring guard was applied on 2026-10-12; see
-- supabase/migrations/20261012000000_enforce_property_review_rules.sql.
-- What is left here was not part of that approval.

-- 2. Indexes for the two queries every client runs ---------------------------
create index if not exists properties_status_approved_at_idx
  on public.properties (status, approved_at desc);
create index if not exists properties_owner_id_idx
  on public.properties (owner_id);

-- 3. Review history: admins write it, admins and the owner read it -----------
-- Today any signed-in user can read every row and insert rows under their
-- own id.
drop policy if exists "Allow admin read access on status history" on public.property_status_history;
create policy "Admins and owners can read status history"
  on public.property_status_history for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.properties p
      where p.id = property_status_history.property_id
        and p.owner_id = auth.uid()
    )
  );

drop policy if exists "Allow authenticated admins to insert status history" on public.property_status_history;
create policy "Admins can insert status history"
  on public.property_status_history for insert
  with check (public.is_admin() and auth.uid() = admin_id);

-- 4. Optional: live updates ---------------------------------------------------
-- `properties` is not in the realtime publication, so no client can be told
-- about an approval as it happens; they refresh on focus/resume instead.
-- alter publication supabase_realtime add table public.properties;

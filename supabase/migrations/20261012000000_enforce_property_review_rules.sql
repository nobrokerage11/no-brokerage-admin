-- APPLIED to the shared database on 2026-10-12 (migration names:
-- enforce_property_review_rules, then featuring_is_admin_only). This file is
-- the record of the function as it now stands.
--
-- Only an administrator can approve a listing. Before this, the seller
-- UPDATE policy had no column limits, so an owner could set
-- status = 'approved' on their own listing straight through the API.
create or replace function public.enforce_property_review_rules()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Service role, SQL editor and admins are not restricted.
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status            := 'pending';
    new.is_featured       := false;
    new.approved_at       := null;
    new.rejection_reason  := null;
    new.rejection_remarks := null;
    return new;
  end if;

  -- A seller may send a listing back for review (an edit), nothing else.
  if new.status is distinct from old.status and new.status <> 'pending' then
    raise exception 'Only an administrator can change a listing''s review status'
      using errcode = '42501';
  end if;

  -- Sellers may clear a rejection when they resubmit, not write one.
  if new.rejection_reason is not null
     and new.rejection_reason is distinct from old.rejection_reason then
    new.rejection_reason := old.rejection_reason;
  end if;
  if new.rejection_remarks is not null
     and new.rejection_remarks is distinct from old.rejection_remarks then
    new.rejection_remarks := old.rejection_remarks;
  end if;

  -- Featuring is an admin decision, like approval.
  new.is_featured := old.is_featured;
  new.approved_at := old.approved_at;
  new.owner_id    := old.owner_id;
  return new;
end;
$$;

revoke execute on function public.enforce_property_review_rules() from public, anon, authenticated;

-- Named to sort before "on_property_approved", so the approval notification
-- trigger only ever sees a status that passed this check.
drop trigger if exists a_enforce_property_review_rules on public.properties;
create trigger a_enforce_property_review_rules
  before insert or update on public.properties
  for each row execute function public.enforce_property_review_rules();

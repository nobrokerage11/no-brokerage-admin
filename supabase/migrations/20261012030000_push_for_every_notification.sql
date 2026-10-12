-- APPLIED to the shared database on 2026-10-12 (migration name:
-- push_for_every_notification). This file is the record.
--
-- Every in-app notification is also sent to the user's phone.
-- The send-push edge function (supabase/functions/send-push) reads the
-- notification itself and claims it through pushed_at, so each one is pushed
-- at most once.
alter table public.notifications
  add column if not exists pushed_at timestamptz;

-- Notifications that already existed were never meant to be pushed late.
update public.notifications set pushed_at = created_at where pushed_at is null;

create or replace function public.push_notification()
returns trigger
language plpgsql
security definer
set search_path = public, net, pg_temp
as $$
declare
  v_auth text;
begin
  -- The function requires a valid project token. Reuse the one on the request
  -- that caused this notification; without a request (SQL editor, cron) the
  -- notification stays in-app only.
  begin
    v_auth := current_setting('request.headers', true)::json ->> 'authorization';
  exception when others then
    v_auth := null;
  end;
  if v_auth is null or v_auth = '' then
    return new;
  end if;

  -- A push that cannot be queued must never block the notification itself.
  begin
    perform net.http_post(
      url := 'https://kcwaqseendhxbsnpmlkg.supabase.co/functions/v1/send-push',
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', v_auth),
      body := jsonb_build_object('notification_id', new.id)
    );
  exception when others then
    raise warning 'push_notification: could not queue push for %: %', new.id, sqlerrm;
  end;
  return new;
end;
$$;
revoke execute on function public.push_notification() from public, anon, authenticated;

drop trigger if exists push_notification on public.notifications;
create trigger push_notification
  after insert on public.notifications
  for each row execute function public.push_notification();

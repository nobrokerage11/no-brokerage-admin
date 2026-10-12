ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS otp_verified boolean NOT NULL DEFAULT true;

ALTER TABLE public.users
  ALTER COLUMN otp_verified SET DEFAULT false;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_role text;
BEGIN
  v_role := lower(COALESCE(NULLIF(NEW.raw_user_meta_data->>'user_type', ''), 'buyer'));
  IF v_role NOT IN ('buyer', 'seller') THEN
    v_role := 'buyer';
  END IF;

  INSERT INTO public.users (id, full_name, phone_number, user_type, status, otp_verified)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone_number',
    v_role::public.user_role,
    'active',
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    phone_number = COALESCE(EXCLUDED.phone_number, public.users.phone_number),
    user_type = COALESCE(EXCLUDED.user_type, public.users.user_type);

  RETURN NEW;
END;
$function$;

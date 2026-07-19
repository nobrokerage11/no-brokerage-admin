-- Fix property approval trigger function to run with SECURITY DEFINER
-- This allows the trigger to insert into recent_activities without being blocked by RLS checks
CREATE OR REPLACE FUNCTION public.log_property_approval_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges to bypass RLS checks
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO public.recent_activities (user_id, title, subtitle, type)
    VALUES (
      NEW.owner_id,
      'Premium Listing Approved',
      NEW.title || ' verification successful',
      'approval'
    );
  END IF;
  RETURN NEW;
END;
$$;

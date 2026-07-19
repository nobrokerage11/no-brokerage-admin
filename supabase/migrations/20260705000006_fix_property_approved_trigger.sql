-- Fix handle_property_approved trigger function to run with SECURITY DEFINER
-- This ensures the trigger can notify the seller and nearby buyers without being blocked by RLS policies
CREATE OR REPLACE FUNCTION public.handle_property_approved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges to bypass RLS checks
AS $$
DECLARE
  v_seller_name TEXT;
  v_prop_title  TEXT;
  v_prop_loc    TEXT;
  v_prop_lat    NUMERIC;
  v_prop_lng    NUMERIC;
  v_bedrooms    INTEGER;
  radius_km     NUMERIC := 20; -- notify buyers within 20 km
BEGIN
  -- Only fire when status transitions TO 'approved'
  IF (OLD.status IS NOT DISTINCT FROM NEW.status) OR (NEW.status <> 'approved'::property_status) THEN
    RETURN NEW;
  END IF;

  -- Stamp approval timestamp
  NEW.approved_at := NOW();

  -- Collect property details
  v_prop_title := NEW.title;
  v_prop_loc   := NEW.location;
  v_prop_lat   := NEW.latitude;
  v_prop_lng   := NEW.longitude;
  v_bedrooms   := NEW.bedrooms;

  -- Get seller's name
  SELECT full_name INTO v_seller_name
  FROM public.users
  WHERE id = NEW.owner_id;

  -- 1. Notify the SELLER
  INSERT INTO public.notifications (user_id, title, body)
  VALUES (
    NEW.owner_id,
    '🎉 Property Approved!',
    'Great news ' || COALESCE(v_seller_name, 'Seller') || '! Your listing "' || v_prop_title || '" has been approved and is now live for buyers to see.'
  );

  -- 2. Notify BUYERS within radius_km
  --    Uses Haversine formula to compute great-circle distance.
  --    Only notifies buyers who have location stored (lat/lng not null).
  IF v_prop_lat IS NOT NULL AND v_prop_lng IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, body)
    SELECT
      u.id,
      '🏠 New Property Near You!',
      'A new ' || COALESCE(v_bedrooms::TEXT, '') || ' BHK property is now available in ' || v_prop_loc || '. Check it out on NoBrokerage!'
    FROM public.users u
    WHERE
      u.id <> NEW.owner_id                -- exclude the seller
      AND u.latitude  IS NOT NULL
      AND u.longitude IS NOT NULL
      -- Haversine distance in km
      AND (
        2 * 6371 * ASIN(
          SQRT(
            POWER(SIN(RADIANS(u.latitude  - v_prop_lat) / 2), 2)
            + COS(RADIANS(v_prop_lat)) * COS(RADIANS(u.latitude))
              * POWER(SIN(RADIANS(u.longitude - v_prop_lng) / 2), 2)
          )
        )
      ) <= radius_km;
  END IF;

  RETURN NEW;
END;
$$;

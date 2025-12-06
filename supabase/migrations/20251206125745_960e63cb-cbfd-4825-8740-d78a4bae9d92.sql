-- Create a function to lookup booking by reference and email (for guest access)
CREATE OR REPLACE FUNCTION public.lookup_booking_by_reference(
  p_booking_reference TEXT,
  p_customer_email TEXT
)
RETURNS TABLE (
  id UUID,
  booking_reference TEXT,
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  room_id UUID,
  check_in DATE,
  check_out DATE,
  guests INTEGER,
  total_price NUMERIC,
  status TEXT,
  payment_status TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.booking_reference,
    b.customer_email,
    b.customer_name,
    b.customer_phone,
    b.room_id,
    b.check_in,
    b.check_out,
    b.guests,
    b.total_price,
    b.status::TEXT,
    b.payment_status,
    b.created_at
  FROM public.bookings b
  WHERE b.booking_reference = p_booking_reference
    AND LOWER(b.customer_email) = LOWER(p_customer_email);
END;
$$;

-- Create a function to cancel booking by reference and email (for guest access)
CREATE OR REPLACE FUNCTION public.cancel_booking_by_reference(
  p_booking_reference TEXT,
  p_customer_email TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking_id UUID;
BEGIN
  -- Find the booking
  SELECT id INTO v_booking_id
  FROM public.bookings
  WHERE booking_reference = p_booking_reference
    AND LOWER(customer_email) = LOWER(p_customer_email)
    AND status = 'confirmed';
  
  IF v_booking_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Cancel the booking
  UPDATE public.bookings
  SET status = 'cancelled', updated_at = now()
  WHERE id = v_booking_id;
  
  RETURN TRUE;
END;
$$;

-- Grant execute permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.lookup_booking_by_reference TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_booking_by_reference TO anon, authenticated;
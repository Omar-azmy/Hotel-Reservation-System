-- Fix search_path for the new functions
CREATE OR REPLACE FUNCTION public.get_room_average_rating(p_room_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(AVG(rating), 0)
  FROM public.reviews
  WHERE room_id = p_room_id;
$$;

CREATE OR REPLACE FUNCTION public.get_room_review_count(p_room_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.reviews
  WHERE room_id = p_room_id;
$$;

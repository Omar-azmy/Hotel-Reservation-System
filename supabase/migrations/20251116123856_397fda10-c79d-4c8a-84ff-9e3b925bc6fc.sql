-- Add explicit policies to deny anonymous access to sensitive tables
-- This provides defense-in-depth protection for personal data

-- Deny anonymous access to profiles table (contains emails and phone numbers)
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles FOR ALL
TO anon
USING (false);

-- Deny anonymous access to bookings table (contains payment info and customer data)
CREATE POLICY "Block anonymous access to bookings"
ON public.bookings FOR ALL
TO anon
USING (false);

-- Deny anonymous access to user_roles table (contains admin role assignments)
CREATE POLICY "Block anonymous access to user_roles"
ON public.user_roles FOR ALL
TO anon
USING (false);
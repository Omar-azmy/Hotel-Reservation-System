-- Add payment_intent_id to bookings table to track Stripe payments
ALTER TABLE public.bookings
ADD COLUMN payment_intent_id TEXT,
ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

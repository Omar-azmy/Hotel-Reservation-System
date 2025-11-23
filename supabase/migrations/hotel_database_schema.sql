-- Create enum for room types
CREATE TYPE public.room_type AS ENUM ('standard', 'deluxe', 'executive_suite');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

-- Create profiles table for customer information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type room_type NOT NULL,
  description TEXT NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  capacity INT NOT NULL,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT NOT NULL UNIQUE,
  room_id UUID REFERENCES public.rooms(id) ON DELETE RESTRICT NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status booking_status NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Rooms policies (public read, admin write)
CREATE POLICY "Anyone can view available rooms"
  ON public.rooms FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage rooms"
  ON public.rooms FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all bookings"
  ON public.bookings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  -- Assign customer role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate booking reference
CREATE OR REPLACE FUNCTION public.generate_booking_reference()
RETURNS TEXT AS $$
BEGIN
  RETURN 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create validation function for booking dates
CREATE OR REPLACE FUNCTION public.validate_booking_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if check_out is after check_in
  IF NEW.check_out <= NEW.check_in THEN
    RAISE EXCEPTION 'Check-out date must be after check-in date';
  END IF;
  
  -- Check if dates are not in the past
  IF NEW.check_in < CURRENT_DATE THEN
    RAISE EXCEPTION 'Check-in date cannot be in the past';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking validation
CREATE TRIGGER validate_booking_dates_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_booking_dates();

-- Create function to check room availability
CREATE OR REPLACE FUNCTION public.check_room_availability(
  p_room_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE room_id = p_room_id
      AND status IN ('confirmed', 'pending')
      AND (id != p_booking_id OR p_booking_id IS NULL)
      AND (
        (check_in, check_out) OVERLAPS (p_check_in, p_check_out)
      )
  );
END;
$$ LANGUAGE plpgsql;

-- Insert sample rooms
INSERT INTO public.rooms (name, type, description, price_per_night, capacity, amenities, images) VALUES
  ('Standard Room 101', 'standard', 'Comfortable room with modern amenities, perfect for business travelers. Features a queen-size bed, work desk, and city views.', 120.00, 2, 
   ARRAY['Wi-Fi', 'Air Conditioning', 'TV', 'Work Desk', 'Coffee Maker'],
   ARRAY['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800']),
  
  ('Standard Room 102', 'standard', 'Cozy standard room with essential amenities for a comfortable stay. Queen bed and en-suite bathroom.', 120.00, 2,
   ARRAY['Wi-Fi', 'Air Conditioning', 'TV', 'Work Desk', 'Coffee Maker'],
   ARRAY['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800']),
  
  ('Deluxe Room 201', 'deluxe', 'Spacious deluxe room with premium furnishings and enhanced amenities. King-size bed, seating area, and panoramic city views.', 200.00, 3,
   ARRAY['Wi-Fi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Coffee Machine', 'Work Desk', 'Seating Area', 'Premium Toiletries'],
   ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800']),
  
  ('Deluxe Room 202', 'deluxe', 'Elegant deluxe accommodation with sophisticated design. Features king bed, separate seating area, and luxury bathroom.', 200.00, 3,
   ARRAY['Wi-Fi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Coffee Machine', 'Work Desk', 'Seating Area', 'Premium Toiletries'],
   ARRAY['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800']),
  
  ('Executive Suite 301', 'executive_suite', 'Premium executive suite with separate living room and bedroom. Perfect for extended stays or those seeking ultimate comfort and luxury.', 350.00, 4,
   ARRAY['Wi-Fi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Nespresso Machine', 'Executive Desk', 'Living Room', 'Premium Toiletries', 'Bathrobe', 'Slippers', 'City View'],
   ARRAY['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800']),
  
  ('Executive Suite 302', 'executive_suite', 'Luxurious suite with panoramic views and top-tier amenities. Features king bed, separate living area, dining space, and spa bathroom.', 350.00, 4,
   ARRAY['Wi-Fi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Nespresso Machine', 'Executive Desk', 'Living Room', 'Premium Toiletries', 'Bathrobe', 'Slippers', 'City View'],
   ARRAY['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800']);

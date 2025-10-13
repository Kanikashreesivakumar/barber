/*
  # BarberSlot Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `email` (text)
      - `role` (text: 'customer', 'barber', 'admin')
      - `phone` (text, optional)
      - `avatar_url` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `barbers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `specialization` (text)
      - `experience_years` (integer)
      - `bio` (text, optional)
      - `rating` (numeric, default 0)
      - `total_reviews` (integer, default 0)
      - `is_available` (boolean, default true)
      - `created_at` (timestamptz)
    
    - `services`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `duration_minutes` (integer)
      - `price` (numeric)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
    
    - `barber_availability`
      - `id` (uuid, primary key)
      - `barber_id` (uuid, references barbers)
      - `day_of_week` (integer, 0-6 for Sunday-Saturday)
      - `start_time` (time)
      - `end_time` (time)
      - `is_active` (boolean, default true)
    
    - `appointments`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, references profiles)
      - `barber_id` (uuid, references barbers)
      - `service_id` (uuid, references services)
      - `appointment_date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `status` (text: 'pending', 'confirmed', 'completed', 'cancelled')
      - `payment_status` (text: 'pending', 'paid', 'refunded')
      - `payment_amount` (numeric)
      - `notes` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `reviews`
      - `id` (uuid, primary key)
      - `appointment_id` (uuid, references appointments)
      - `customer_id` (uuid, references profiles)
      - `barber_id` (uuid, references barbers)
      - `rating` (integer, 1-5)
      - `comment` (text, optional)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access:
      - Customers can view their own data and public barber info
      - Barbers can manage their schedules and view their appointments
      - Admins have full access to all data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('customer', 'barber', 'admin')),
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create barbers table
CREATE TABLE IF NOT EXISTS barbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  specialization text NOT NULL,
  experience_years integer DEFAULT 0,
  bio text,
  rating numeric(3,2) DEFAULT 0.00,
  total_reviews integer DEFAULT 0,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  duration_minutes integer NOT NULL,
  price numeric(10,2) NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create barber_availability table
CREATE TABLE IF NOT EXISTS barber_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid REFERENCES barbers(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true,
  UNIQUE(barber_id, day_of_week)
);

ALTER TABLE barber_availability ENABLE ROW LEVEL SECURITY;

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  barber_id uuid REFERENCES barbers(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id),
  appointment_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_amount numeric(10,2),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  barber_id uuid REFERENCES barbers(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for barbers
CREATE POLICY "Anyone can view active barbers"
  ON barbers FOR SELECT
  TO authenticated
  USING (is_available = true OR user_id = auth.uid());

CREATE POLICY "Barbers can update own profile"
  ON barbers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage barbers"
  ON barbers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for services
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for barber_availability
CREATE POLICY "Anyone can view barber availability"
  ON barber_availability FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Barbers can manage own availability"
  ON barber_availability FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM barbers
      WHERE barbers.id = barber_availability.barber_id
      AND barbers.user_id = auth.uid()
    )
  );

-- RLS Policies for appointments
CREATE POLICY "Customers can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM barbers
      WHERE barbers.id = appointments.barber_id
      AND barbers.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Customers can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Barbers can update their appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM barbers
      WHERE barbers.id = appointments.barber_id
      AND barbers.user_id = auth.uid()
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Customers can create reviews for their appointments"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = reviews.appointment_id
      AND appointments.customer_id = auth.uid()
      AND appointments.status = 'completed'
    )
  );

-- Create function to update barber rating
CREATE OR REPLACE FUNCTION update_barber_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE barbers
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE barber_id = NEW.barber_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE barber_id = NEW.barber_id
    )
  WHERE id = NEW.barber_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update barber rating on new review
DROP TRIGGER IF EXISTS update_barber_rating_trigger ON reviews;
CREATE TRIGGER update_barber_rating_trigger
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_barber_rating();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_barber ON appointments(barber_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_reviews_barber ON reviews(barber_id);
CREATE INDEX IF NOT EXISTS idx_barbers_user ON barbers(user_id);
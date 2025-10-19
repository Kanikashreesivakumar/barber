import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: 'customer' | 'barber' | 'admin';
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type Barber = {
  id: string;
  user_id: string;
  specialization: string;
  experience_years: number;
  bio?: string;
  rating: number;
  total_reviews: number;
  is_available: boolean;
  created_at: string;
  profile?: Profile;
};

export type Service = {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
};

export type Appointment = {
  id: string;
  customer_id: string;
  barber_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  barber?: Barber;
  service?: Service;
  customer?: Profile;
  seatNumber?: number | null;
  queuePosition?: number | null;
  estimatedWait?: number | null; // minutes
};

export type Review = {
  id: string;
  appointment_id: string;
  customer_id: string;
  barber_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  customer?: Profile;
};

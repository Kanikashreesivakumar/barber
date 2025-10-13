/*
  # Seed Sample Data for BarberSlot

  1. Sample Services
    - Haircut ($25, 30 min)
    - Beard Trim ($15, 20 min)
    - Hair & Beard Combo ($35, 45 min)
    - Hot Towel Shave ($30, 40 min)
    - Kids Haircut ($20, 25 min)

  2. Notes
    - Services are preloaded for immediate use
    - All services are set to active by default
*/

-- Insert sample services
INSERT INTO services (name, description, duration_minutes, price, is_active)
VALUES
  ('Classic Haircut', 'Professional haircut with styling', 30, 25.00, true),
  ('Beard Trim', 'Precision beard trimming and shaping', 20, 15.00, true),
  ('Hair & Beard Combo', 'Complete grooming package', 45, 35.00, true),
  ('Hot Towel Shave', 'Traditional hot towel straight razor shave', 40, 30.00, true),
  ('Kids Haircut', 'Haircut for children 12 and under', 25, 20.00, true),
  ('Hair Color', 'Professional hair coloring service', 60, 50.00, true),
  ('Deluxe Package', 'Haircut, beard trim, and hot towel treatment', 75, 60.00, true)
ON CONFLICT DO NOTHING;

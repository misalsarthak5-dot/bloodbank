-- ============================================
-- Blood Bank System - Seed Data
-- Run this in the Supabase SQL Editor AFTER the schema
-- ============================================

-- 1. Disable RLS on all tables so the frontend anon key can read/write
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for anon access (demo purposes)
CREATE POLICY "Allow public read on hospitals" ON hospitals FOR SELECT USING (true);
CREATE POLICY "Allow public read on blood_inventory" ON blood_inventory FOR SELECT USING (true);
CREATE POLICY "Allow public read on admins" ON admins FOR SELECT USING (true);
CREATE POLICY "Allow public read on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read on blood_requests" ON blood_requests FOR SELECT USING (true);
CREATE POLICY "Allow public read on request_matches" ON request_matches FOR SELECT USING (true);
CREATE POLICY "Allow public read on inventory_audit_log" ON inventory_audit_log FOR SELECT USING (true);
CREATE POLICY "Allow public read on sessions" ON sessions FOR SELECT USING (true);

CREATE POLICY "Allow public insert on blood_requests" ON blood_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on blood_inventory" ON blood_inventory FOR UPDATE USING (true) WITH CHECK (true);

-- 2. Insert Admin
INSERT INTO admins (name, email, password_hash, role, is_super_admin)
VALUES ('Blood Bank Admin', 'admin@blood.com', '1234', 'super_admin', true);

-- 3. Insert User
INSERT INTO users (name, email, password_hash, blood_group, role, city, is_verified)
VALUES ('Demo User', 'user@blood.com', '1234', 'O+', 'user', 'Nanded', true);

-- 4. Get admin ID for hospital references
DO $$
DECLARE
  admin_uuid UUID;
  h1 UUID; h2 UUID; h3 UUID; h4 UUID; h5 UUID; h6 UUID; h7 UUID; h8 UUID; h9 UUID;
BEGIN
  SELECT id INTO admin_uuid FROM admins WHERE email = 'admin@blood.com' LIMIT 1;

  -- 5. Insert Hospitals
  INSERT INTO hospitals (name, address, city, state, lat, lng, phone, is_verified, admin_id)
  VALUES ('Jeevan Adhar Blood Bank', 'Vazirabad, Nanded', 'Nanded', 'Maharashtra', 19.1383, 77.3210, '02462-123456', true, admin_uuid)
  RETURNING id INTO h1;

  INSERT INTO hospitals (name, address, city, state, lat, lng, phone, is_verified, admin_id)
  VALUES ('Guru Gobind Singh Blood Center', 'Shivaji Nagar, Nanded', 'Nanded', 'Maharashtra', 19.1450, 77.3150, '02462-234567', true, admin_uuid)
  RETURNING id INTO h2;

  INSERT INTO hospitals (name, address, city, state, lat, lng, phone, is_verified, admin_id)
  VALUES ('Shree Hajur Saheb Blood Bank', 'Guru Gobind Singh Road, Nanded', 'Nanded', 'Maharashtra', 19.1520, 77.3100, '02462-345678', true, admin_uuid)
  RETURNING id INTO h3;

  INSERT INTO hospitals (name, address, city, state, lat, lng, phone, is_verified, admin_id)
  VALUES ('Nanded Blood Bank', 'Aadhar Hospital Road, Nanded', 'Nanded', 'Maharashtra', 19.1300, 77.3250, '02462-456789', true, admin_uuid)
  RETURNING id INTO h4;

  INSERT INTO hospitals (name, address, city, state, lat, lng, phone, is_verified, admin_id)
  VALUES ('Golvalkar Guruji Blood Bank', 'Langer Saheb Road, Nanded', 'Nanded', 'Maharashtra', 19.1350, 77.3180, '02462-567890', true, admin_uuid)
  RETURNING id INTO h5;

  INSERT INTO hospitals (name, address, city, state, lat, lng, phone, is_verified, admin_id)
  VALUES ('Jijai Blood Centre', 'Shivaji Nagar, Nanded', 'Nanded', 'Maharashtra', 19.1420, 77.3160, '02462-678901', true, admin_uuid)
  RETURNING id INTO h6;

  INSERT INTO hospitals (name, address, city, state, lat, lng, phone, is_verified, admin_id)
  VALUES ('Aadhar Hospital', 'Nanded', 'Nanded', 'Maharashtra', 19.1380, 77.3220, '02462-789012', true, admin_uuid)
  RETURNING id INTO h7;

  INSERT INTO hospitals (name, address, city, state, lat, lng, phone, is_verified, admin_id)
  VALUES ('Global Hospital', 'Nanded', 'Nanded', 'Maharashtra', 19.1400, 77.3200, '02462-890123', true, admin_uuid)
  RETURNING id INTO h8;

  INSERT INTO hospitals (name, address, city, state, lat, lng, phone, is_verified, admin_id)
  VALUES ('Life Care Hospital', 'Nanded', 'Nanded', 'Maharashtra', 19.1360, 77.3240, '02462-901234', true, admin_uuid)
  RETURNING id INTO h9;

  -- 6. Insert Blood Inventory for each hospital across all blood groups
  -- Hospital 1: Jeevan Adhar (14 units total)
  INSERT INTO blood_inventory (hospital_id, blood_group, units_available, status) VALUES
    (h1, 'A+', 3, 'available'), (h1, 'A-', 2, 'critical'), (h1, 'B+', 2, 'critical'),
    (h1, 'B-', 1, 'critical'), (h1, 'O+', 3, 'available'), (h1, 'O-', 1, 'critical'),
    (h1, 'AB+', 1, 'critical'), (h1, 'AB-', 1, 'critical');

  -- Hospital 2: Guru Gobind Singh (2 units)
  INSERT INTO blood_inventory (hospital_id, blood_group, units_available, status) VALUES
    (h2, 'A+', 1, 'critical'), (h2, 'O+', 1, 'critical'), (h2, 'B+', 0, 'out_of_stock');

  -- Hospital 3: Shree Hajur Saheb (6 units)
  INSERT INTO blood_inventory (hospital_id, blood_group, units_available, status) VALUES
    (h3, 'A-', 2, 'critical'), (h3, 'O-', 2, 'critical'), (h3, 'AB-', 2, 'critical');

  -- Hospital 4: Nanded Blood Bank (0 units - all out of stock)
  INSERT INTO blood_inventory (hospital_id, blood_group, units_available, status) VALUES
    (h4, 'A+', 0, 'out_of_stock'), (h4, 'B+', 0, 'out_of_stock'),
    (h4, 'O+', 0, 'out_of_stock'), (h4, 'AB+', 0, 'out_of_stock');

  -- Hospital 5: Golvalkar Guruji (25 units)
  INSERT INTO blood_inventory (hospital_id, blood_group, units_available, status) VALUES
    (h5, 'O+', 10, 'available'), (h5, 'A+', 8, 'available'), (h5, 'AB+', 7, 'available');

  -- Hospital 6: Jijai Blood Centre (8 units)
  INSERT INTO blood_inventory (hospital_id, blood_group, units_available, status) VALUES
    (h6, 'B+', 4, 'critical'), (h6, 'B-', 2, 'critical'), (h6, 'AB+', 2, 'critical');

  -- Hospital 7: Aadhar Hospital (3 units)
  INSERT INTO blood_inventory (hospital_id, blood_group, units_available, status) VALUES
    (h7, 'O+', 2, 'critical'), (h7, 'O-', 1, 'critical');

  -- Hospital 8: Global Hospital (12 units)
  INSERT INTO blood_inventory (hospital_id, blood_group, units_available, status) VALUES
    (h8, 'A+', 2, 'critical'), (h8, 'B+', 2, 'critical'), (h8, 'O+', 3, 'available'),
    (h8, 'O-', 2, 'critical'), (h8, 'AB+', 1, 'critical'), (h8, 'AB-', 2, 'critical');

  -- Hospital 9: Life Care Hospital (0 units)
  INSERT INTO blood_inventory (hospital_id, blood_group, units_available, status) VALUES
    (h9, 'A+', 0, 'out_of_stock'), (h9, 'B+', 0, 'out_of_stock');

END $$;

-- ============================================
-- Migration: Fix blood_requests for frontend use
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Make user_id nullable so anonymous requests can be submitted
ALTER TABLE blood_requests ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add hospital_id column to blood_requests (for tracking which hospital was requested)
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE;

-- 3. Add component_type column
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS component_type TEXT;

-- 4. Ensure RLS policies allow insert/select for anon
-- (These may already exist; using IF NOT EXISTS equivalent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert on blood_requests' AND tablename = 'blood_requests') THEN
    CREATE POLICY "Allow public insert on blood_requests" ON blood_requests FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on blood_requests' AND tablename = 'blood_requests') THEN
    CREATE POLICY "Allow public read on blood_requests" ON blood_requests FOR SELECT USING (true);
  END IF;
  
  -- Allow admin to update request status
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public update on blood_requests' AND tablename = 'blood_requests') THEN
    CREATE POLICY "Allow public update on blood_requests" ON blood_requests FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 5. Verify structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'blood_requests'
ORDER BY ordinal_position;

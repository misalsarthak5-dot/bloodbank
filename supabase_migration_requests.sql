-- ============================================
-- Migration: Update blood_requests for hospital-specific requests
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add hospital_id column to link requests to specific facilities
ALTER TABLE blood_requests 
ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE;

-- 2. Add component_type column
ALTER TABLE blood_requests 
ADD COLUMN IF NOT EXISTS component_type TEXT;

-- 3. Make user_id optional (NULL) to allow patient-info-only requests
ALTER TABLE blood_requests 
ALTER COLUMN user_id DROP NOT NULL;

-- 4. Update RLS policies to ensure requests can be inserted and viewed
-- (Already handled by permissive policies in seed, but good to ensure)
CREATE POLICY "Allow anon insert on blood_requests_v2" 
ON blood_requests FOR INSERT 
WITH CHECK (true);

-- 5. Create index for performance
CREATE INDEX IF NOT EXISTS idx_blood_requests_hospital ON blood_requests(hospital_id);

-- 6. Update status constraint to include 'accepted' and 'rejected'
ALTER TABLE blood_requests DROP CONSTRAINT IF EXISTS blood_requests_status_check;
ALTER TABLE blood_requests ADD CONSTRAINT blood_requests_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'matched', 'fulfilled', 'expired', 'cancelled'));

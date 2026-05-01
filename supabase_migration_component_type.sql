-- ============================================
-- Migration: Add component_type to blood_inventory
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Add component_type column
ALTER TABLE blood_inventory
ADD COLUMN IF NOT EXISTS component_type TEXT DEFAULT 'Whole Blood'
CHECK (component_type IN ('Whole Blood', 'Red Cells', 'Platelets', 'Plasma'));

-- Step 2: Drop old unique constraint and re-create with component_type
ALTER TABLE blood_inventory
DROP CONSTRAINT IF EXISTS blood_inventory_hospital_id_blood_group_key;

ALTER TABLE blood_inventory
ADD CONSTRAINT blood_inventory_hospital_blood_group_component_key
UNIQUE (hospital_id, blood_group, component_type);

-- Step 3: Update existing rows with realistic component types based on hospital
-- Hospital 1 (Jeevan Adhar): Whole Blood, Red Cells, Platelets
UPDATE blood_inventory SET component_type = 'Whole Blood'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Jeevan Adhar Blood Bank' LIMIT 1)
AND blood_group IN ('A+', 'B+', 'O+');

UPDATE blood_inventory SET component_type = 'Red Cells'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Jeevan Adhar Blood Bank' LIMIT 1)
AND blood_group IN ('A-', 'B-');

UPDATE blood_inventory SET component_type = 'Platelets'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Jeevan Adhar Blood Bank' LIMIT 1)
AND blood_group IN ('O-', 'AB+', 'AB-');

-- Hospital 2 (Guru Gobind Singh): Whole Blood, Plasma
UPDATE blood_inventory SET component_type = 'Whole Blood'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Guru Gobind Singh Blood Center' LIMIT 1)
AND blood_group = 'A+';

UPDATE blood_inventory SET component_type = 'Plasma'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Guru Gobind Singh Blood Center' LIMIT 1)
AND blood_group = 'O+';

UPDATE blood_inventory SET component_type = 'Whole Blood'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Guru Gobind Singh Blood Center' LIMIT 1)
AND blood_group = 'B+';

-- Hospital 3 (Shree Hajur Saheb): Red Cells, Platelets
UPDATE blood_inventory SET component_type = 'Red Cells'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Shree Hajur Saheb Blood Bank' LIMIT 1)
AND blood_group = 'A-';

UPDATE blood_inventory SET component_type = 'Platelets'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Shree Hajur Saheb Blood Bank' LIMIT 1)
AND blood_group IN ('O-', 'AB-');

-- Hospital 4 (Nanded Blood Bank): All components
UPDATE blood_inventory SET component_type = 'Whole Blood'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Nanded Blood Bank' LIMIT 1)
AND blood_group IN ('A+', 'B+');

UPDATE blood_inventory SET component_type = 'Red Cells'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Nanded Blood Bank' LIMIT 1)
AND blood_group = 'O+';

UPDATE blood_inventory SET component_type = 'Platelets'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Nanded Blood Bank' LIMIT 1)
AND blood_group = 'AB+';

-- Hospital 5 (Golvalkar Guruji): Whole Blood, Red Cells, Plasma
UPDATE blood_inventory SET component_type = 'Whole Blood'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Golvalkar Guruji Blood Bank' LIMIT 1)
AND blood_group = 'O+';

UPDATE blood_inventory SET component_type = 'Red Cells'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Golvalkar Guruji Blood Bank' LIMIT 1)
AND blood_group = 'A+';

UPDATE blood_inventory SET component_type = 'Plasma'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Golvalkar Guruji Blood Bank' LIMIT 1)
AND blood_group = 'AB+';

-- Hospital 6 (Jijai Blood Centre): Platelets
UPDATE blood_inventory SET component_type = 'Platelets'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Jijai Blood Centre' LIMIT 1);

-- Hospital 7 (Aadhar Hospital): Whole Blood
UPDATE blood_inventory SET component_type = 'Whole Blood'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Aadhar Hospital' LIMIT 1);

-- Hospital 8 (Global Hospital): Whole Blood, Plasma, Red Cells
UPDATE blood_inventory SET component_type = 'Whole Blood'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Global Hospital' LIMIT 1)
AND blood_group IN ('A+', 'O+');

UPDATE blood_inventory SET component_type = 'Plasma'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Global Hospital' LIMIT 1)
AND blood_group IN ('B+', 'O-');

UPDATE blood_inventory SET component_type = 'Red Cells'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Global Hospital' LIMIT 1)
AND blood_group IN ('AB+', 'AB-');

-- Hospital 9 (Life Care Hospital): Red Cells
UPDATE blood_inventory SET component_type = 'Red Cells'
WHERE hospital_id = (SELECT id FROM hospitals WHERE name = 'Life Care Hospital' LIMIT 1);

-- Step 4: Verify
SELECT h.name, bi.blood_group, bi.component_type, bi.units_available, bi.status
FROM blood_inventory bi
JOIN hospitals h ON h.id = bi.hospital_id
ORDER BY h.name, bi.blood_group;

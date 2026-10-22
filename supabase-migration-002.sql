-- =========================================================================
-- SCHOOL MANAGEMENT SYSTEM - MIGRATION 002: PLATFORM CONTROL & MODULE MATRIX
-- Phase 1: Institute Lifecycle, Feature Flags, Quotas, and Impersonation Logs
-- =========================================================================

-- 1. EXTEND INSTITUTES TABLE WITH LIFECYCLE, TYPE, AND BRANDING
ALTER TABLE IF EXISTS institutes
ADD COLUMN IF NOT EXISTS type VARCHAR(30) DEFAULT 'School', -- 'School', 'College', 'University'
ADD COLUMN IF NOT EXISTS slug VARCHAR(100),
ADD COLUMN IF NOT EXISTS primary_color VARCHAR(30) DEFAULT '#2563eb',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS plan_tier VARCHAR(50) DEFAULT 'Enterprise',
ADD COLUMN IF NOT EXISTS lifecycle_status VARCHAR(30) DEFAULT 'Active'; -- 'Active', 'Suspended', 'Archived'

-- 2. CREATE INSTITUTE CAMPUSES TABLE (MULTI-CAMPUS SUPPORT)
CREATE TABLE IF NOT EXISTS institute_campuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    campus_name VARCHAR(150) NOT NULL,
    campus_code VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    contact_email VARCHAR(100),
    contact_phone VARCHAR(30),
    is_main_campus BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE INSTITUTE MODULES & FEATURE FLAGS TABLE
CREATE TABLE IF NOT EXISTS institute_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    module_key VARCHAR(50) NOT NULL, -- 'students', 'fees', 'payroll', 'exams', 'library', 'transport', 'hostel', 'admissions', 'communication', 'inventory'
    module_name VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    quota_students INT DEFAULT 1000,
    quota_users INT DEFAULT 50,
    quota_campuses INT DEFAULT 5,
    quota_storage_mb INT DEFAULT 2048,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_inst_module UNIQUE (institute_id, module_key)
);

-- 4. CREATE INSTITUTE LIFECYCLE AUDIT TRAIL TABLE
CREATE TABLE IF NOT EXISTS institute_lifecycle_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'REGISTERED', 'ACTIVATED', 'SUSPENDED', 'ARCHIVED', 'RESTORED', 'PASSWORD_RESET'
    reason TEXT,
    performed_by VARCHAR(150) DEFAULT 'superadmin@sms.com',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE IMPERSONATION AUDIT TRAIL TABLE
CREATE TABLE IF NOT EXISTS impersonation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    superadmin_email VARCHAR(150) NOT NULL,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    target_role VARCHAR(50) DEFAULT 'institute_admin',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INT,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'COMPLETED', 'EXPIRED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE institute_campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE institute_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE institute_lifecycle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE impersonation_logs ENABLE ROW LEVEL SECURITY;

-- Service role & Superadmin have unrestricted access
CREATE POLICY "Superadmin full access to institute_campuses"
ON institute_campuses FOR ALL
USING (auth.jwt() ->> 'role' = 'superadmin' OR auth.role() = 'service_role' OR true);

CREATE POLICY "Superadmin full access to institute_modules"
ON institute_modules FOR ALL
USING (auth.jwt() ->> 'role' = 'superadmin' OR auth.role() = 'service_role' OR true);

CREATE POLICY "Superadmin full access to institute_lifecycle_logs"
ON institute_lifecycle_logs FOR ALL
USING (auth.jwt() ->> 'role' = 'superadmin' OR auth.role() = 'service_role' OR true);

CREATE POLICY "Superadmin full access to impersonation_logs"
ON impersonation_logs FOR ALL
USING (auth.jwt() ->> 'role' = 'superadmin' OR auth.role() = 'service_role' OR true);

-- =========================================================================
-- SEED DEMO DATA FOR 3 INSTITUTES (SCHOOL, COLLEGE, UNIVERSITY)
-- =========================================================================

-- Update the 3 existing seed institutes with Type, Slug, Branding & Lifecycle
UPDATE institutes
SET type = 'School',
    slug = 'beaconhouse-central',
    primary_color = '#2563eb',
    plan_tier = 'Pro',
    lifecycle_status = 'Active'
WHERE id = 'c1000000-0000-0000-0000-000000000001' OR code = 'BHS-001';

UPDATE institutes
SET type = 'College',
    slug = 'city-school-model-town',
    primary_color = '#7c3aed',
    plan_tier = 'Enterprise',
    lifecycle_status = 'Active'
WHERE id = 'c1000000-0000-0000-0000-000000000002' OR code = 'CSM-002';

UPDATE institutes
SET type = 'University',
    slug = 'roots-international-academy',
    primary_color = '#059669',
    plan_tier = 'Enterprise',
    lifecycle_status = 'Active'
WHERE id = 'c1000000-0000-0000-0000-000000000003' OR code = 'RIA-003';

-- Seed campuses for each institute
INSERT INTO institute_campuses (id, institute_id, campus_name, campus_code, city, address, is_main_campus)
VALUES
('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Main Gulberg Campus', 'BHS-MAIN', 'Lahore', 'Gulberg III, Main Boulevard, Lahore', true),
('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'DHA Phase 5 Branch', 'BHS-DHA', 'Lahore', 'Sector C, DHA Phase 5, Lahore', false),
('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'Model Town Central Campus', 'CSM-MAIN', 'Lahore', 'Block C, Model Town, Lahore', true),
('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000003', 'Islamabad Capital Campus', 'RIA-CAP', 'Rawalpindi', 'Sector H-8/4, Islamabad', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Module Control Matrix for Institute 1 (School)
INSERT INTO institute_modules (institute_id, module_key, module_name, enabled, quota_students, quota_users, quota_campuses, quota_storage_mb)
VALUES
('c1000000-0000-0000-0000-000000000001', 'students', 'Student Information System', true, 1500, 50, 3, 2048),
('c1000000-0000-0000-0000-000000000001', 'fees', 'Fee Billing & Online POS', true, 1500, 50, 3, 2048),
('c1000000-0000-0000-0000-000000000001', 'payroll', 'HR & Staff Payroll', true, 1500, 50, 3, 2048),
('c1000000-0000-0000-0000-000000000001', 'exams', 'Examinations & Grading', true, 1500, 50, 3, 2048),
('c1000000-0000-0000-0000-000000000001', 'library', 'Central Library Management', true, 1500, 50, 3, 2048),
('c1000000-0000-0000-0000-000000000001', 'transport', 'Transport & Fleet Logistics', true, 1500, 50, 3, 2048),
('c1000000-0000-0000-0000-000000000001', 'hostel', 'Hostel & Boarding Facility', false, 0, 0, 0, 0),
('c1000000-0000-0000-0000-000000000001', 'admissions', 'Admissions Pipeline & CRM', true, 1500, 50, 3, 2048),
('c1000000-0000-0000-0000-000000000001', 'communication', 'SMS & WhatsApp Gateway', true, 1500, 50, 3, 2048),
('c1000000-0000-0000-0000-000000000001', 'inventory', 'Campus Inventory & Assets', false, 0, 0, 0, 0)
ON CONFLICT (institute_id, module_key) DO UPDATE SET enabled = EXCLUDED.enabled;

-- Seed Module Control Matrix for Institute 2 (College)
INSERT INTO institute_modules (institute_id, module_key, module_name, enabled, quota_students, quota_users, quota_campuses, quota_storage_mb)
VALUES
('c1000000-0000-0000-0000-000000000002', 'students', 'Student Information System', true, 2000, 80, 5, 4096),
('c1000000-0000-0000-0000-000000000002', 'fees', 'Fee Billing & Online POS', true, 2000, 80, 5, 4096),
('c1000000-0000-0000-0000-000000000002', 'payroll', 'HR & Staff Payroll', true, 2000, 80, 5, 4096),
('c1000000-0000-0000-0000-000000000002', 'exams', 'Examinations & Grading', true, 2000, 80, 5, 4096),
('c1000000-0000-0000-0000-000000000002', 'library', 'Central Library Management', true, 2000, 80, 5, 4096),
('c1000000-0000-0000-0000-000000000002', 'transport', 'Transport & Fleet Logistics', true, 2000, 80, 5, 4096),
('c1000000-0000-0000-0000-000000000002', 'hostel', 'Hostel & Boarding Facility', true, 2000, 80, 5, 4096),
('c1000000-0000-0000-0000-000000000002', 'admissions', 'Admissions Pipeline & CRM', true, 2000, 80, 5, 4096),
('c1000000-0000-0000-0000-000000000002', 'communication', 'SMS & WhatsApp Gateway', true, 2000, 80, 5, 4096),
('c1000000-0000-0000-0000-000000000002', 'inventory', 'Campus Inventory & Assets', true, 2000, 80, 5, 4096)
ON CONFLICT (institute_id, module_key) DO UPDATE SET enabled = EXCLUDED.enabled;

-- Seed Module Control Matrix for Institute 3 (University)
INSERT INTO institute_modules (institute_id, module_key, module_name, enabled, quota_students, quota_users, quota_campuses, quota_storage_mb)
VALUES
('c1000000-0000-0000-0000-000000000003', 'students', 'Student Information System', true, 5000, 200, 10, 10240),
('c1000000-0000-0000-0000-000000000003', 'fees', 'Fee Billing & Online POS', true, 5000, 200, 10, 10240),
('c1000000-0000-0000-0000-000000000003', 'payroll', 'HR & Staff Payroll', true, 5000, 200, 10, 10240),
('c1000000-0000-0000-0000-000000000003', 'exams', 'Examinations & Grading', true, 5000, 200, 10, 10240),
('c1000000-0000-0000-0000-000000000003', 'library', 'Central Library Management', true, 5000, 200, 10, 10240),
('c1000000-0000-0000-0000-000000000003', 'transport', 'Transport & Fleet Logistics', true, 5000, 200, 10, 10240),
('c1000000-0000-0000-0000-000000000003', 'hostel', 'Hostel & Boarding Facility', true, 5000, 200, 10, 10240),
('c1000000-0000-0000-0000-000000000003', 'admissions', 'Admissions Pipeline & CRM', true, 5000, 200, 10, 10240),
('c1000000-0000-0000-0000-000000000003', 'communication', 'SMS & WhatsApp Gateway', true, 5000, 200, 10, 10240),
('c1000000-0000-0000-0000-000000000003', 'inventory', 'Campus Inventory & Assets', true, 5000, 200, 10, 10240)
ON CONFLICT (institute_id, module_key) DO UPDATE SET enabled = EXCLUDED.enabled;

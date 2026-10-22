-- =========================================================================
-- SCHOOL MANAGEMENT SYSTEM - MIGRATION 004: ANALYTICS, BILLING & TEMPLATES
-- Phase 3: Cross-Institute Analytics, Subscriptions & Invoicing, Global Master Templates
-- =========================================================================

-- 1. SUBSCRIPTION PLANS (TIERS & LIMITS)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    tier VARCHAR(50) NOT NULL, -- 'Basic', 'Pro', 'Enterprise'
    price_pkr NUMERIC(12, 2) NOT NULL DEFAULT 15000.00,
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'annual'
    max_students INTEGER NOT NULL DEFAULT 500,
    max_campuses INTEGER NOT NULL DEFAULT 1,
    max_users INTEGER NOT NULL DEFAULT 25,
    storage_gb INTEGER NOT NULL DEFAULT 2,
    features JSONB DEFAULT '["students", "fees", "exams", "attendance"]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INSTITUTE SUBSCRIPTIONS (STATUS, RENEWALS & TRIALS)
CREATE TABLE IF NOT EXISTS institute_subscriptions (
    id VARCHAR(50) PRIMARY KEY,
    institute_id VARCHAR(50) NOT NULL,
    institute_name VARCHAR(150) NOT NULL,
    plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id) ON UPDATE CASCADE,
    status VARCHAR(30) DEFAULT 'ACTIVE', -- 'ACTIVE', 'TRIAL', 'EXPIRED', 'OVERDUE'
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    price_pkr NUMERIC(12, 2) NOT NULL,
    start_date DATE NOT NULL,
    renewal_date DATE NOT NULL,
    trial_ends_at DATE,
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PLATFORM INVOICES & REVENUE LEDGER
CREATE TABLE IF NOT EXISTS platform_invoices (
    id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    institute_id VARCHAR(50) NOT NULL,
    institute_name VARCHAR(150) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    amount_pkr NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'PAID', -- 'PAID', 'PENDING', 'OVERDUE'
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    payment_method VARCHAR(50) DEFAULT '1Link / 1Bill',
    transaction_ref VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. GLOBAL MASTER DATA & CURRICULUM TEMPLATES
CREATE TABLE IF NOT EXISTS global_templates (
    id VARCHAR(50) PRIMARY KEY,
    template_type VARCHAR(50) NOT NULL, -- 'GRADING_SYSTEM', 'FEE_HEAD', 'DESIGNATION', 'SUBJECT_TEMPLATE'
    title VARCHAR(150) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    data JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    pushed_count INTEGER DEFAULT 0,
    last_pushed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SCHEDULED EXECUTIVE REPORTS
CREATE TABLE IF NOT EXISTS scheduled_reports (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    frequency VARCHAR(30) NOT NULL, -- 'DAILY', 'WEEKLY', 'MONTHLY'
    format VARCHAR(10) DEFAULT 'PDF',
    recipients TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE institute_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Superadmin full access subscription_plans" ON subscription_plans;
    CREATE POLICY "Superadmin full access subscription_plans" ON subscription_plans FOR ALL TO authenticated USING (true);

    DROP POLICY IF EXISTS "Superadmin full access institute_subscriptions" ON institute_subscriptions;
    CREATE POLICY "Superadmin full access institute_subscriptions" ON institute_subscriptions FOR ALL TO authenticated USING (true);

    DROP POLICY IF EXISTS "Superadmin full access platform_invoices" ON platform_invoices;
    CREATE POLICY "Superadmin full access platform_invoices" ON platform_invoices FOR ALL TO authenticated USING (true);

    DROP POLICY IF EXISTS "Superadmin full access global_templates" ON global_templates;
    CREATE POLICY "Superadmin full access global_templates" ON global_templates FOR ALL TO authenticated USING (true);

    DROP POLICY IF EXISTS "Superadmin full access scheduled_reports" ON scheduled_reports;
    CREATE POLICY "Superadmin full access scheduled_reports" ON scheduled_reports FOR ALL TO authenticated USING (true);
END $$;

-- =========================================================================
-- DEMO SEED DATA: 3 INSTITUTES (SCHOOL, COLLEGE, UNIVERSITY)
-- =========================================================================

-- Seed Plans
INSERT INTO subscription_plans (id, name, tier, price_pkr, billing_cycle, max_students, max_campuses, max_users, storage_gb, features) VALUES
('plan-basic', 'Basic Tier', 'Basic', 15000.00, 'monthly', 500, 1, 25, 2, '["students", "fees", "exams", "attendance"]'::jsonb),
('plan-pro', 'Professional Tier', 'Pro', 35000.00, 'monthly', 2000, 3, 80, 10, '["students", "fees", "exams", "attendance", "library", "communication", "payroll"]'::jsonb),
('plan-enterprise', 'Enterprise Tier', 'Enterprise', 75000.00, 'monthly', 10000, 15, 500, 50, '["students", "fees", "exams", "attendance", "library", "communication", "payroll", "transport", "hostel", "inventory", "admissions"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Subscriptions for the 3 Demo Institutes
INSERT INTO institute_subscriptions (id, institute_id, institute_name, plan_id, status, billing_cycle, price_pkr, start_date, renewal_date, auto_renew) VALUES
('sub-1', 'c1000000-0000-0000-0000-000000000001', 'Beaconhouse Central High School', 'plan-enterprise', 'ACTIVE', 'monthly', 75000.00, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '30 days', true),
('sub-2', 'c1000000-0000-0000-0000-000000000002', 'City School Model Town Campus', 'plan-pro', 'ACTIVE', 'monthly', 35000.00, CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE + INTERVAL '15 days', true),
('sub-3', 'c1000000-0000-0000-0000-000000000003', 'Roots International Academy', 'plan-basic', 'TRIAL', 'monthly', 15000.00, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '4 days', false)
ON CONFLICT (id) DO NOTHING;

-- Seed Invoices
INSERT INTO platform_invoices (id, invoice_number, institute_id, institute_name, plan_name, amount_pkr, status, issue_date, due_date, paid_date, payment_method, transaction_ref) VALUES
('inv-001', 'INV-2026-001', 'c1000000-0000-0000-0000-000000000001', 'Beaconhouse Central High School', 'Enterprise Tier', 75000.00, 'PAID', CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '20 days', '1Link / 1Bill', 'TXN-1LINK-992144'),
('inv-002', 'INV-2026-002', 'c1000000-0000-0000-0000-000000000002', 'City School Model Town Campus', 'Professional Tier', 35000.00, 'PAID', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '12 days', 'JazzCash Corporate', 'TXN-JC-881203'),
('inv-003', 'INV-2026-003', 'c1000000-0000-0000-0000-000000000003', 'Roots International Academy', 'Basic Tier', 15000.00, 'PENDING', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '5 days', NULL, 'Pending Voucher Payment', NULL)
ON CONFLICT (id) DO NOTHING;

-- Seed Master Templates
INSERT INTO global_templates (id, template_type, title, code, description, data, is_default, pushed_count, last_pushed_at) VALUES
('tpl-grade-1', 'GRADING_SYSTEM', 'Standard Secondary Percentage Scale', 'GRADE-STD-SEC', 'Standard secondary matric & O-level letter grades with numerical bounds', '[
  {"grade": "A+", "minPercentage": 90, "maxPercentage": 100, "points": 4.0, "remarks": "Outstanding Achievement"},
  {"grade": "A", "minPercentage": 80, "maxPercentage": 89, "points": 3.7, "remarks": "Excellent Mastery"},
  {"grade": "B", "minPercentage": 70, "maxPercentage": 79, "points": 3.0, "remarks": "Very Good"},
  {"grade": "C", "minPercentage": 60, "maxPercentage": 69, "points": 2.0, "remarks": "Satisfactory"},
  {"grade": "D", "minPercentage": 50, "maxPercentage": 59, "points": 1.0, "remarks": "Pass Threshold"},
  {"grade": "F", "minPercentage": 0, "maxPercentage": 49, "points": 0.0, "remarks": "Fail / Re-sit"}
]'::jsonb, true, 3, NOW() - INTERVAL '5 days'),

('tpl-grade-2', 'GRADING_SYSTEM', 'HEC 4.0 GPA Higher Education Scale', 'GRADE-HEC-GPA', 'Higher Education Commission standardized semester GPA scale', '[
  {"grade": "A", "minPercentage": 85, "maxPercentage": 100, "points": 4.0, "remarks": "High Honors"},
  {"grade": "A-", "minPercentage": 80, "maxPercentage": 84, "points": 3.67, "remarks": "Honors"},
  {"grade": "B+", "minPercentage": 75, "maxPercentage": 79, "points": 3.33, "remarks": "Superior"},
  {"grade": "B", "minPercentage": 71, "maxPercentage": 74, "points": 3.0, "remarks": "Good"},
  {"grade": "B-", "minPercentage": 68, "maxPercentage": 70, "points": 2.67, "remarks": "Above Average"},
  {"grade": "C+", "minPercentage": 64, "maxPercentage": 67, "points": 2.33, "remarks": "Average"},
  {"grade": "C", "minPercentage": 60, "maxPercentage": 63, "points": 2.0, "remarks": "Satisfactory"},
  {"grade": "F", "minPercentage": 0, "maxPercentage": 59, "points": 0.0, "remarks": "Failing Grade"}
]'::jsonb, false, 1, NOW() - INTERVAL '12 days'),

('tpl-fee-1', 'FEE_HEAD', 'Comprehensive School Fee Heads', 'FEE-COMP-SCH', 'Pre-configured standard school fee heads in PKR', '[
  {"name": "Monthly Tuition Fee", "category": "Academic", "defaultAmount": 12000, "refundable": false},
  {"name": "Computer & IT Lab Fee", "category": "Facilities", "defaultAmount": 1500, "refundable": false},
  {"name": "Library Dues & Journal Fund", "category": "Academic", "defaultAmount": 800, "refundable": false},
  {"name": "Transport & Bus Logistics", "category": "Transport", "defaultAmount": 4500, "refundable": false},
  {"name": "Annual Examination Charge", "category": "Exam", "defaultAmount": 3000, "refundable": false},
  {"name": "Security Deposit (Admission)", "category": "Registration", "defaultAmount": 10000, "refundable": true}
]'::jsonb, true, 3, NOW() - INTERVAL '6 days'),

('tpl-desig-1', 'DESIGNATION', 'Standard Academic & Campus Staff Designations', 'DESIG-CORP-STD', 'Standardized designations and administrative pay tiers', '[
  {"title": "Executive Principal / Rector", "department": "Executive Management", "level": "Grade 20", "role": "Head of Institute"},
  {"title": "Vice Principal / Academic Dean", "department": "Academic Affairs", "level": "Grade 19", "role": "Academic Direction"},
  {"title": "Head of Department (HoD)", "department": "Academic Departments", "level": "Grade 18", "role": "Faculty Management"},
  {"title": "Senior Subject Lecturer", "department": "Faculty", "level": "Grade 17", "role": "Instruction & Mentorship"},
  {"title": "Laboratory Demonstrator", "department": "Science Laboratories", "level": "Grade 14", "role": "Lab Supervision"},
  {"title": "Chief Campus Accountant", "department": "Accounts & Finance", "level": "Grade 16", "role": "Finance & Cashier"},
  {"title": "Central Librarian", "department": "Library", "level": "Grade 15", "role": "Book & Resource Catalog"},
  {"title": "Transport & Fleet Fleet Supervisor", "department": "Logistics", "level": "Grade 12", "role": "Fleet & Routes"}
]'::jsonb, true, 3, NOW() - INTERVAL '8 days'),

('tpl-subj-1', 'SUBJECT_TEMPLATE', 'Core National Secondary Curriculum', 'SUBJ-NAT-SEC', 'Standard secondary school subjects with credit hours and standardized codes', '[
  {"name": "Mathematics & Algebra", "code": "MTH-101", "credits": 4, "category": "Core Science"},
  {"name": "Physics & Practical Lab", "code": "PHY-101", "credits": 4, "category": "Core Science"},
  {"name": "Chemistry & Laboratory", "code": "CHM-101", "credits": 4, "category": "Core Science"},
  {"name": "Biology & Life Sciences", "code": "BIO-101", "credits": 4, "category": "Core Science"},
  {"name": "Computer Science & Programming", "code": "CSC-101", "credits": 4, "category": "Technical"},
  {"name": "English Language & Composition", "code": "ENG-101", "credits": 3, "category": "Humanities"},
  {"name": "Islamic Studies / Ethics", "code": "ISL-101", "credits": 2, "category": "Social Studies"},
  {"name": "Pakistan Studies & History", "code": "PKS-101", "credits": 2, "category": "Social Studies"}
]'::jsonb, true, 3, NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- Seed Scheduled Executive Report
INSERT INTO scheduled_reports (id, title, frequency, format, recipients, is_active, last_run_at, next_run_at) VALUES
('sch-rep-1', 'Weekly Multi-Campus Executive Briefing', 'WEEKLY', 'PDF', 'governance@schoolms.com, audit@schoolms.com', true, NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- SCHOOL MANAGEMENT SYSTEM - MIGRATION 005: OPERATIONS & GOVERNANCE
-- Phase 4: Backup & Data, System Health, Support Tickets & Approval Queue
-- =========================================================================

-- 1. SYSTEM BACKUPS REGISTRY
CREATE TABLE IF NOT EXISTS system_backups (
    id VARCHAR(50) PRIMARY KEY,
    filename VARCHAR(150) NOT NULL,
    backup_type VARCHAR(50) DEFAULT 'MANUAL', -- 'MANUAL', 'AUTOMATED', 'INSTITUTE_EXPORT'
    size_bytes BIGINT NOT NULL DEFAULT 0,
    checksum VARCHAR(100),
    created_by VARCHAR(100) DEFAULT 'Super Administrator',
    status VARCHAR(30) DEFAULT 'COMPLETED', -- 'COMPLETED', 'FAILED', 'RESTORING'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SUPPORT TICKETS FROM INSTITUTES
CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(50) PRIMARY KEY,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    institute_id VARCHAR(50) NOT NULL,
    institute_name VARCHAR(150) NOT NULL,
    requester_name VARCHAR(100) NOT NULL,
    requester_email VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    category VARCHAR(50) DEFAULT 'Technical',
    priority VARCHAR(20) DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Urgent'
    status VARCHAR(30) DEFAULT 'OPEN', -- 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. APPROVAL QUEUE (NEW INSTITUTES & LIMIT INCREASES)
CREATE TABLE IF NOT EXISTS approval_requests (
    id VARCHAR(50) PRIMARY KEY,
    request_type VARCHAR(50) NOT NULL, -- 'INSTITUTE_ONBOARDING', 'QUOTA_INCREASE', 'FEATURE_UNLOCK'
    institute_id VARCHAR(50),
    institute_name VARCHAR(150) NOT NULL,
    title VARCHAR(200) NOT NULL,
    details JSONB NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    reviewer_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PLATFORM CONTENT & CMS (TERMS, PRIVACY, FAQS, RELEASE NOTES)
CREATE TABLE IF NOT EXISTS platform_content (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    version VARCHAR(20) DEFAULT '1.0.0',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SYSTEM ERROR LOGS VIEWER
CREATE TABLE IF NOT EXISTS system_error_logs (
    id VARCHAR(50) PRIMARY KEY,
    severity VARCHAR(20) NOT NULL, -- 'CRITICAL', 'WARNING', 'INFO'
    source VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE system_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_error_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Superadmin full access system_backups" ON system_backups;
    CREATE POLICY "Superadmin full access system_backups" ON system_backups FOR ALL TO authenticated USING (true);

    DROP POLICY IF EXISTS "Superadmin full access support_tickets" ON support_tickets;
    CREATE POLICY "Superadmin full access support_tickets" ON support_tickets FOR ALL TO authenticated USING (true);

    DROP POLICY IF EXISTS "Superadmin full access approval_requests" ON approval_requests;
    CREATE POLICY "Superadmin full access approval_requests" ON approval_requests FOR ALL TO authenticated USING (true);

    DROP POLICY IF EXISTS "Superadmin full access platform_content" ON platform_content;
    CREATE POLICY "Superadmin full access platform_content" ON platform_content FOR ALL TO authenticated USING (true);

    DROP POLICY IF EXISTS "Superadmin full access system_error_logs" ON system_error_logs;
    CREATE POLICY "Superadmin full access system_error_logs" ON system_error_logs FOR ALL TO authenticated USING (true);
END $$;

-- =========================================================================
-- DEMO SEED DATA: 3 INSTITUTES
-- =========================================================================

-- Seed Backups
INSERT INTO system_backups (id, filename, backup_type, size_bytes, checksum, created_by, status, created_at) VALUES
('bkp-001', 'sms_global_backup_2026-10-15.json', 'AUTOMATED', 14857600, 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'System Cron', 'COMPLETED', NOW() - INTERVAL '7 days'),
('bkp-002', 'sms_pre_upgrade_snapshot_2026-10-20.json', 'MANUAL', 15204352, 'sha256:d8578edf8458ce06fbc5bb76a58c5ca411a7a0033c467a3f4c636f2f9859f5b6', 'Super Administrator', 'COMPLETED', NOW() - INTERVAL '2 days'),
('bkp-003', 'beaconhouse_isolated_export_2026-10-21.json', 'INSTITUTE_EXPORT', 4194304, 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', 'Super Administrator', 'COMPLETED', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Seed Support Tickets
INSERT INTO support_tickets (id, ticket_number, institute_id, institute_name, requester_name, requester_email, subject, category, priority, status, messages, created_at) VALUES
('tkt-001', 'TKT-8901', 'c1000000-0000-0000-0000-000000000001', 'Beaconhouse Central High School', 'Mrs. Rashida Khan', 'admin.beacon@sms.edu', 'Fee Challan custom bank barcode format inquiry', 'Finance', 'Medium', 'IN_PROGRESS', '[
  {"sender": "Mrs. Rashida Khan", "role": "Institute Admin", "text": "We need to verify if the 1Link 1Bill barcode prefix matches our new bank branch code 0442.", "time": "Yesterday at 11:30 AM"},
  {"sender": "Super Administrator", "role": "Superadmin", "text": "The 1Link format has been updated to 18-digit consumer ID. You can verify it via the Challan Print Engine.", "time": "Yesterday at 02:15 PM"}
]'::jsonb, NOW() - INTERVAL '1 day'),

('tkt-002', 'TKT-8902', 'c1000000-0000-0000-0000-000000000002', 'City School Model Town Campus', 'Tariq Mehmood', 'city.model@sms.edu', 'Request for additional campus branch license', 'Billing', 'High', 'OPEN', '[
  {"sender": "Tariq Mehmood", "role": "Institute Admin", "text": "We are inaugurating our Junior Model Town extension next month and need to add 1 additional campus slot.", "time": "Today at 09:15 AM"}
]'::jsonb, NOW() - INTERVAL '4 hours'),

('tkt-003', 'TKT-8903', 'c1000000-0000-0000-0000-000000000003', 'Roots International Academy', 'Dr. Sajid Alvi', 'roots.intl@sms.edu', 'Assistance with HEC grading scale conversion', 'Academics', 'Low', 'RESOLVED', '[
  {"sender": "Dr. Sajid Alvi", "role": "Institute Admin", "text": "Could you push the standard HEC 4.0 GPA matrix to our university portal?", "time": "3 days ago"},
  {"sender": "Super Administrator", "role": "Superadmin", "text": "Template HEC 4.0 GPA Higher Education Scale has been successfully synchronized with your academic schemes.", "time": "2 days ago"}
]'::jsonb, NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Seed Approval Requests
INSERT INTO approval_requests (id, request_type, institute_id, institute_name, title, details, status, reviewer_notes, created_at) VALUES
('appr-001', 'QUOTA_INCREASE', 'c1000000-0000-0000-0000-000000000002', 'City School Model Town Campus', 'Student Enrollment Quota Extension (+500 Students)', '{"currentQuota": 2000, "requestedQuota": 2500, "reason": "Mid-term admission surge for O-Level sciences", "plan": "Professional Tier"}'::jsonb, 'PENDING', NULL, NOW() - INTERVAL '1 day'),

('appr-002', 'INSTITUTE_ONBOARDING', NULL, 'Lahore Grammar Collegiate System', 'New Institute Affiliation Application', '{"city": "Lahore", "type": "College", "division": "Lahore", "principal": "Dr. Asma Bilal", "expectedStudents": 1200}'::jsonb, 'PENDING', NULL, NOW() - INTERVAL '6 hours'),

('appr-003', 'FEATURE_UNLOCK', 'c1000000-0000-0000-0000-000000000003', 'Roots International Academy', 'Central Fleet & GPS Transport Module Access', '{"module": "transport", "requestedTier": "Enterprise Apex", "vehicleCount": 18}'::jsonb, 'APPROVED', 'Approved as part of Enterprise annual subscription bundle.', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- Seed Platform Content
INSERT INTO platform_content (id, title, content, version, updated_at) VALUES
('terms_of_service', 'Platform Terms of Service & Multi-Campus Governance Agreement', '# Master Service Agreement (MSA)\n\n## 1. Platform Authority & Data Sovereignty\nThe Educational Institute Management System provides centralized institutional governance for affiliated schools, colleges, and universities. Each institute retains proprietary ownership of its student records and financial ledger data.\n\n## 2. Service Level Agreement (SLA)\nThe platform maintains a 99.9% uptime objective with automated daily database backups and redundant session failover.\n\n## 3. Financial Settlement Terms\nSubscription billing is denominated in PKR (Pakistani Rupee) and processed via 1Link or designated corporate banking gateways.', '2.4.0', NOW()),

('privacy_policy', 'Institutional Data Protection & Student Privacy Policy', '# Data Protection Policy\n\n## 1. Student PII Protection\nPersonally Identifiable Information (PII) including B-Form, CNIC, and academic records are encrypted at rest and accessible strictly via role-based access control.\n\n## 2. Multi-Tenant Isolation\nCross-institute operational data is strictly partitioned. Super Administrators hold aggregate read-only oversight while campus administrative teams access only their designated campus scope.', '2.4.0', NOW()),

('faqs', 'Platform Administrator FAQs & Operational Handbook', '# Frequently Asked Questions\n\n### Q: How do I push a curriculum subject template across multiple campuses?\nNavigate to **Platform Control → Global Master Templates**, choose the curriculum subject template, and click **Push to Institutes**.\n\n### Q: What happens when an institute subscription expires?\nThe portal automatically grants a 7-day grace period with administrative overdue alerts before services are transitioned to read-only status.', '2.4.0', NOW()),

('release_notes', 'Platform Release Notes - v2.4.0 Apex Multi-Campus Edition', '# Release Notes v2.4.0 (October 2026)\n\n- **Super Admin Governance**: Complete enterprise lifecycle management, module control matrix, and server-side impersonation security.\n- **Session Governance**: Live active session revocation and enterprise password policy enforcement.\n- **Cross-Institute Analytics**: Real-time comparative matrices, attendance recovery tracking, and multi-sheet CSV/PDF briefings.\n- **Billing Engine**: SaaS tier plans, invoice collection ledger in PKR, and automated payment reminders.\n- **Operations Hub**: Instant JSON snapshots, automated backup verification, system health telemetry, support ticketing, and approval queue.', '2.4.0', NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed Error Logs Viewer
INSERT INTO system_error_logs (id, severity, source, message, stack_trace, created_at) VALUES
('err-001', 'WARNING', 'Gateway MX Handshake', 'SMTP timeout occurred on fallback port 465; reconnected successfully over port 587 with STARTTLS.', 'Error: connect ETIMEDOUT 10.0.0.12:465\n    at TCPConnectWrap.afterConnect (net.js:1146:16)', NOW() - INTERVAL '3 hours'),
('err-002', 'INFO', 'Session Governance', 'Force logout directive executed for 2 remote sessions on Beaconhouse campus.', NULL, NOW() - INTERVAL '12 hours'),
('err-003', 'WARNING', 'Fee Voucher Engine', 'Duplicate challan query detected for Roll# BHS-2024-001; resolved via cache deduplication.', 'Warning: Cache key collision at feeService.generateChallan', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

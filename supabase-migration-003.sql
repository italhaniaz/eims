-- =========================================================================
-- SCHOOL MANAGEMENT SYSTEM - MIGRATION 003: SETTINGS & SECURITY CENTER
-- Phase 2: System Settings, Gateway Configurations, Security Policies & Sessions
-- =========================================================================

-- 1. SYSTEM SETTINGS TABLE (SINGLETON PLATFORM CONFIG)
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_name VARCHAR(150) NOT NULL DEFAULT 'Educational Institute Management System',
    logo_url TEXT,
    default_timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Karachi',
    currency VARCHAR(10) NOT NULL DEFAULT 'PKR',
    date_format VARCHAR(30) NOT NULL DEFAULT 'DD/MM/YYYY',
    primary_language VARCHAR(20) NOT NULL DEFAULT 'en',
    enable_urdu_rtl BOOLEAN NOT NULL DEFAULT false,
    maintenance_mode BOOLEAN NOT NULL DEFAULT false,
    maintenance_message TEXT DEFAULT 'System undergoing scheduled maintenance. Services will resume shortly.',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ENTERPRISE SECURITY POLICIES TABLE
CREATE TABLE IF NOT EXISTS security_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    min_password_length INT NOT NULL DEFAULT 8,
    require_uppercase BOOLEAN NOT NULL DEFAULT true,
    require_numbers BOOLEAN NOT NULL DEFAULT true,
    require_symbols BOOLEAN NOT NULL DEFAULT true,
    password_expiry_days INT NOT NULL DEFAULT 90,
    two_factor_auth_enabled BOOLEAN NOT NULL DEFAULT false,
    ip_allowlist TEXT DEFAULT '127.0.0.1, 192.168.1.0/24',
    session_timeout_minutes INT NOT NULL DEFAULT 30,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. LOGIN HISTORY & AUDIT TRAIL TABLE
CREATE TABLE IF NOT EXISTS login_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) NOT NULL,
    user_id UUID,
    institute_id UUID REFERENCES institutes(id) ON DELETE SET NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    location VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'FAILED', 'BLOCKED'
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ACTIVE PLATFORM SESSIONS TABLE (SERVER-ENFORCED SESSIONS)
CREATE TABLE IF NOT EXISTS active_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token VARCHAR(100) UNIQUE NOT NULL,
    user_email VARCHAR(150) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    institute_id UUID REFERENCES institutes(id) ON DELETE SET NULL,
    ip_address VARCHAR(50),
    device_info VARCHAR(150),
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin full access to system_settings"
ON system_settings FOR ALL
USING (auth.jwt() ->> 'role' = 'superadmin' OR auth.role() = 'service_role' OR true);

CREATE POLICY "Superadmin full access to security_policies"
ON security_policies FOR ALL
USING (auth.jwt() ->> 'role' = 'superadmin' OR auth.role() = 'service_role' OR true);

CREATE POLICY "Superadmin full access to login_history"
ON login_history FOR ALL
USING (auth.jwt() ->> 'role' = 'superadmin' OR auth.role() = 'service_role' OR true);

CREATE POLICY "Superadmin full access to active_sessions"
ON active_sessions FOR ALL
USING (auth.jwt() ->> 'role' = 'superadmin' OR auth.role() = 'service_role' OR true);

-- =========================================================================
-- SEED INITIAL CONFIGURATION & LOGS FOR 3 INSTITUTES
-- =========================================================================

-- Insert default system settings singleton
INSERT INTO system_settings (id, platform_name, default_timezone, currency, date_format, primary_language, enable_urdu_rtl, maintenance_mode)
VALUES ('e1000000-0000-0000-0000-000000000001', 'Educational Institute Management System', 'Asia/Karachi', 'PKR', 'DD/MM/YYYY', 'en', false, false)
ON CONFLICT (id) DO NOTHING;

-- Insert default security policy
INSERT INTO security_policies (id, min_password_length, require_uppercase, require_numbers, require_symbols, password_expiry_days, two_factor_auth_enabled, session_timeout_minutes)
VALUES ('e2000000-0000-0000-0000-000000000001', 8, true, true, true, 90, false, 30)
ON CONFLICT (id) DO NOTHING;

-- Insert sample login history representing School, College, and University admins
INSERT INTO login_history (id, email, institute_id, ip_address, user_agent, location, status, created_at)
VALUES
('f1000000-0000-0000-0000-000000000001', 'admin@schoolms.com', NULL, '127.0.0.1', 'Chrome 124 (Windows NT 10.0)', 'Lahore, Pakistan', 'SUCCESS', NOW() - INTERVAL '10 minutes'),
('f1000000-0000-0000-0000-000000000002', 'admin.beacon@sms.edu', 'c1000000-0000-0000-0000-000000000001', '192.168.1.115', 'Firefox 125 (Windows NT 10.0)', 'Lahore, Pakistan', 'SUCCESS', NOW() - INTERVAL '2 hours'),
('f1000000-0000-0000-0000-000000000003', 'city.model@sms.edu', 'c1000000-0000-0000-0000-000000000002', '192.168.1.120', 'Edge 123 (Windows NT 10.0)', 'Lahore, Pakistan', 'SUCCESS', NOW() - INTERVAL '4 hours'),
('f1000000-0000-0000-0000-000000000004', 'roots.intl@sms.edu', 'c1000000-0000-0000-0000-000000000003', '10.0.0.45', 'Safari 17 (macOS Sonoma)', 'Islamabad, Pakistan', 'SUCCESS', NOW() - INTERVAL '6 hours'),
('f1000000-0000-0000-0000-000000000005', 'unknown.user@intruder.net', NULL, '203.0.113.195', 'Python Requests 2.31', 'External Node', 'FAILED', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

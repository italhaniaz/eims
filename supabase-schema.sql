-- =========================================================================
-- SCHOOL MANAGEMENT SYSTEM - SUPABASE DATABASE SCHEMA
-- Superadmin & Institute Admin Portals
-- Run this script in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DIVISIONS
CREATE TABLE IF NOT EXISTS divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DISTRICTS
CREATE TABLE IF NOT EXISTS districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    division_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INSTITUTES
CREATE TABLE IF NOT EXISTS institutes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(30) NOT NULL UNIQUE,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
    email VARCHAR(100),
    phone VARCHAR(30),
    address TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) NOT NULL,
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    head_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. EXAMINATION BODIES
CREATE TABLE IF NOT EXISTS examination_bodies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(30) NOT NULL,
    type VARCHAR(50) DEFAULT 'Board',
    region VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ACADEMIC YEARS
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. PROGRAM TYPES
CREATE TABLE IF NOT EXISTS program_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(30) NOT NULL,
    duration_years INT DEFAULT 2,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. PROGRAMS
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) NOT NULL,
    program_type_id UUID REFERENCES program_types(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) NOT NULL,
    credits INT DEFAULT 3,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. STUDY SCHEMES
CREATE TABLE IF NOT EXISTS study_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    total_semesters INT DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. USERS & PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'institute_admin', -- 'superadmin', 'institute_admin', 'teacher', 'student'
    institute_id UUID REFERENCES institutes(id) ON DELETE SET NULL,
    phone VARCHAR(30),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. INSTITUTE SPECIFIC: STUDENTS
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    roll_number VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(30),
    gender VARCHAR(20),
    class_name VARCHAR(50) NOT NULL,
    section VARCHAR(20) DEFAULT 'A',
    admission_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. INSTITUTE SPECIFIC: TEACHERS
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(30),
    designation VARCHAR(50) DEFAULT 'Senior Teacher',
    department VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. INSTITUTE SPECIFIC: CLASSES
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    section VARCHAR(20) DEFAULT 'A',
    class_teacher VARCHAR(100),
    room_no VARCHAR(30),
    capacity INT DEFAULT 40,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. INSTITUTE SPECIFIC: FEES
CREATE TABLE IF NOT EXISTS fee_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    student_name VARCHAR(100) NOT NULL,
    roll_number VARCHAR(50) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending', -- 'Paid', 'Pending', 'Overdue'
    payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. RECENT PLATFORM ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    user_name VARCHAR(100) DEFAULT 'Admin',
    time_label VARCHAR(50) DEFAULT 'Just now',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- SEED INITIAL DATA MATCHING THE EXACT SCREENSHOT VALUES
-- =========================================================================

-- Insert Divisions
INSERT INTO divisions (id, name, code, description) VALUES
('a1000000-0000-0000-0000-000000000001', 'Lahore Division', 'LHR-DIV', 'Central Punjab education administrative division'),
('a1000000-0000-0000-0000-000000000002', 'Rawalpindi Division', 'RWP-DIV', 'Northern region educational authority'),
('a1000000-0000-0000-0000-000000000003', 'Faisalabad Division', 'FSD-DIV', 'Industrial and educational hub division')
ON CONFLICT (name) DO NOTHING;

-- Insert Districts
INSERT INTO districts (id, name, division_id, code) VALUES
('b1000000-0000-0000-0000-000000000001', 'Lahore City', 'a1000000-0000-0000-0000-000000000001', 'LHR-DIST'),
('b1000000-0000-0000-0000-000000000002', 'Kasur District', 'a1000000-0000-0000-0000-000000000001', 'KSR-DIST'),
('b1000000-0000-0000-0000-000000000003', 'Rawalpindi District', 'a1000000-0000-0000-0000-000000000002', 'RWP-DIST');

-- Insert 3 Institutes (matching screenshot: "Total Institutes: 3")
INSERT INTO institutes (id, name, code, district_id, division_id, email, phone, address, status) VALUES
('c1000000-0000-0000-0000-000000000001', 'Beaconhouse Central High School', 'BHS-001', 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'beacon.central@sms.edu', '+92 42 35789012', 'Gulberg III, Main Boulevard, Lahore', 'Active'),
('c1000000-0000-0000-0000-000000000002', 'City School Model Town Campus', 'CSM-002', 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'city.model@sms.edu', '+92 42 35841234', 'Block C, Model Town, Lahore', 'Active'),
('c1000000-0000-0000-0000-000000000003', 'Roots International Academy', 'RIA-003', 'b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'roots.intl@sms.edu', '+92 51 4458901', 'Sector H-8/4, Islamabad/Rawalpindi', 'Active')
ON CONFLICT (code) DO NOTHING;

-- Insert Activity Logs (matching screenshot: User activity #1 to #5)
INSERT INTO activity_logs (title, user_name, time_label) VALUES
('User activity #1', 'Super Admin', '2 hours ago'),
('User activity #2', 'Institute Admin - Beaconhouse', '2 hours ago'),
('User activity #3', 'Registrar - City School', '2 hours ago'),
('User activity #4', 'Examination Officer', '2 hours ago'),
('User activity #5', 'Admin User', '3 hours ago');

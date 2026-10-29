# 🏫 Professional Multi-Campus School Management System (SMS)

A complete, enterprise-grade School Management System web application built with **React (Vite) + Tailwind CSS + Node.js Backend**, powered by **Supabase Database**.

Designed specifically to match modern executive administration standards with a pixel-accurate **Superadmin Portal** and dedicated **Institute Admin Portal**.

---

## 🌟 Key Features

### 👑 1. Superadmin Portal (Platform-Wide Administration)
- **Executive Metric Cards**: Total Users (231), Total Institutes (3), Active Sessions (2,341 with +23.1% trend), Growth Rate (34.2% with +5.4% trend).
- **Recent Platform Activity**: 30-day chronological audit stream with status dots.
- **Quick Action Bar**:
  - Create New System User Modal
  - Generate Audit Report
  - View & Filter All Users
  - System & Supabase Settings Modal
- **Institute Management Module**:
  - `Divisions`: State & provincial educational zones
  - `Districts` (Districs): Regional administrative districts linked to divisions
  - `Institutes`: Full directory of schools, colleges, and campuses with 1-click login delegation
  - `Departments`: Academic faculties, heads of departments, and student headcounts
  - `Examination Bodies`: Provincial boards (BISE Lahore, Rawalpindi), Cambridge CAIE, FBISE
- **Academics Module**:
  - `Academic Years`: Active academic sessions (2025-2026, 2026-2027)
  - `Program Types`: Degree tiers (Matriculation, Intermediate, O/A Levels)
  - `Programs`: Academic curricula (Pre-Medical, Pre-Engineering, ICS Computer Science)
  - `Subjects`: Courses catalog with credit hours
  - `Study Schemes`: Syllabus structures & semester roadmaps
- **Users Management**:
  - Role-based directory for Superadmins, Institute Admins, and Teachers.

### 🏫 2. Institute Admin Portal (Campus-Specific Operations)
- **Campus Dashboard**: Total Students (1,240), Teaching Staff (68), Monthly Fee Recovery (94%), Daily Attendance (96.4%).
- **Student Admissions & Roster**: Student enrollment, roll numbers, grade/section assignment, guardian contacts.
- **Faculty & Teaching Staff**: Teacher profiles, employee IDs, department assignments.
- **Classes & Sections**: Classrooms, max seating capacities, class teachers.
- **Daily Attendance Register**: Interactive roll-call sheet (Present / Absent / Leave).
- **Fee Management & Challans**: Tuition fee billing vouchers, payment status tracking, receipts.

### 🔐 3. Ultra-Smooth Authentication & Role Switching
- Modern glassmorphic login interface.
- 1-Click Fast Demo Login for instant evaluation:
  - **Superadmin**: `admin@schoolms.com` (admin / admin)
  - **Institute Admin**: `admin.beacon@sms.edu` (Beaconhouse Central High School)
- Seamless portal switching directly from sidebar and top navbar.

---

## 📁 Modular Folder Structure

Following strict modular separation of concerns:

```
src/
├── api/ or services/
│   ├── supabaseClient.js          # Supabase client with auto environment detection
│   └── dataService.js             # High-resilience CRUD service with offline fallback
├── context/
│   ├── AuthContext.jsx            # Authentication state & role switching
│   └── AppDataContext.jsx         # Reactive global data store & actions
├── components/
│   ├── common/
│   │   ├── StatCard.jsx           # Metric card matching screenshot style
│   │   ├── Modal.jsx              # Reusable dialogue modals
│   │   └── SettingsModal.jsx      # Supabase connection & live database configuration
│   └── layout/
│       ├── SuperadminSidebar.jsx  # Dark Navy accordion sidebar matching screenshot
│       ├── SuperadminNavbar.jsx   # Topbar with red "3" badge, settings, profile
│       ├── InstituteAdminSidebar.jsx # Campus-level sidebar navigation
│       └── InstituteAdminNavbar.jsx  # Campus switcher & breadcrumbs
├── modules/
│   ├── auth/
│   │   └── LoginPage.jsx          # Smooth animated login view
│   ├── dashboard/
│   │   ├── SuperadminDashboard.jsx # Pixel-perfect match of screenshot
│   │   └── InstituteDashboard.jsx  # School KPI dashboard
│   ├── institute-management/
│   │   ├── divisions/             # DivisionsView.jsx
│   │   ├── districts/             # DistrictsView.jsx
│   │   ├── institutes/            # InstitutesView.jsx
│   │   ├── departments/           # DepartmentsView.jsx
│   │   └── examination-bodies/    # ExaminationBodiesView.jsx
│   ├── academics/
│   │   ├── academic-years/        # AcademicYearsView.jsx
│   │   ├── program-types/         # ProgramTypesView.jsx
│   │   ├── programs/              # ProgramsView.jsx
│   │   ├── subjects/              # SubjectsView.jsx
│   │   └── study-schemes/         # StudySchemesView.jsx
│   ├── users-management/
│   │   └── UsersManagementView.jsx # 231 users directory & filters
│   └── institute-admin/
│       ├── students/              # StudentsView.jsx
│       ├── teachers/              # TeachersView.jsx
│       ├── classes/               # ClassesView.jsx
│       ├── attendance/            # AttendanceView.jsx
│       └── fees/                  # FeesView.jsx
├── server/
│   └── server.js                  # Node.js Express backend API
├── supabase-schema.sql            # Supabase PostgreSQL database tables & seed data
├── App.jsx
├── main.jsx
└── index.css
```

---

## ⚡ Quick Start

### 1. Start the React Frontend Application
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 2. (Optional) Start the Node.js API Server
```bash
npm run server
```
Server runs at `http://localhost:5000/api/health`.

---

## 🗄️ Connecting with Supabase

1. Open your [Supabase Dashboard](https://supabase.com).
2. Go to **SQL Editor** -> Click **New Query**.
3. Copy the entire contents of `supabase-schema.sql` and click **Run**.
   - This sets up all 16 relational tables and seeds initial data matching the screenshot!
4. In your `.env` file, enter your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
5. Alternatively, you can click the **Settings Cog icon** or **Database Status Pill** in the top navbar while running the app and paste your keys directly into the UI!
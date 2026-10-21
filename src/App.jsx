import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppDataProvider, useAppData } from './context/AppDataContext'

// Layout components
import SuperadminSidebar from './components/layout/SuperadminSidebar'
import SuperadminNavbar from './components/layout/SuperadminNavbar'
import InstituteAdminSidebar from './components/layout/InstituteAdminSidebar'
import InstituteAdminNavbar from './components/layout/InstituteAdminNavbar'
import SettingsModal from './components/common/SettingsModal'

// Auth
import LoginPage from './modules/auth/LoginPage'

// Superadmin Views (Divisions and Districts removed as requested)
import SuperadminDashboard from './modules/dashboard/SuperadminDashboard'
import InstitutesView from './modules/institute-management/institutes/InstitutesView'
import DepartmentsView from './modules/institute-management/departments/DepartmentsView'
import ExaminationBodiesView from './modules/institute-management/examination-bodies/ExaminationBodiesView'
import AcademicYearsView from './modules/academics/academic-years/AcademicYearsView'
import ProgramTypesView from './modules/academics/program-types/ProgramTypesView'
import ProgramsView from './modules/academics/programs/ProgramsView'
import SubjectsView from './modules/academics/subjects/SubjectsView'
import StudySchemesView from './modules/academics/study-schemes/StudySchemesView'
import UsersManagementView from './modules/users-management/UsersManagementView'
import NoticeBroadcasterView from './modules/announcements/NoticeBroadcasterView'

// Institute Admin Views (Enhanced with Timetable, Exams, Notices)
import InstituteDashboard from './modules/dashboard/InstituteDashboard'
import StudentsView from './modules/institute-admin/students/StudentsView'
import TeachersView from './modules/institute-admin/teachers/TeachersView'
import ClassesView from './modules/institute-admin/classes/ClassesView'
import TimetableView from './modules/institute-admin/timetable/TimetableView'
import AttendanceView from './modules/institute-admin/attendance/AttendanceView'
import FeesView from './modules/institute-admin/fees/FeesView'
import ExamsView from './modules/institute-admin/exams/ExamsView'
import NoticeBoardView from './modules/institute-admin/notices/NoticeBoardView'
import ProgramLevelsView from './modules/academics/ProgramLevelsView'

// High-Demand Modern Operations Modules
import FinancialAnalyticsView from './modules/finance/FinancialAnalyticsView'
import TransportView from './modules/transport/TransportView'
import LibraryView from './modules/library/LibraryView'
import AdmissionsPipelineView from './modules/admissions-pipeline/AdmissionsPipelineView'
import CommunicationGatewayView from './modules/communication/CommunicationGatewayView'
import AuditLogsView from './modules/audit-logs/AuditLogsView'

const AppContent = () => {
  const { user } = useAuth()
  const { institutes, refreshData } = useAppData()

  // Routing state
  const [superadminRoute, setSuperadminRoute] = useState('dashboard')
  const [instituteRoute, setInstituteRoute] = useState('inst-dashboard')
  
  // Mobile drawer states
  const [superMobileOpen, setSuperMobileOpen] = useState(false)
  const [instMobileOpen, setInstMobileOpen] = useState(false)

  // Selected campus for Institute Admin
  const [selectedInstitute, setSelectedInstitute] = useState(() => institutes[0] || null)
  
  // Settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // If no user is authenticated, display login page
  if (!user) {
    return <LoginPage />
  }

  // 1. SUPERADMIN PORTAL
  if (user.role === 'superadmin') {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-[#f4f7fb]">
        {/* Dark Navy Sidebar with Mobile Drawer support */}
        <SuperadminSidebar
          currentRoute={superadminRoute}
          onRouteChange={setSuperadminRoute}
          isMobileOpen={superMobileOpen}
          onCloseMobile={() => setSuperMobileOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <SuperadminNavbar
            currentRoute={superadminRoute}
            onRouteChange={setSuperadminRoute}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenMobileMenu={() => setSuperMobileOpen(true)}
          />

          <main className="flex-1 overflow-y-auto">
            {superadminRoute === 'dashboard' && (
              <SuperadminDashboard
                onRouteChange={setSuperadminRoute}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            )}
            {superadminRoute === 'institutes' && (
              <InstitutesView />
            )}
            {superadminRoute === 'departments' && <DepartmentsView />}
            {superadminRoute === 'examination-bodies' && <ExaminationBodiesView />}
            {superadminRoute === 'academic-years' && <AcademicYearsView />}
            {superadminRoute === 'program-types' && <ProgramTypesView />}
            {superadminRoute === 'programs' && <ProgramsView />}
            {superadminRoute === 'subjects' && <SubjectsView />}
            {superadminRoute === 'study-schemes' && <StudySchemesView />}
            {superadminRoute === 'finance' && <FinancialAnalyticsView />}
            {superadminRoute === 'transport' && <TransportView />}
            {superadminRoute === 'library' && <LibraryView />}
            {superadminRoute === 'admissions-pipeline' && <AdmissionsPipelineView />}
            {superadminRoute === 'communication' && <CommunicationGatewayView />}
            {superadminRoute === 'audit-logs' && <AuditLogsView />}
            {superadminRoute === 'announcements' && <NoticeBroadcasterView />}
            {superadminRoute === 'users-all' && (
              <UsersManagementView defaultTab="all" />
            )}
            {superadminRoute === 'users-roles' && (
              <UsersManagementView defaultTab="roles" />
            )}
          </main>
        </div>

        {/* Global Settings & Supabase Configuration Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    )
  }

  // 2. INSTITUTE ADMIN PORTAL (Dedicated School Level Management)
  const activeCampus = selectedInstitute || institutes[0] || {
    id: 'inst-default',
    name: 'Main Campus',
    code: 'SCH-001',
    address: 'Central Campus'
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f4f7fb]">
      {/* Institute Admin Sidebar */}
      <InstituteAdminSidebar
        currentRoute={instituteRoute}
        onRouteChange={setInstituteRoute}
        instituteName={activeCampus?.name}
        isMobileOpen={instMobileOpen}
        onCloseMobile={() => setInstMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <InstituteAdminNavbar
          currentRoute={instituteRoute}
          selectedInstitute={activeCampus}
          onSelectInstitute={setSelectedInstitute}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenMobileMenu={() => setInstMobileOpen(true)}
          onRouteChange={setInstituteRoute}
        />

        <main className="flex-1 overflow-y-auto">
          {instituteRoute === 'inst-dashboard' && (
            <InstituteDashboard
              currentInstitute={activeCampus}
              onRouteChange={setInstituteRoute}
            />
          )}
          {instituteRoute === 'inst-students' && (
            <StudentsView currentInstitute={activeCampus} />
          )}
          {instituteRoute === 'inst-teachers' && (
            <TeachersView currentInstitute={activeCampus} />
          )}
          {instituteRoute === 'inst-classes' && (
            <ClassesView currentInstitute={activeCampus} />
          )}
          {instituteRoute === 'inst-timetable' && (
            <TimetableView currentInstitute={activeCampus} />
          )}
          {instituteRoute === 'inst-attendance' && (
            <AttendanceView currentInstitute={activeCampus} />
          )}
          {instituteRoute === 'inst-fees' && (
            <FeesView currentInstitute={activeCampus} />
          )}
          {instituteRoute === 'inst-exams' && (
            <ExamsView currentInstitute={activeCampus} />
          )}
          {instituteRoute === 'inst-program-levels' && (
            <ProgramLevelsView currentInstitute={activeCampus} />
          )}
          {instituteRoute === 'inst-notices' && (
            <NoticeBoardView currentInstitute={activeCampus} />
          )}
          {instituteRoute === 'inst-admissions' && (
            <AdmissionsPipelineView currentInstitute={activeCampus} />
          )}
          {instituteRoute === 'inst-transport' && (
            <TransportView currentInstitute={activeCampus} />
          )}
          {instituteRoute === 'inst-library' && (
            <LibraryView currentInstitute={activeCampus} />
          )}
        </main>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <AppContent />
      </AppDataProvider>
    </AuthProvider>
  )
}

export default App

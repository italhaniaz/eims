import React, { useState, useEffect, lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppDataProvider, useAppData } from './context/AppDataContext'
import { ToastProvider, useToast } from './context/ToastContext'

// Layout components
import SuperadminSidebar from './components/layout/SuperadminSidebar'
import SuperadminNavbar from './components/layout/SuperadminNavbar'
import InstituteAdminSidebar from './components/layout/InstituteAdminSidebar'
import InstituteAdminNavbar from './components/layout/InstituteAdminNavbar'
import SettingsModal from './components/common/SettingsModal'

// Auth
import LoginPage from './modules/auth/LoginPage'

// Lazy-loaded Views for Bundle Performance & Code Splitting
const SuperadminDashboard = lazy(() => import('./modules/dashboard/SuperadminDashboard'))
const InstitutesView = lazy(() => import('./modules/institute-management/institutes/InstitutesView'))
const DepartmentsView = lazy(() => import('./modules/institute-management/departments/DepartmentsView'))
const ExaminationBodiesView = lazy(() => import('./modules/institute-management/examination-bodies/ExaminationBodiesView'))
const AcademicYearsView = lazy(() => import('./modules/academics/academic-years/AcademicYearsView'))
const ProgramTypesView = lazy(() => import('./modules/academics/program-types/ProgramTypesView'))
const ProgramsView = lazy(() => import('./modules/academics/programs/ProgramsView'))
const SubjectsView = lazy(() => import('./modules/academics/subjects/SubjectsView'))
const StudySchemesView = lazy(() => import('./modules/academics/study-schemes/StudySchemesView'))
const UsersManagementView = lazy(() => import('./modules/users-management/UsersManagementView'))
const NoticeBroadcasterView = lazy(() => import('./modules/announcements/NoticeBroadcasterView'))

// Institute Admin Views
const InstituteDashboard = lazy(() => import('./modules/dashboard/InstituteDashboard'))
const StudentsView = lazy(() => import('./modules/institute-admin/students/StudentsView'))
const TeachersView = lazy(() => import('./modules/institute-admin/teachers/TeachersView'))
const ClassesView = lazy(() => import('./modules/institute-admin/classes/ClassesView'))
const TimetableView = lazy(() => import('./modules/institute-admin/timetable/TimetableView'))
const AttendanceView = lazy(() => import('./modules/institute-admin/attendance/AttendanceView'))
const FeesView = lazy(() => import('./modules/institute-admin/fees/FeesView'))
const ExamsView = lazy(() => import('./modules/institute-admin/exams/ExamsView'))
const NoticeBoardView = lazy(() => import('./modules/institute-admin/notices/NoticeBoardView'))
const ProgramLevelsView = lazy(() => import('./modules/academics/ProgramLevelsView'))

// High-Demand Modern Operations Modules
const FinancialAnalyticsView = lazy(() => import('./modules/finance/FinancialAnalyticsView'))
const TransportView = lazy(() => import('./modules/transport/TransportView'))
const LibraryView = lazy(() => import('./modules/library/LibraryView'))
const AdmissionsPipelineView = lazy(() => import('./modules/admissions-pipeline/AdmissionsPipelineView'))
const CommunicationGatewayView = lazy(() => import('./modules/communication/CommunicationGatewayView'))
const AuditLogsView = lazy(() => import('./modules/audit-logs/AuditLogsView'))

// Executive Minimal Loading Fallback
const ModuleLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[380px] w-full p-8 text-center animate-in fade-in duration-200">
    <div className="w-9 h-9 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-3"></div>
    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Loading Module...</span>
  </div>
)

const AppContent = () => {
  const { user } = useAuth()
  const { institutes } = useAppData()

  // Helper to extract initial route from window.location.hash
  const getInitialRoute = (defaultRoute) => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const cleanHash = window.location.hash.replace(/^#\/?/, '')
      if (cleanHash) return cleanHash
    }
    return defaultRoute
  }

  // Routing state synced with Browser History & Hash
  const [superadminRoute, setSuperadminRouteState] = useState(() => getInitialRoute('dashboard'))
  const [instituteRoute, setInstituteRouteState] = useState(() => getInitialRoute('inst-dashboard'))

  // Route setters that update the browser URL hash without full reload
  const setSuperadminRoute = (route) => {
    setSuperadminRouteState(route)
    if (typeof window !== 'undefined') {
      window.location.hash = `#${route}`
    }
  }

  const setInstituteRoute = (route) => {
    setInstituteRouteState(route)
    if (typeof window !== 'undefined') {
      window.location.hash = `#${route}`
    }
  }

  // Synchronize on browser Back/Forward (popstate & hashchange)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '')
      if (hash) {
        if (user?.role === 'superadmin') {
          setSuperadminRouteState(hash)
        } else if (user?.role === 'institute_admin') {
          setInstituteRouteState(hash)
        }
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [user?.role])
  
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
            <Suspense fallback={<ModuleLoader />}>
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
            </Suspense>
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
          <Suspense fallback={<ModuleLoader />}>
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
          </Suspense>
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
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AppDataProvider>
    </AuthProvider>
  )
}

export default App

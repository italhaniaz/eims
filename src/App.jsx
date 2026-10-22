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
import CommandPaletteModal from './components/common/CommandPaletteModal'
import ImpersonationBanner from './components/common/ImpersonationBanner'
import ErrorBoundary from './components/common/ErrorBoundary'

// Auth
import LoginPage from './modules/auth/LoginPage'

// Lazy-loaded Views for Bundle Performance & Code Splitting
const SuperadminDashboard = lazy(() => import('./modules/dashboard/SuperadminDashboard'))
const InstitutesView = lazy(() => import('./modules/institute-management/institutes/InstitutesView'))
const ModulesControlView = lazy(() => import('./modules/platform/modules/ModulesControlView'))
const SecurityCenterView = lazy(() => import('./modules/platform/security/SecurityCenterView'))
const CrossInstituteAnalyticsView = lazy(() => import('./modules/platform/analytics/CrossInstituteAnalyticsView'))
const SubscriptionsBillingView = lazy(() => import('./modules/platform/billing/SubscriptionsBillingView'))
const GlobalTemplatesView = lazy(() => import('./modules/platform/templates/GlobalTemplatesView'))
const BackupDataView = lazy(() => import('./modules/platform/backup/BackupDataView'))
const SystemHealthView = lazy(() => import('./modules/platform/health/SystemHealthView'))
const SupportApprovalsView = lazy(() => import('./modules/platform/support/SupportApprovalsView'))
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

  // Allowed route registry for strict portal isolation
  const VALID_SUPERADMIN_ROUTES = [
    'dashboard', 'institutes', 'platform-modules', 'security-center',
    'cross-institute-analytics', 'platform-billing', 'global-templates',
    'backup-data', 'system-health', 'support-approvals', 'departments',
    'examination-bodies', 'academic-years', 'program-types', 'programs',
    'subjects', 'study-schemes', 'finance', 'transport', 'library',
    'admissions-pipeline', 'communication', 'audit-logs', 'announcements',
    'users-all', 'users-roles'
  ]

  const VALID_INSTITUTE_ROUTES = [
    'inst-dashboard', 'inst-students', 'inst-teachers', 'inst-classes',
    'inst-timetable', 'inst-attendance', 'inst-fees', 'inst-exams',
    'inst-program-levels', 'inst-notices', 'inst-admissions',
    'inst-transport', 'inst-library'
  ]

  // Helpers to safely extract valid initial routes per portal role
  const getInitialSuperadminRoute = () => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const cleanHash = window.location.hash.replace(/^#\/?/, '')
      if (VALID_SUPERADMIN_ROUTES.includes(cleanHash)) return cleanHash
    }
    return 'dashboard'
  }

  const getInitialInstituteRoute = () => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const cleanHash = window.location.hash.replace(/^#\/?/, '')
      if (VALID_INSTITUTE_ROUTES.includes(cleanHash)) return cleanHash
    }
    return 'inst-dashboard'
  }

  // Routing state synced with Browser History & Hash
  const [superadminRoute, setSuperadminRouteState] = useState(getInitialSuperadminRoute)
  const [instituteRoute, setInstituteRouteState] = useState(getInitialInstituteRoute)

  // Route setters that update the browser URL hash without full reload
  const setSuperadminRoute = (route) => {
    const valid = VALID_SUPERADMIN_ROUTES.includes(route) ? route : 'dashboard'
    setSuperadminRouteState(valid)
    if (typeof window !== 'undefined') {
      window.location.hash = `#${valid}`
    }
  }

  const setInstituteRoute = (route) => {
    const valid = VALID_INSTITUTE_ROUTES.includes(route) ? route : 'inst-dashboard'
    setInstituteRouteState(valid)
    if (typeof window !== 'undefined') {
      window.location.hash = `#${valid}`
    }
  }

  // Synchronize route when user role changes or authenticates
  useEffect(() => {
    if (!user) return
    const currentHash = typeof window !== 'undefined' ? window.location.hash.replace(/^#\/?/, '') : ''

    if (user.role === 'institute_admin') {
      if (!VALID_INSTITUTE_ROUTES.includes(currentHash)) {
        setInstituteRoute('inst-dashboard')
      } else {
        setInstituteRouteState(currentHash)
      }
    } else if (user.role === 'superadmin') {
      if (!VALID_SUPERADMIN_ROUTES.includes(currentHash)) {
        setSuperadminRoute('dashboard')
      } else {
        setSuperadminRouteState(currentHash)
      }
    }
  }, [user?.role, user?.id])

  // Synchronize on browser Back/Forward (popstate & hashchange)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '')
      if (hash) {
        if (user?.role === 'superadmin') {
          if (VALID_SUPERADMIN_ROUTES.includes(hash)) {
            setSuperadminRouteState(hash)
          } else {
            setSuperadminRoute('dashboard')
          }
        } else if (user?.role === 'institute_admin') {
          if (VALID_INSTITUTE_ROUTES.includes(hash)) {
            setInstituteRouteState(hash)
          } else {
            setInstituteRoute('inst-dashboard')
          }
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
  
  // Settings modal & Global Spotlight Command Palette
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)

  // Global Keyboard Shortcut Listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsPaletteOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handlePaletteNavigate = (route) => {
    if (user?.role === 'superadmin') {
      setSuperadminRoute(route)
    } else {
      const instRoute = route.startsWith('inst-') ? route : `inst-${route}`
      setInstituteRoute(instRoute)
    }
  }

  // If no user is authenticated, display login page
  if (!user) {
    return <LoginPage />
  }

  // 1. SUPERADMIN PORTAL
  if (user.role === 'superadmin') {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f4f7fb]">
        {/* Floating Impersonation Delegation Banner */}
        <ImpersonationBanner />

        <div className="flex flex-1 min-h-0 overflow-hidden">
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
              onOpenCommandPalette={() => setIsPaletteOpen(true)}
            />

            <main className="flex-1 overflow-y-auto">
              <ErrorBoundary onNavigateHome={() => setSuperadminRoute('dashboard')}>
                <Suspense fallback={<ModuleLoader />}>
                  {(!VALID_SUPERADMIN_ROUTES.includes(superadminRoute) || superadminRoute === 'dashboard') && (
                    <SuperadminDashboard
                      onRouteChange={setSuperadminRoute}
                      onOpenSettings={() => setIsSettingsOpen(true)}
                    />
                  )}
                  {superadminRoute === 'institutes' && (
                    <InstitutesView />
                  )}
                  {superadminRoute === 'platform-modules' && (
                    <ModulesControlView />
                  )}
                  {superadminRoute === 'security-center' && (
                    <SecurityCenterView />
                  )}
                  {superadminRoute === 'cross-institute-analytics' && (
                    <CrossInstituteAnalyticsView />
                  )}
                  {superadminRoute === 'platform-billing' && (
                    <SubscriptionsBillingView />
                  )}
                  {superadminRoute === 'global-templates' && (
                    <GlobalTemplatesView />
                  )}
                  {superadminRoute === 'backup-data' && (
                    <BackupDataView />
                  )}
                  {superadminRoute === 'system-health' && (
                    <SystemHealthView />
                  )}
                  {superadminRoute === 'support-approvals' && (
                    <SupportApprovalsView />
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
              </ErrorBoundary>            </main>
          </div>
        </div>

        {/* Global Settings & Supabase Configuration Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        <CommandPaletteModal
          isOpen={isPaletteOpen}
          onClose={() => setIsPaletteOpen(false)}
          onNavigate={handlePaletteNavigate}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </div>
    )
  }

  // 2. INSTITUTE ADMIN PORTAL (Dedicated Multi-Tenant Scoped Management)
  const scopedInstitute = user?.instituteId 
    ? institutes.find(i => i.id === user.instituteId) || { id: user.instituteId, name: user.instituteName || 'Designated Campus', code: 'CAMPUS' }
    : null

  const activeCampus = (user?.role === 'institute_admin' && scopedInstitute)
    ? scopedInstitute
    : (selectedInstitute || institutes[0] || {
        id: user?.instituteId || 'inst-1',
        name: user?.instituteName || 'Main Campus',
        code: 'SCH-001',
        address: 'Central Campus'
      })

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f4f7fb]">
      {/* Floating Impersonation Delegation Banner */}
      <ImpersonationBanner />

      <div className="flex flex-1 min-h-0 overflow-hidden">
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
            onOpenCommandPalette={() => setIsPaletteOpen(true)}
            onRouteChange={setInstituteRoute}
          />

          <main className="flex-1 overflow-y-auto">
            <ErrorBoundary onNavigateHome={() => setInstituteRoute('inst-dashboard')}>
              <Suspense fallback={<ModuleLoader />}>
                {(!VALID_INSTITUTE_ROUTES.includes(instituteRoute) || instituteRoute === 'inst-dashboard') && (
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
                  <TimetableView 
                    currentInstitute={activeCampus} 
                    onRouteChange={setInstituteRoute}
                  />
                )}
                {instituteRoute === 'inst-attendance' && (
                  <AttendanceView 
                    currentInstitute={activeCampus} 
                    onRouteChange={setInstituteRoute}
                  />
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
            </ErrorBoundary>
          </main>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <CommandPaletteModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onNavigate={handlePaletteNavigate}
        onOpenSettings={() => setIsSettingsOpen(true)}
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

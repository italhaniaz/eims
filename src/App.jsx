import React, { useState, useEffect, Suspense } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppDataProvider, useAppData } from './context/AppDataContext'
import { ToastProvider, useToast } from './context/ToastContext'
import { lazyWithRetry } from './utils/lazyWithRetry'

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
import LandingPage from './modules/landing/LandingPage'

// Lazy-loaded Views for Bundle Performance & Code Splitting (with resilient auto-retry)
const SuperadminDashboard = lazyWithRetry(() => import('./modules/dashboard/SuperadminDashboard'), 'superadmin-dashboard')
const InstitutesView = lazyWithRetry(() => import('./modules/institute-management/institutes/InstitutesView'), 'institutes-view')
const ModulesControlView = lazyWithRetry(() => import('./modules/platform/modules/ModulesControlView'), 'modules-control')
const SecurityCenterView = lazyWithRetry(() => import('./modules/platform/security/SecurityCenterView'), 'security-center')
const CrossInstituteAnalyticsView = lazyWithRetry(() => import('./modules/platform/analytics/CrossInstituteAnalyticsView'), 'cross-institute-analytics')
const SubscriptionsBillingView = lazyWithRetry(() => import('./modules/platform/billing/SubscriptionsBillingView'), 'subscriptions-billing')
const GlobalTemplatesView = lazyWithRetry(() => import('./modules/platform/templates/GlobalTemplatesView'), 'global-templates')
const BackupDataView = lazyWithRetry(() => import('./modules/platform/backup/BackupDataView'), 'backup-data')
const SystemHealthView = lazyWithRetry(() => import('./modules/platform/health/SystemHealthView'), 'system-health')
const SupportApprovalsView = lazyWithRetry(() => import('./modules/platform/support/SupportApprovalsView'), 'support-approvals')
const DepartmentsView = lazyWithRetry(() => import('./modules/institute-management/departments/DepartmentsView'), 'departments-view')
const ExaminationBodiesView = lazyWithRetry(() => import('./modules/institute-management/examination-bodies/ExaminationBodiesView'), 'examination-bodies')
const AcademicYearsView = lazyWithRetry(() => import('./modules/academics/academic-years/AcademicYearsView'), 'academic-years')
const ProgramTypesView = lazyWithRetry(() => import('./modules/academics/program-types/ProgramTypesView'), 'program-types')
const ProgramsView = lazyWithRetry(() => import('./modules/academics/programs/ProgramsView'), 'programs-view')
const SubjectsView = lazyWithRetry(() => import('./modules/institute-admin/subjects/SubjectsView'), 'subjects-view')
const StudySchemesView = lazyWithRetry(() => import('./modules/academics/study-schemes/StudySchemesView'), 'study-schemes')
const UsersManagementView = lazyWithRetry(() => import('./modules/users-management/UsersManagementView'), 'users-management')
const NoticeBroadcasterView = lazyWithRetry(() => import('./modules/announcements/NoticeBroadcasterView'), 'notice-broadcaster')

// Institute Admin Views
const InstituteDashboard = lazyWithRetry(() => import('./modules/dashboard/InstituteDashboard'), 'institute-dashboard')
const StudentsView = lazyWithRetry(() => import('./modules/institute-admin/students/StudentsView'), 'students-view')
const TeachersView = lazyWithRetry(() => import('./modules/institute-admin/teachers/TeachersView'), 'teachers-view')
const ClassesView = lazyWithRetry(() => import('./modules/institute-admin/classes/ClassesView'), 'classes-view')
const TimetableView = lazyWithRetry(() => import('./modules/institute-admin/timetable/TimetableView'), 'timetable-view')
const AttendanceView = lazyWithRetry(() => import('./modules/institute-admin/attendance/AttendanceView'), 'attendance-view')
const FeesView = lazyWithRetry(() => import('./modules/institute-admin/fees/FeesView'), 'fees-view')
const ExamsView = lazyWithRetry(() => import('./modules/institute-admin/exams/ExamsView'), 'exams-view')
const NoticeBoardView = lazyWithRetry(() => import('./modules/institute-admin/notices/NoticeBoardView'), 'notice-board-view')
const ProgramLevelsView = lazyWithRetry(() => import('./modules/academics/ProgramLevelsView'), 'program-levels-view')

// High-Demand Modern Operations Modules
const FinancialAnalyticsView = lazyWithRetry(() => import('./modules/finance/FinancialAnalyticsView'), 'finance-view')
const TransportView = lazyWithRetry(() => import('./modules/transport/TransportView'), 'transport-view')
const LibraryView = lazyWithRetry(() => import('./modules/library/LibraryView'), 'library-view')
const AdmissionsPipelineView = lazyWithRetry(() => import('./modules/admissions-pipeline/AdmissionsPipelineView'), 'admissions-pipeline')
const CommunicationGatewayView = lazyWithRetry(() => import('./modules/communication/CommunicationGatewayView'), 'communication-gateway')
const AuditLogsView = lazyWithRetry(() => import('./modules/audit-logs/AuditLogsView'), 'audit-logs')

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
    'inst-subjects', 'inst-program-levels', 'inst-notices', 'inst-admissions',
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

  // Public visitor routing (Landing Page vs Login Page)
  const [publicView, setPublicView] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#\/?/, '')
      if (hash === 'login' || hash === 'signin') return 'login'
    }
    return 'landing'
  })

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
      if (!user) {
        if (hash === 'login' || hash === 'signin') {
          setPublicView('login')
        } else {
          setPublicView('landing')
        }
        return
      }
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

  // If no user is authenticated, display landing page or login page
  if (!user) {
    if (publicView === 'login') {
      return (
        <LoginPage
          onBackToLanding={() => {
            setPublicView('landing')
            if (typeof window !== 'undefined') {
              window.location.hash = ''
            }
          }}
          onOpenTrial={() => {
            setPublicView('landing')
            if (typeof window !== 'undefined') {
              window.location.hash = ''
            }
          }}
        />
      )
    }
    return (
      <LandingPage
        onNavigateToLogin={(mode) => {
          setPublicView('login')
          if (typeof window !== 'undefined') {
            window.location.hash = '#login'
          }
        }}
      />
    )
  }

  // 1. SUPERADMIN PORTAL
  if (user.role === 'superadmin') {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden bg-[#f8fafc]">
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
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#f4f7fb]">
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
                {instituteRoute === 'inst-subjects' && (
                  <SubjectsView currentInstitute={activeCampus} />
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
    <ErrorBoundary onNavigateHome={() => window.location.reload()}>
      <AuthProvider>
      <AppDataProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AppDataProvider>
    </AuthProvider>
    </ErrorBoundary>
  )
}

export default App

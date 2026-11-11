import React, { useState, useEffect, Suspense } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppDataProvider, useAppData } from './context/AppDataContext'
import { ToastProvider, useToast } from './context/ToastContext'
import { lazyWithRetry } from './utils/lazyWithRetry'
import { sampleTemplateData } from './services/dataService'

// Layout components
import SuperadminSidebar from './components/layout/SuperadminSidebar'
import SuperadminNavbar from './components/layout/SuperadminNavbar'
import InstituteAdminSidebar, { canRoleAccessRoute } from './components/layout/InstituteAdminSidebar'
import InstituteAdminNavbar from './components/layout/InstituteAdminNavbar'
import SettingsModal from './components/common/SettingsModal'
import CommandPaletteModal from './components/common/CommandPaletteModal'
import ThemeCustomizerModal from './components/common/ThemeCustomizerModal'
import ImpersonationBanner from './components/common/ImpersonationBanner'
import ErrorBoundary from './components/common/ErrorBoundary'

// Auth
import LoginPage from './modules/auth/LoginPage'
import LandingPage from './modules/landing/LandingPage'
import DemoComingSoonPage from './modules/landing/DemoComingSoonPage'

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
const UsersManagementView = lazyWithRetry(() => import('./modules/users-management/UsersManagementView'), 'users-management')
const NoticeBroadcasterView = lazyWithRetry(() => import('./modules/announcements/NoticeBroadcasterView'), 'notice-broadcaster')
const CommunicationGatewayView = lazyWithRetry(() => import('./modules/communication/CommunicationGatewayView'), 'communication-gateway')
const AuditLogsView = lazyWithRetry(() => import('./modules/audit-logs/AuditLogsView'), 'audit-logs')

// Superadmin Cross-Campus Platform Governance Modules
const SuperadminCommunicationView = lazyWithRetry(() => import('./modules/platform/communication/SuperadminCommunicationView'), 'superadmin-communication')
const SuperadminReportsAnalyticsView = lazyWithRetry(() => import('./modules/platform/reports/SuperadminReportsAnalyticsView'), 'superadmin-reports')
const SuperadminPoliciesView = lazyWithRetry(() => import('./modules/platform/policies/SuperadminPoliciesView'), 'superadmin-policies')
const SuperadminPlatformSettingsView = lazyWithRetry(() => import('./modules/platform/settings/SuperadminPlatformSettingsView'), 'superadmin-settings')
const SuperadminStudentsView = lazyWithRetry(() => import('./modules/platform/students/SuperadminStudentsView'), 'superadmin-students')
const SuperadminStaffFacultyView = lazyWithRetry(() => import('./modules/platform/staff/SuperadminStaffFacultyView'), 'superadmin-staff')
const SuperadminAcademicsView = lazyWithRetry(() => import('./modules/platform/academics/SuperadminAcademicsView'), 'superadmin-academics')
const SuperadminAdmissionsView = lazyWithRetry(() => import('./modules/platform/admissions/SuperadminAdmissionsView'), 'superadmin-admissions')
const SuperadminExaminationsResultsView = lazyWithRetry(() => import('./modules/platform/examinations/SuperadminExaminationsResultsView'), 'superadmin-exams')
const SuperadminFeesView = lazyWithRetry(() => import('./modules/platform/fees/SuperadminFeesView'), 'superadmin-fees')
const SuperadminAttendanceView = lazyWithRetry(() => import('./modules/platform/attendance/SuperadminAttendanceView'), 'superadmin-attendance')
const SuperadminAccountsView = lazyWithRetry(() => import('./modules/platform/accounts/SuperadminAccountsView'), 'superadmin-accounts')
const SuperadminCampusServicesView = lazyWithRetry(() => import('./modules/platform/services/SuperadminCampusServicesView'), 'superadmin-services')
const SuperadminCertificatesView = lazyWithRetry(() => import('./modules/platform/certificates/SuperadminCertificatesView'), 'superadmin-certificates')
const SuperadminLearningView = lazyWithRetry(() => import('./modules/platform/learning/SuperadminLearningView'), 'superadmin-learning')

// Institute Admin Operational Modules
const InstituteDashboard = lazyWithRetry(() => import('./modules/dashboard/InstituteDashboard'), 'institute-dashboard')
const StudentsView = lazyWithRetry(() => import('./modules/institute-admin/students/StudentsView'), 'students-view')
const TeachersView = lazyWithRetry(() => import('./modules/institute-admin/teachers/TeachersView'), 'teachers-view')
const ClassesView = lazyWithRetry(() => import('./modules/institute-admin/classes/ClassesView'), 'classes-view')
const TimetableView = lazyWithRetry(() => import('./modules/institute-admin/timetable/TimetableView'), 'timetable-view')
const AttendanceView = lazyWithRetry(() => import('./modules/institute-admin/attendance/AttendanceView'), 'attendance-view')
const FeesView = lazyWithRetry(() => import('./modules/institute-admin/fees/FeesView'), 'fees-view')
const ExamsView = lazyWithRetry(() => import('./modules/institute-admin/exams/ExamsView'), 'exams-view')
const SubjectsView = lazyWithRetry(() => import('./modules/institute-admin/subjects/SubjectsView'), 'subjects-view')
const ProgramLevelsView = lazyWithRetry(() => import('./modules/academics/ProgramLevelsView'), 'program-levels-view')
const NoticeBoardView = lazyWithRetry(() => import('./modules/institute-admin/notices/NoticeBoardView'), 'notice-board-view')
const AdmissionsPipelineView = lazyWithRetry(() => import('./modules/admissions-pipeline/AdmissionsPipelineView'), 'admissions-pipeline')
const TransportView = lazyWithRetry(() => import('./modules/transport/TransportView'), 'transport-view')
const LibraryView = lazyWithRetry(() => import('./modules/library/LibraryView'), 'library-view')
const CertificatesView = lazyWithRetry(() => import('./modules/institute-admin/certificates/CertificatesView'), 'certificates-view')
const LearningResourcesView = lazyWithRetry(() => import('./modules/institute-admin/learning/LearningResourcesView'), 'learning-resources-view')
const CampusInventoryView = lazyWithRetry(() => import('./modules/institute-admin/inventory/CampusInventoryView'), 'campus-inventory-view')
const CampusEventsCalendarView = lazyWithRetry(() => import('./modules/institute-admin/events/CampusEventsCalendarView'), 'campus-events-view')
const CampusReportsAnalyticsView = lazyWithRetry(() => import('./modules/institute-admin/reports/CampusReportsAnalyticsView'), 'campus-reports-view')

const CampusAccountsView = lazyWithRetry(() => import('./modules/institute-admin/accounts/CampusAccountsView'), 'campus-accounts-view')

// Executive Seamless Loading Fallback & Preloader
import ModuleSkeletonLoader from './components/common/ModuleSkeletonLoader'
import { 
  preloadRoute, 
  preloadInstituteCoreModules, 
  preloadSuperadminCoreModules 
} from './utils/modulePreloader'

const AppContent = () => {
  const { user } = useAuth()
  const { institutes } = useAppData()

  // Proactive background preloading to ensure instant (<5ms) navigation without delay
  useEffect(() => {
    if (!user) return
    if (user.role === 'superadmin') {
      preloadSuperadminCoreModules()
    } else {
      preloadInstituteCoreModules()
    }
  }, [user?.role])

  // Allowed route registry for strict portal isolation
  const VALID_SUPERADMIN_ROUTES = [
    'dashboard', 'institutes', 'platform-modules', 'security-center',
    'cross-institute-analytics', 'platform-billing', 'global-templates',
    'backup-data', 'system-health', 'support-approvals',
    'communication', 'audit-logs', 'announcements',
    'users-all', 'users-roles',
    // Multi-Campus Academic Governance
    'sa-students', 'sa-staff', 'sa-academics', 'sa-admissions',
    'sa-exams', 'sa-fees', 'sa-attendance', 'sa-accounts',
    'sa-services', 'sa-certificates', 'sa-learning',
    // Communication Hub
    'sa-comm-announcements', 'sa-comm-templates', 'sa-comm-circulars',
    'sa-comm-broadcast', 'sa-comm-logs',
    // Reports & Analytics
    'sa-reports-trends', 'sa-reports-performance', 'sa-reports-collection',
    'sa-reports-comparison', 'sa-reports-builder', 'sa-reports-scheduled',
    'sa-reports-export',
    // Policies & Guidelines
    'sa-policies-academic', 'sa-policies-fees', 'sa-policies-attendance',
    'sa-policies-discipline', 'sa-policies-privacy', 'sa-policies-publish',
    'sa-policies-acknowledgment',
    // Platform Settings
    'sa-settings-general', 'sa-settings-branding', 'sa-settings-flags',
    'sa-settings-integrations', 'sa-settings-compliance', 'sa-settings-legal',
    'sa-settings-maintenance', 'sa-settings-impersonate', 'sa-settings-backups'
  ]

  const VALID_INSTITUTE_ROUTES = [
    'inst-dashboard', 'inst-admissions', 'inst-students', 'inst-teachers', 'inst-payroll',
    'inst-classes', 'inst-subjects', 'inst-timetable', 'inst-program-levels', 'inst-attendance', 'inst-exams',
    'inst-fees', 'inst-accounts', 'inst-notices',
    'inst-learning', 'inst-transport', 'inst-library', 'inst-inventory',
    'inst-certificates', 'inst-events', 'inst-reports', 'inst-users', 'inst-settings'
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

  // Public visitor routing (Landing Page `/` vs Generic Login Page `/login`)
  const isLoginLocation = () => {
    if (typeof window === 'undefined') return false
    const path = window.location.pathname.toLowerCase().replace(/\/+$/, '')
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase()
    return path === '/login' || hash.includes('login') || hash.includes('signin')
  }

  const [publicView, setPublicView] = useState(() => {
    if (typeof window !== 'undefined') {
      if (isLoginLocation()) {
        if (window.location.pathname.toLowerCase().replace(/\/+$/, '') !== '/login') {
          window.history.replaceState(null, '', '/login')
        }
        return 'login'
      }
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase()
      if (hash === 'demo' || hash === 'live-demo') return 'demo'
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
    const currentPath = typeof window !== 'undefined' ? window.location.pathname.toLowerCase().replace(/\/+$/, '') : ''
    const currentHash = typeof window !== 'undefined' ? window.location.hash.replace(/^#\/?/, '') : ''

    if (typeof window !== 'undefined' && currentPath === '/login') {
      window.history.replaceState(null, '', '/')
    }

    if (user.role === 'superadmin') {
      if (!VALID_SUPERADMIN_ROUTES.includes(currentHash)) {
        setSuperadminRoute('dashboard')
      } else {
        setSuperadminRouteState(currentHash)
      }
    } else {
      if (!VALID_INSTITUTE_ROUTES.includes(currentHash)) {
        setInstituteRoute('inst-dashboard')
      } else {
        setInstituteRouteState(currentHash)
      }
    }
  }, [user?.role, user?.id])

  // Synchronize on browser Back/Forward (popstate & hashchange)
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '')
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase()
      if (!user) {
        if (path === '/login' || hash.includes('login') || hash.includes('signin')) {
          if (path !== '/login') {
            window.history.replaceState(null, '', '/login')
          }
          setPublicView('login')
        } else if (hash === 'demo' || hash === 'live-demo') {
          setPublicView('demo')
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
        } else {
          if (VALID_INSTITUTE_ROUTES.includes(hash)) {
            setInstituteRouteState(hash)
          } else {
            setInstituteRoute('inst-dashboard')
          }
        }
      }
    }

    window.addEventListener('popstate', handleRouteChange)
    window.addEventListener('hashchange', handleRouteChange)
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      window.removeEventListener('hashchange', handleRouteChange)
    }
  }, [user?.role])
  
  // Mobile drawer states
  const [superMobileOpen, setSuperMobileOpen] = useState(false)
  const [instMobileOpen, setInstMobileOpen] = useState(false)

  // Selected campus for Institute Admin
  const [selectedInstitute, setSelectedInstitute] = useState(() => institutes[0] || null)
  
  // Settings modal, Theme Studio & Global Spotlight Command Palette
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)

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

  // If no user is authenticated, display landing page (/), generic login page (/login), or demo page
  if (!user) {
    const goToLogin = () => {
      setPublicView('login')
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/login')
      }
    }

    const goToLanding = (hashSuffix = '') => {
      setPublicView('landing')
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', `/${hashSuffix}`)
      }
    }

    if (publicView === 'login') {
      return (
        <LoginPage
          onBackToLanding={() => goToLanding('')}
        />
      )
    }
    if (publicView === 'demo') {
      return (
        <DemoComingSoonPage
          onBackToLanding={() => goToLanding('')}
          onNavigateToLogin={goToLogin}
          onOpenTrial={() => goToLanding('#pricing')}
        />
      )
    }
    return (
      <LandingPage
        onNavigateToLogin={goToLogin}
        onNavigateToDemo={() => {
          setPublicView('demo')
          if (typeof window !== 'undefined') {
            window.history.pushState(null, '', '/#demo')
          }
        }}
      />
    )
  }

  // 1. SUPERADMIN PORTAL
  if (user.role === 'superadmin') {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden bg-[#f8fafc]">
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
              onOpenThemeModal={() => setIsThemeModalOpen(true)}
            />

            <main className="flex-1 overflow-y-auto">
              <ErrorBoundary onNavigateHome={() => setSuperadminRoute('dashboard')}>
                <Suspense fallback={<ModuleSkeletonLoader />}>
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
                  {superadminRoute === 'communication' && <CommunicationGatewayView />}
                  {superadminRoute === 'audit-logs' && <AuditLogsView />}
                  {superadminRoute === 'announcements' && <NoticeBroadcasterView />}
                  {/* Multi-Campus Academic Governance */}
                  {superadminRoute === 'sa-students' && <SuperadminStudentsView onRouteChange={setSuperadminRoute} />}
                  {superadminRoute === 'sa-staff' && <SuperadminStaffFacultyView onRouteChange={setSuperadminRoute} />}
                  {superadminRoute === 'sa-academics' && <SuperadminAcademicsView onRouteChange={setSuperadminRoute} />}
                  {superadminRoute === 'sa-admissions' && <SuperadminAdmissionsView onRouteChange={setSuperadminRoute} />}
                  {superadminRoute === 'sa-exams' && <SuperadminExaminationsResultsView onRouteChange={setSuperadminRoute} />}
                  {superadminRoute === 'sa-fees' && <SuperadminFeesView onRouteChange={setSuperadminRoute} />}
                  {superadminRoute === 'sa-attendance' && <SuperadminAttendanceView onRouteChange={setSuperadminRoute} />}
                  {superadminRoute === 'sa-accounts' && <SuperadminAccountsView onRouteChange={setSuperadminRoute} />}
                  {superadminRoute === 'sa-services' && <SuperadminCampusServicesView onRouteChange={setSuperadminRoute} />}
                  {superadminRoute === 'sa-certificates' && <SuperadminCertificatesView onRouteChange={setSuperadminRoute} />}
                  {superadminRoute === 'sa-learning' && <SuperadminLearningView onRouteChange={setSuperadminRoute} />}
                  {superadminRoute === 'users-all' && (
                    <UsersManagementView defaultTab="all" onRouteChange={setSuperadminRoute} />
                  )}
                  {superadminRoute === 'users-roles' && (
                    <UsersManagementView defaultTab="roles" onRouteChange={setSuperadminRoute} />
                  )}

                  {/* Communication Hub */}
                  {superadminRoute.startsWith('sa-comm-') && (
                    <SuperadminCommunicationView 
                      activeTab={superadminRoute.replace('sa-comm-', '')} 
                      onTabChange={(tabKey) => setSuperadminRoute(`sa-comm-${tabKey}`)} 
                    />
                  )}

                  {/* Reports & Analytics */}
                  {superadminRoute.startsWith('sa-reports-') && (
                    <SuperadminReportsAnalyticsView 
                      activeTab={superadminRoute.replace('sa-reports-', '')} 
                      onTabChange={(tabKey) => setSuperadminRoute(`sa-reports-${tabKey}`)} 
                    />
                  )}

                  {/* Policies & Guidelines */}
                  {superadminRoute.startsWith('sa-policies-') && (
                    <SuperadminPoliciesView 
                      activeTab={superadminRoute.replace('sa-policies-', '')} 
                      onTabChange={(tabKey) => setSuperadminRoute(`sa-policies-${tabKey}`)} 
                    />
                  )}

                  {/* Platform Settings */}
                  {superadminRoute.startsWith('sa-settings-') && (
                    <SuperadminPlatformSettingsView 
                      activeTab={superadminRoute.replace('sa-settings-', '')} 
                      onTabChange={(tabKey) => setSuperadminRoute(`sa-settings-${tabKey}`)} 
                    />
                  )}
                </Suspense>
              </ErrorBoundary>
            </main>
          </div>
        </div>

        {/* Global Settings Modal */}
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

  // Helper to reliably normalize an institute strictly to School
  const enrichInstituteTier = (inst) => {
    if (!inst) return inst
    return {
      ...inst,
      type: 'School',
      enabledTiers: ['school']
    }
  }

  // 2. SCHOOL ADMIN PORTAL (Dedicated School Management)
  const allKnownInstitutes = [...(institutes || []), ...(sampleTemplateData?.institutes || [])]
  const matchedInst = allKnownInstitutes.find(i => i.id === user?.instituteId)

  const rawScopedInstitute = matchedInst
    ? {
        ...matchedInst,
        type: 'School',
        enabledTiers: ['school']
      }
    : (user?.instituteId ? {
        id: user.instituteId,
        name: user.instituteName || 'City School Model Town Campus',
        code: user.instituteId === 'inst-2' ? 'CSM-002' : 'SCH-001',
        type: 'School',
        enabledTiers: ['school'],
        address: 'Designated School Campus'
      } : null)

  const scopedInstitute = enrichInstituteTier(rawScopedInstitute)

  const rawActiveCampus = (user?.role !== 'superadmin' && scopedInstitute)
    ? scopedInstitute
    : (selectedInstitute || matchedInst || allKnownInstitutes[0] || {
        id: user?.instituteId || 'inst-2',
        name: user?.instituteName || 'City School Model Town Campus',
        code: 'CSM-002',
        type: 'School',
        enabledTiers: ['school'],
        address: 'Central School Campus'
      })

  const activeCampus = enrichInstituteTier(rawActiveCampus)

  // Route access guard for school admin routes
  const isAllowedInstituteRoute = typeof canRoleAccessRoute === 'function'
    ? canRoleAccessRoute(user?.role || 'institute_admin', instituteRoute)
    : true
  const safeInstituteRoute = isAllowedInstituteRoute ? instituteRoute : 'inst-dashboard'

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#f4f7fb]">
      {/* Floating Impersonation Delegation Banner */}
      <ImpersonationBanner />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Institute Admin Sidebar */}
        <InstituteAdminSidebar
          currentRoute={safeInstituteRoute}
          onRouteChange={setInstituteRoute}
          currentInstitute={activeCampus}
          instituteName={activeCampus?.name}
          isMobileOpen={instMobileOpen}
          onCloseMobile={() => setInstMobileOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <InstituteAdminNavbar
            currentRoute={safeInstituteRoute}
            selectedInstitute={activeCampus}
            onSelectInstitute={setSelectedInstitute}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenMobileMenu={() => setInstMobileOpen(true)}
            onOpenCommandPalette={() => setIsPaletteOpen(true)}
            onRouteChange={setInstituteRoute}
            onOpenThemeModal={() => setIsThemeModalOpen(true)}
          />

          <main className="flex-1 overflow-y-auto">
            <ErrorBoundary onNavigateHome={() => setInstituteRoute('inst-dashboard')}>
              <Suspense fallback={<ModuleSkeletonLoader />}>
                {(!VALID_INSTITUTE_ROUTES.includes(safeInstituteRoute) || safeInstituteRoute === 'inst-dashboard') && (
                  <InstituteDashboard
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                  />
                )}
                {safeInstituteRoute === 'inst-admissions' && (
                  <AdmissionsPipelineView currentInstitute={activeCampus} />
                )}
                {safeInstituteRoute === 'inst-students' && (
                  <StudentsView currentInstitute={activeCampus} />
                )}
                {(safeInstituteRoute === 'inst-teachers' || safeInstituteRoute === 'inst-payroll') && (
                  <TeachersView 
                    currentInstitute={activeCampus} 
                    initialTab={safeInstituteRoute === 'inst-payroll' ? 'payroll' : 'directory'}
                  />
                )}
                {safeInstituteRoute === 'inst-classes' && (
                  <ClassesView currentInstitute={activeCampus} />
                )}
                {safeInstituteRoute === 'inst-timetable' && (
                  <TimetableView 
                    currentInstitute={activeCampus} 
                    onRouteChange={setInstituteRoute}
                  />
                )}
                {safeInstituteRoute === 'inst-attendance' && (
                  <AttendanceView 
                    currentInstitute={activeCampus} 
                    onRouteChange={setInstituteRoute}
                  />
                )}
                {safeInstituteRoute === 'inst-exams' && (
                  <ExamsView currentInstitute={activeCampus} />
                )}
                {safeInstituteRoute === 'inst-fees' && (
                  <FeesView currentInstitute={activeCampus} />
                )}
                {safeInstituteRoute === 'inst-accounts' && (
                  <CampusAccountsView currentInstitute={activeCampus} />
                )}
                {safeInstituteRoute === 'inst-subjects' && (
                  <SubjectsView currentInstitute={activeCampus} />
                )}
                {safeInstituteRoute === 'inst-notices' && (
                  <NoticeBoardView currentInstitute={activeCampus} />
                )}
                {safeInstituteRoute === 'inst-learning' && (
                  <LearningResourcesView currentInstitute={activeCampus} />
                )}
                {safeInstituteRoute === 'inst-transport' && (
                  <TransportView currentInstitute={activeCampus} />
                )}
                {safeInstituteRoute === 'inst-library' && (
                  <LibraryView currentInstitute={activeCampus} />
                )}
                {safeInstituteRoute === 'inst-inventory' && (
                  <CampusInventoryView currentInstitute={activeCampus} />
                )}
                {safeInstituteRoute === 'inst-certificates' && (
                  <CertificatesView currentInstitute={activeCampus} />
                )}
                {safeInstituteRoute === 'inst-events' && (
                  <CampusEventsCalendarView currentInstitute={activeCampus} />
                )}
                {safeInstituteRoute === 'inst-reports' && (
                  <CampusReportsAnalyticsView currentInstitute={activeCampus} />
                )}
                {safeInstituteRoute === 'inst-users' && (
                  <UsersManagementView 
                    defaultTab="all" 
                    currentInstitute={activeCampus} 
                    onRouteChange={setInstituteRoute} 
                  />
                )}
                {safeInstituteRoute === 'inst-settings' && (
                  <UsersManagementView 
                    defaultTab="roles" 
                    currentInstitute={activeCampus} 
                    onRouteChange={setInstituteRoute} 
                  />
                )}
                {safeInstituteRoute === 'inst-program-levels' && (
                  <ProgramLevelsView currentInstitute={activeCampus} />
                )}
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
      />

      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
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
      <ThemeProvider>
        <AuthProvider>
          <AppDataProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </AppDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
import React, { useState, useEffect, Suspense } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppDataProvider, useAppData } from './context/AppDataContext'
import { ToastProvider, useToast } from './context/ToastContext'
import { lazyWithRetry } from './utils/lazyWithRetry'
import { sampleTemplateData } from './services/dataService'

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
const StudentParentPortalView = lazyWithRetry(() => import('./modules/student-portal/StudentParentPortalView'), 'student-portal-view')

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
    'backup-data', 'system-health', 'support-approvals',
    'communication', 'audit-logs', 'announcements',
    'users-all', 'users-roles',
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
    'inst-dashboard', 'inst-students', 'inst-teachers', 'inst-classes',
    'inst-timetable', 'inst-attendance', 'inst-fees', 'inst-exams',
    'inst-subjects', 'inst-program-levels', 'inst-notices', 'inst-admissions',
    'inst-transport', 'inst-library', 'inst-certificates', 'inst-learning'
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
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace(/^#\/?/, '')
      if (hash === 'login' || hash === 'signin' || hash === 'superadmin' || hash === 'superadmin-login') return 'login'
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
        if (hash === 'login' || hash === 'signin' || hash === 'superadmin' || hash === 'superadmin-login') {
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

  // If no user is authenticated, display landing page, login page, or demo page
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
              window.location.hash = '#trial'
            }
          }}
        />
      )
    }
    if (publicView === 'demo') {
      return (
        <DemoComingSoonPage
          onBackToLanding={() => {
            setPublicView('landing')
            if (typeof window !== 'undefined') {
              window.location.hash = ''
            }
          }}
          onNavigateToLogin={() => {
            setPublicView('login')
            if (typeof window !== 'undefined') {
              window.location.hash = '#login'
            }
          }}
          onOpenTrial={() => {
            setPublicView('landing')
            if (typeof window !== 'undefined') {
              window.location.hash = '#pricing'
            }
          }}
        />
      )
    }
    return (
      <LandingPage
        onNavigateToLogin={() => {
          setPublicView('login')
          if (typeof window !== 'undefined') {
            window.location.hash = '#login'
          }
        }}
        onNavigateToDemo={() => {
          setPublicView('demo')
          if (typeof window !== 'undefined') {
            window.location.hash = '#demo'
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
                  {superadminRoute === 'communication' && <CommunicationGatewayView />}
                  {superadminRoute === 'audit-logs' && <AuditLogsView />}
                  {superadminRoute === 'announcements' && <NoticeBroadcasterView />}
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

  // 2. DEDICATED STUDENT & PARENT ACADEMIC PORTAL
  if (user?.role === 'student' || user?.role === 'parent') {
    return (
      <ErrorBoundary onNavigateHome={() => window.location.reload()}>
        <Suspense fallback={<ModuleLoader />}>
          <StudentParentPortalView />
        </Suspense>
      </ErrorBoundary>
    )
  }

  // 3. INSTITUTE ADMIN & FACULTY PORTAL (Dedicated Multi-Tenant Scoped Management)
  const allKnownInstitutes = [...(institutes || []), ...(sampleTemplateData?.institutes || [])]
  const matchedInst = allKnownInstitutes.find(i => i.id === user?.instituteId)

  const scopedInstitute = matchedInst
    ? {
        ...matchedInst,
        type: matchedInst.type || user?.instituteType || (matchedInst.id === 'inst-3' ? 'College' : matchedInst.id === 'inst-4' ? 'University' : matchedInst.id === 'inst-2' ? 'School' : 'Custom'),
        enabledTiers: matchedInst.enabledTiers || user?.enabledTiers || (matchedInst.id === 'inst-3' ? ['college'] : matchedInst.id === 'inst-4' ? ['undergraduate'] : matchedInst.id === 'inst-2' ? ['school'] : ['school', 'college'])
      }
    : (user?.instituteId ? {
        id: user.instituteId,
        name: user.instituteName || 'Designated Campus',
        code: user.instituteId === 'inst-3' ? 'RIA-003' : user.instituteId === 'inst-2' ? 'CSM-002' : user.instituteId === 'inst-4' ? 'IAS-004' : 'CAMPUS',
        type: user.instituteType || (user.instituteId === 'inst-3' || user.instituteName?.toLowerCase().includes('college') ? 'College' : user.instituteId === 'inst-4' || user.instituteName?.toLowerCase().includes('uni') ? 'University' : user.instituteId === 'inst-1' ? 'Custom' : 'School'),
        enabledTiers: user.enabledTiers || (
          user.instituteId === 'inst-3' || user.instituteName?.toLowerCase().includes('college') ? ['college'] :
          user.instituteId === 'inst-4' || user.instituteName?.toLowerCase().includes('uni') ? ['undergraduate'] :
          user.instituteId === 'inst-1' ? ['school', 'college'] : ['school']
        ),
        address: 'Designated Campus'
      } : null)

  const activeCampus = (user?.role === 'institute_admin' && scopedInstitute)
    ? scopedInstitute
    : (selectedInstitute || matchedInst || allKnownInstitutes[0] || {
        id: user?.instituteId || 'inst-1',
        name: user?.instituteName || 'Main Campus',
        code: 'SCH-001',
        type: user?.instituteType || 'Custom',
        enabledTiers: user?.enabledTiers || ['school', 'college'],
        address: 'Central Campus'
      })

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#f4f7fb]">
      {/* Floating Impersonation Delegation Banner */}
      <ImpersonationBanner />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Institute Admin Sidebar */}
        <InstituteAdminSidebar
          currentRoute={instituteRoute}
          onRouteChange={setInstituteRoute}
          currentInstitute={activeCampus}
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
                {instituteRoute === 'inst-admissions' && (
                  <AdmissionsPipelineView currentInstitute={activeCampus} />
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
                {instituteRoute === 'inst-transport' && (
                  <TransportView currentInstitute={activeCampus} />
                )}
                {instituteRoute === 'inst-library' && (
                  <LibraryView currentInstitute={activeCampus} />
                )}
                {instituteRoute === 'inst-certificates' && (
                  <CertificatesView currentInstitute={activeCampus} />
                )}
                {instituteRoute === 'inst-learning' && (
                  <LearningResourcesView currentInstitute={activeCampus} />
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
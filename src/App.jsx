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
const SchoolInquiriesView = lazyWithRetry(() => import('./modules/institute-management/inquiries/SchoolInquiriesView'), 'school-inquiries-view')
const ModulesControlView = lazyWithRetry(() => import('./modules/platform/modules/ModulesControlView'), 'modules-control')
const SecurityCenterView = lazyWithRetry(() => import('./modules/platform/security/SecurityCenterView'), 'security-center')
const CrossInstituteAnalyticsView = lazyWithRetry(() => import('./modules/platform/analytics/CrossInstituteAnalyticsView'), 'cross-institute-analytics')
const SubscriptionsBillingView = lazyWithRetry(() => import('./modules/platform/billing/SubscriptionsBillingView'), 'subscriptions-billing')
const GlobalTemplatesView = lazyWithRetry(() => import('./modules/platform/templates/GlobalTemplatesView'), 'global-templates')
const BackupDataView = lazyWithRetry(() => import('./modules/platform/backup/BackupDataView'), 'backup-data')
const SystemHealthView = lazyWithRetry(() => import('./modules/platform/health/SystemHealthView'), 'system-health')
const SupportApprovalsView = lazyWithRetry(() => import('./modules/platform/support/SupportApprovalsView'), 'support-approvals')
const UsersManagementView = lazyWithRetry(() => import('./modules/users-management/UsersManagementView'), 'users-management')
const PersonnelManagementView = lazyWithRetry(() => import('./modules/personnel/PersonnelManagementView'), 'personnel-management')
const TeacherPortalView = lazyWithRetry(() => import('./modules/teacher-portal/TeacherPortalView'), 'teacher-portal')
const NoticeBroadcasterView = lazyWithRetry(() => import('./modules/announcements/NoticeBroadcasterView'), 'notice-broadcaster')
const CommunicationGatewayView = lazyWithRetry(() => import('./modules/communication/CommunicationGatewayView'), 'communication-gateway')
const AuditLogsView = lazyWithRetry(() => import('./modules/audit-logs/AuditLogsView'), 'audit-logs')

// Superadmin Platform Governance Modules
const SuperadminPoliciesView = lazyWithRetry(() => import('./modules/platform/policies/SuperadminPoliciesView'), 'superadmin-policies')
const SuperadminPlatformSettingsView = lazyWithRetry(() => import('./modules/platform/settings/SuperadminPlatformSettingsView'), 'superadmin-settings')

// Institute Admin Operational Modules
const InstituteDashboard = lazyWithRetry(() => import('./modules/dashboard/InstituteDashboard'), 'institute-dashboard')
const StudentsView = lazyWithRetry(() => import('./modules/institute-admin/students/StudentsView'), 'students-view')
const TeachersView = lazyWithRetry(() => import('./modules/institute-admin/teachers/TeachersView'), 'teachers-view')
const StaffAndPayrollViews = lazyWithRetry(() => import('./modules/institute-admin/teachers/StaffAndPayrollViews'), 'staff-payroll-views')
const StaffLoansAndFinesViews = lazyWithRetry(() => import('./modules/institute-admin/teachers/StaffLoansAndFinesViews'), 'staff-loans-fines-views')
const StaffDocsAndIdCardsViews = lazyWithRetry(() => import('./modules/institute-admin/teachers/StaffDocsAndIdCardsViews'), 'staff-docs-idcards-views')
const HrReportsView = lazyWithRetry(() => import('./modules/institute-admin/teachers/HrReportsView'), 'hr-reports-view')
const ClassesView = lazyWithRetry(() => import('./modules/institute-admin/classes/ClassesView'), 'classes-view')
const TimetableView = lazyWithRetry(() => import('./modules/institute-admin/timetable/TimetableView'), 'timetable-view')
const AttendanceView = lazyWithRetry(() => import('./modules/institute-admin/attendance/AttendanceView'), 'attendance-view')
const FeesView = lazyWithRetry(() => import('./modules/institute-admin/fees/FeesView'), 'fees-view')
const ExamsView = lazyWithRetry(() => import('./modules/institute-admin/exams/ExamsView'), 'exams-view')
const SubjectsView = lazyWithRetry(() => import('./modules/institute-admin/subjects/SubjectsView'), 'subjects-view')
const ProgramLevelsView = lazyWithRetry(() => import('./modules/academics/ProgramLevelsView'), 'program-levels-view')
const NoticeBoardView = lazyWithRetry(() => import('./modules/institute-admin/notices/NoticeBoardView'), 'notice-board-view')
const CommunicationSuiteViews = lazyWithRetry(() => import('./modules/institute-admin/communication/CommunicationSuiteViews'), 'communication-suite-views')
const AdmissionInquiriesView = lazyWithRetry(() => import('./modules/admissions-pipeline/AdmissionInquiriesView'), 'admission-inquiries')
const OnlineApplicationsView = lazyWithRetry(() => import('./modules/admissions-pipeline/OnlineApplicationsView'), 'online-applications')
const BulkImportView = lazyWithRetry(() => import('./modules/admissions-pipeline/BulkImportView'), 'bulk-import')
const TransportView = lazyWithRetry(() => import('./modules/transport/TransportView'), 'transport-view')
const TransportAndHostelsViews = lazyWithRetry(() => import('./modules/institute-admin/transport-hostels/TransportAndHostelsViews'), 'transport-hostels-views')
const LibraryView = lazyWithRetry(() => import('./modules/library/LibraryView'), 'library-view')
const LibrarySuiteViews = lazyWithRetry(() => import('./modules/library/LibrarySuiteViews'), 'library-suite-views')
const CertificatesView = lazyWithRetry(() => import('./modules/institute-admin/certificates/CertificatesView'), 'certificates-view')
const LearningResourcesView = lazyWithRetry(() => import('./modules/institute-admin/learning/LearningResourcesView'), 'learning-resources-view')
const CampusInventoryView = lazyWithRetry(() => import('./modules/institute-admin/inventory/CampusInventoryView'), 'campus-inventory-view')
const InventorySuiteViews = lazyWithRetry(() => import('./modules/institute-admin/inventory/InventorySuiteViews'), 'inventory-suite-views')
const InventoryReportsView = lazyWithRetry(() => import('./modules/institute-admin/inventory/InventoryReportsView'), 'inventory-reports-view')
const CampusEventsCalendarView = lazyWithRetry(() => import('./modules/institute-admin/events/CampusEventsCalendarView'), 'campus-events-view')
const CampusReportsAnalyticsView = lazyWithRetry(() => import('./modules/institute-admin/reports/CampusReportsAnalyticsView'), 'campus-reports-view')
const StudentPerformanceReportsView = lazyWithRetry(() => import('./modules/institute-admin/students/StudentPerformanceReportsView'), 'student-performance-reports-view')

const CampusAccountsView = lazyWithRetry(() => import('./modules/institute-admin/accounts/CampusAccountsView'), 'campus-accounts-view')
const HostelsView = lazyWithRetry(() => import('./modules/institute-admin/hostels/HostelsView'), 'campus-hostels-view')
const CampusPoliciesView = lazyWithRetry(() => import('./modules/institute-admin/policies/CampusPoliciesView'), 'campus-policies-view')
const CampusSettingsView = lazyWithRetry(() => import('./modules/institute-admin/settings/CampusSettingsView'), 'campus-settings-view')
const TrainingVideosView = lazyWithRetry(() => import('./modules/institute-admin/training/TrainingVideosView'), 'campus-training-view')
const MyAccountView = lazyWithRetry(() => import('./modules/institute-admin/account/MyAccountView'), 'campus-account-view')
const EnrollStudentView = lazyWithRetry(() => import('./modules/institute-admin/students/EnrollStudentView'), 'enroll-student-view')
const QuickPaymentModal = lazyWithRetry(() => import('./components/common/QuickPaymentModal'), 'quick-payment-modal')
const SendSmsModal = lazyWithRetry(() => import('./components/common/SendSmsModal'), 'send-sms-modal')
const StudentBillingHistoryView = lazyWithRetry(() => import('./modules/institute-admin/fees/StudentBillingHistoryView'), 'student-billing-history')
const StudentFeeSetupView = lazyWithRetry(() => import('./modules/institute-admin/fees/StudentFeeSetupView'), 'student-fee-setup')
const StudentProfileView = lazyWithRetry(() => import('./modules/institute-admin/students/StudentProfileView'), 'student-profile-view')
const InvoicesView = lazyWithRetry(() => import('./modules/institute-admin/fees/InvoicesView'), 'invoices-view')
const FamilyInvoicesView = lazyWithRetry(() => import('./modules/institute-admin/fees/FamilyInvoicesView'), 'family-invoices-view')
const PaymentApprovalsView = lazyWithRetry(() => import('./modules/institute-admin/fees/PaymentApprovalsView'), 'payment-approvals-view')
const OutstandingFeesView = lazyWithRetry(() => import('./modules/institute-admin/fees/OutstandingFeesView'), 'outstanding-fees-view')
const FinesView = lazyWithRetry(() => import('./modules/institute-admin/fees/FinesView'), 'fines-view')
const FeeSettingsViews = lazyWithRetry(() => import('./modules/institute-admin/fees/FeeSettingsViews'), 'fee-settings-views')
const AcademicsViews = lazyWithRetry(() => import('./modules/institute-admin/academics/AcademicsViews'), 'academics-views')
const AcademicsResourcesViews = lazyWithRetry(() => import('./modules/institute-admin/academics/AcademicsResourcesViews'), 'academics-resources-views')
const ExamsManagementViews = lazyWithRetry(() => import('./modules/institute-admin/exams/ExamsManagementViews'), 'exams-management-views')
const ExamsResultsViews = lazyWithRetry(() => import('./modules/institute-admin/exams/ExamsResultsViews'), 'exams-results-views')
const FinanceDashboardAndIncomeViews = lazyWithRetry(() => import('./modules/institute-admin/finance/FinanceDashboardAndIncomeViews'), 'finance-dashboard-income-views')
const ExpensesView = lazyWithRetry(() => import('./modules/institute-admin/accounts/ExpensesView'), 'expenses-view')
const ExpenseCategoriesView = lazyWithRetry(() => import('./modules/institute-admin/accounts/ExpenseCategoriesView'), 'expense-categories-view')
const FeeCollectionReportView = lazyWithRetry(() => import('./modules/institute-admin/accounts/FeeCollectionReportView'), 'fee-collection-report-view')
const MyAttendanceView = lazyWithRetry(() => import('./modules/institute-admin/attendance/MyAttendanceView'), 'my-attendance-view')
const AttendanceReportsViews = lazyWithRetry(() => import('./modules/institute-admin/attendance/AttendanceReportsViews'), 'attendance-reports-views')
const StudentAttendanceReportView = lazyWithRetry(() => import('./modules/institute-admin/attendance/StudentAttendanceReportView'), 'student-attendance-report-view')

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
    'dashboard',
    'institutes',
    'school-inquiries',
    'support-approvals',
    'platform-billing',
    'users-all',
    'users-roles',
    'security-center',
    'global-templates',
    'compliance-policies',
    'sa-policies',
    'cross-institute-analytics',
    'platform-analytics',
    'announcements',
    'system-health',
    'audit-logs',
    'backup-data',
    'platform-settings',
    'sa-settings',
    'platform-modules',
    // Policies sub-tabs
    'sa-policies-academic', 'sa-policies-fees', 'sa-policies-attendance',
    'sa-policies-discipline', 'sa-policies-privacy', 'sa-policies-publish',
    'sa-policies-acknowledgment',
    // Settings sub-tabs
    'sa-settings-general', 'sa-settings-branding', 'sa-settings-flags',
    'sa-settings-integrations', 'sa-settings-compliance', 'sa-settings-legal',
    'sa-settings-maintenance', 'sa-settings-impersonate', 'sa-settings-backups'
  ]

  const VALID_INSTITUTE_ROUTES = [
    'inst-dashboard',
    'inst-admissions', 'inst-admissions-online', 'inst-admissions-enroll', 'inst-admissions-import',
    'inst-students', 'inst-students-guardians', 'inst-students-promote', 'inst-students-manage-promotions', 'inst-students-graduated', 'inst-students-drop-leave', 'inst-students-status', 'inst-students-idcards',
    'inst-reports-students', 'inst-certificates',
    'inst-attendance', 'inst-attendance-my', 'inst-attendance-student-report', 'inst-attendance-staff-report',
    'inst-attendance-consecutive', 'inst-attendance-low', 'inst-attendance-unmarked', 'inst-attendance-settings',
    'inst-fees', 'inst-fees-history', 'inst-fees-family', 'inst-fees-approvals',
    'inst-fees-outstanding', 'inst-fees-fines', 'inst-fees-setup', 'inst-fees-settings', 'inst-fees-categories', 'inst-fees-payment-methods', 'inst-fees-invoice-layout',
    'inst-classes', 'inst-subjects', 'inst-timetable', 'inst-assignments',
    'inst-learning', 'inst-learning-handouts', 'inst-learning-lectures', 'inst-events', 'inst-makeup-sessions',
    'inst-program-levels',
    'inst-exams', 'inst-exams-schedule', 'inst-exams-assessments', 'inst-exams-marks',
    'inst-exams-result-summary', 'inst-exams-report-cards', 'inst-exams-grades', 'inst-exams-settings',
    'inst-accounts', 'inst-accounts-collection', 'inst-accounts-income', 'inst-accounts-expenses', 'inst-accounts-categories',
    'inst-teachers', 'inst-payroll', 'inst-salary-setup', 'inst-staff-loans', 'inst-staff-fines',
    'inst-staff-docs', 'inst-staff-letters', 'inst-staff-idcards', 'inst-staff-reports',
    'inst-communication', 'inst-communication-inbox', 'inst-notices', 'inst-communication-notifications',
    'inst-communication-whatsapp', 'inst-communication-sms',
    'inst-inventory', 'inst-inventory-categories', 'inst-inventory-receive', 'inst-inventory-issue', 'inst-inventory-reports',
    'inst-library', 'inst-library-issue',
    'inst-transport', 'inst-hostels',
    'inst-reports', 'inst-policies',
    'inst-users', 'inst-settings', 'inst-settings-locations', 'inst-settings-activity',
    'inst-training', 'inst-my-account'
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
  const [isQuickPaymentOpen, setIsQuickPaymentOpen] = useState(false)
  const [quickPayStudentId, setQuickPayStudentId] = useState(null)
  const [billingHistoryStudentId, setBillingHistoryStudentId] = useState(null)
  const [feeSetupTargetStudentId, setFeeSetupTargetStudentId] = useState(null)
  const [feeSetupInitialMode, setFeeSetupInitialMode] = useState('details')
  const [studentProfileTargetId, setStudentProfileTargetId] = useState(null)
  const [studentsInitialClass, setStudentsInitialClass] = useState('ALL')
  const [invoicesInitialScope, setInvoicesInitialScope] = useState('ALL')
  const [attendanceReportClass, setAttendanceReportClass] = useState('')
  const [attendanceReportReturnRoute, setAttendanceReportReturnRoute] = useState('inst-attendance')
  const [isSendSmsOpen, setIsSendSmsOpen] = useState(false)
  const openQuickPayment = (studentId = null) => {
    setQuickPayStudentId(studentId)
    setIsQuickPaymentOpen(true)
  }

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

  // Superadmin Route Aliases to normalize shortcuts and prevent invalid fallback
  const SUPERADMIN_ROUTE_ALIASES = {
    'inquiries': 'school-inquiries',
    'school-inquiry': 'school-inquiries',
    'inquiry': 'school-inquiries',
    'subscriptions': 'platform-billing',
    'billing': 'platform-billing',
    'packages': 'platform-billing',
    'users': 'users-all',
    'roles': 'users-roles',
    'staff': 'users-all',
    'personnel': 'users-all',
    'personnel-staff': 'users-all',
    'personnel-roles': 'users-roles',
    'approvals': 'support-approvals',
    'support': 'support-approvals',
    'modules': 'platform-modules',
    'settings': 'platform-settings',
    'policies': 'compliance-policies',
    'analytics': 'cross-institute-analytics',
    'health': 'system-health',
    'backup': 'backup-data',
    'logs': 'audit-logs',
    'broadcasts': 'announcements'
  }

  // Route setters that update the browser URL hash without full reload
  const setSuperadminRoute = (route) => {
    const resolved = SUPERADMIN_ROUTE_ALIASES[route] || route
    const valid = VALID_SUPERADMIN_ROUTES.includes(resolved) ? resolved : 'dashboard'
    setSuperadminRouteState(valid)
    if (typeof window !== 'undefined') {
      window.location.hash = `#${valid}`
    }
  }

  const setInstituteRoute = (route, options = {}) => {
    const valid = VALID_INSTITUTE_ROUTES.includes(route) ? route : 'inst-dashboard'
    if (valid === 'inst-fees-setup' && !options?.preserveFeeSetupStudent) {
      setFeeSetupTargetStudentId(null)
      setFeeSetupInitialMode('list')
    }
    if (valid === 'inst-students' && !options?.preserveStudentProfile) {
      setStudentProfileTargetId(null)
      setStudentsInitialClass('ALL')
    }
    if (valid === 'inst-fees') {
      setInvoicesInitialScope(options?.studentScope || 'ALL')
    }
    if (valid === 'inst-attendance-student-report' && !options?.preserveAttendanceReport) {
      setAttendanceReportClass('')
      setAttendanceReportReturnRoute('inst-attendance')
    }
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
                  {superadminRoute === 'school-inquiries' && (
                    <SchoolInquiriesView onRouteChange={setSuperadminRoute} />
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
                  {superadminRoute === 'audit-logs' && <AuditLogsView />}
                  {(superadminRoute === 'announcements' || superadminRoute === 'system-broadcasts') && (
                    <NoticeBroadcasterView />
                  )}
                  {(superadminRoute === 'cross-institute-analytics' || superadminRoute === 'platform-analytics') && (
                    <CrossInstituteAnalyticsView />
                  )}
                  {(superadminRoute === 'users-all' || superadminRoute === 'personnel-staff') && (
                    <PersonnelManagementView defaultTab="staff" onRouteChange={setSuperadminRoute} />
                  )}
                  {(superadminRoute === 'users-roles' || superadminRoute === 'personnel-roles') && (
                    <PersonnelManagementView defaultTab="roles" onRouteChange={setSuperadminRoute} />
                  )}

                  {/* Compliance & Governance Policies */}
                  {(superadminRoute === 'compliance-policies' || superadminRoute === 'sa-policies' || superadminRoute.startsWith('sa-policies-')) && (
                    <SuperadminPoliciesView 
                      activeTab={superadminRoute.startsWith('sa-policies-') ? superadminRoute.replace('sa-policies-', '') : 'academic'} 
                      onTabChange={(tabKey) => setSuperadminRoute(`sa-policies-${tabKey}`)} 
                    />
                  )}

                  {/* Platform Settings */}
                  {(superadminRoute === 'platform-settings' || superadminRoute === 'sa-settings' || superadminRoute.startsWith('sa-settings-')) && (
                    <SuperadminPlatformSettingsView 
                      activeTab={superadminRoute.startsWith('sa-settings-') ? superadminRoute.replace('sa-settings-', '') : 'general'} 
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

  // 2. TEACHER PORTAL (Academic Faculty Console)
  if (user.role === 'teacher') {
    return (
      <Suspense fallback={<ModuleSkeletonLoader />}>
        <TeacherPortalView />
      </Suspense>
    )
  }

  // 3. SCHOOL ADMIN PORTAL (Dedicated School Management)
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
                    onOpenQuickPayment={() => openQuickPayment(null)}
                    onOpenSendSms={() => setIsSendSmsOpen(true)}
                  />
                )}
                {safeInstituteRoute === 'inst-admissions' && (
                  <AdmissionInquiriesView
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                  />
                )}
                {safeInstituteRoute === 'inst-admissions-online' && (
                  <OnlineApplicationsView
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                  />
                )}
                {safeInstituteRoute === 'inst-admissions-import' && (
                  <BulkImportView
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                  />
                )}
                {safeInstituteRoute === 'inst-admissions-enroll' && (
                  <EnrollStudentView
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={() => openQuickPayment(null)}
                    onOpenSendSms={() => setIsSendSmsOpen(true)}
                  />
                )}
                {safeInstituteRoute === 'inst-students' && studentProfileTargetId ? (
                  <StudentProfileView
                    currentInstitute={activeCampus}
                    studentId={studentProfileTargetId}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                    onOpenSendSms={() => setIsSendSmsOpen(true)}
                    onBackToList={(cls) => {
                      setStudentsInitialClass(cls || 'ALL')
                      setStudentProfileTargetId(null)
                    }}
                    onBack={() => {
                      setStudentProfileTargetId(null)
                      setInstituteRoute('inst-fees-history')
                    }}
                    onOpenFeeSetup={(sid, mode = 'details') => {
                      setFeeSetupTargetStudentId(sid)
                      setFeeSetupInitialMode(mode)
                      setInstituteRoute('inst-fees-setup', { preserveFeeSetupStudent: true })
                    }}
                    onOpenBillingHistory={(sid) => {
                      setBillingHistoryStudentId(sid)
                      setInstituteRoute('inst-fees-history')
                    }}
                    onOpenAttendanceReport={(cls) => {
                      setAttendanceReportClass(cls || '')
                      setAttendanceReportReturnRoute('inst-students')
                      setInstituteRoute('inst-attendance-student-report', {
                        preserveStudentProfile: true,
                        preserveAttendanceReport: true
                      })
                    }}
                  />
                ) : ['inst-students', 'inst-students-guardians', 'inst-students-promote', 'inst-students-manage-promotions', 'inst-students-graduated', 'inst-students-drop-leave', 'inst-students-status', 'inst-students-idcards'].includes(safeInstituteRoute) && (
                  <StudentsView
                    currentInstitute={activeCampus}
                    initialClassFilter={studentsInitialClass}
                    initialAction={
                      safeInstituteRoute === 'inst-students-guardians' ? 'guardians'
                        : safeInstituteRoute === 'inst-students-promote' ? 'promote'
                          : safeInstituteRoute === 'inst-students-manage-promotions' ? 'manage-promotions'
                            : safeInstituteRoute === 'inst-students-graduated' ? 'graduated'
                              : safeInstituteRoute === 'inst-students-drop-leave' ? 'drop-leave'
                                : safeInstituteRoute === 'inst-students-status' ? 'drop-leave'
                                  : safeInstituteRoute === 'inst-students-idcards' ? 'idcards'
                                    : null
                    }
                    onRouteChange={setInstituteRoute}
                    onOpenProfile={(sid) => setStudentProfileTargetId(sid)}
                    onOpenFeeSetup={(sid, mode = 'edit') => {
                      setFeeSetupTargetStudentId(sid)
                      setFeeSetupInitialMode(mode)
                      setInstituteRoute('inst-fees-setup', { preserveFeeSetupStudent: true })
                    }}
                    onOpenBillingHistory={(sid) => {
                      setBillingHistoryStudentId(sid)
                      setInstituteRoute('inst-fees-history')
                    }}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                  />
                )}
                {['inst-teachers', 'inst-payroll', 'inst-salary-setup'].includes(safeInstituteRoute) && (
                  <StaffAndPayrollViews
                    mode={
                      safeInstituteRoute === 'inst-payroll' ? 'payroll'
                        : safeInstituteRoute === 'inst-salary-setup' ? 'salary-setup'
                          : 'staff'
                    }
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                    onOpenSendSms={() => setIsSendSmsOpen(true)}
                  />
                )}
                {['inst-staff-loans', 'inst-staff-fines'].includes(safeInstituteRoute) && (
                  <StaffLoansAndFinesViews
                    mode={safeInstituteRoute === 'inst-staff-fines' ? 'fines' : 'loans'}
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                    onOpenSendSms={() => setIsSendSmsOpen(true)}
                  />
                )}
                {['inst-staff-docs', 'inst-staff-letters', 'inst-staff-idcards'].includes(safeInstituteRoute) && (
                  <StaffDocsAndIdCardsViews
                    mode={
                      safeInstituteRoute === 'inst-staff-letters' ? 'letters'
                        : safeInstituteRoute === 'inst-staff-idcards' ? 'idcards'
                          : 'docs'
                    }
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                    onOpenSendSms={() => setIsSendSmsOpen(true)}
                  />
                )}
                {safeInstituteRoute === 'inst-staff-reports' && (
                  <HrReportsView
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                    onOpenSendSms={() => setIsSendSmsOpen(true)}
                  />
                )}
                {['inst-classes', 'inst-subjects', 'inst-timetable', 'inst-assignments'].includes(safeInstituteRoute) && (
                  <AcademicsViews
                    mode={
                      safeInstituteRoute === 'inst-subjects' ? 'subjects'
                        : safeInstituteRoute === 'inst-timetable' ? 'timetable'
                          : safeInstituteRoute === 'inst-assignments' ? 'assignments'
                            : 'classes'
                    }
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                  />
                )}
                {['inst-learning-handouts', 'inst-learning-lectures', 'inst-events', 'inst-makeup-sessions'].includes(safeInstituteRoute) && (
                  <AcademicsResourcesViews
                    mode={
                      safeInstituteRoute === 'inst-learning-lectures' ? 'lectures'
                        : safeInstituteRoute === 'inst-events' ? 'calendar'
                          : safeInstituteRoute === 'inst-makeup-sessions' ? 'makeup'
                            : 'handouts'
                    }
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                  />
                )}
                {safeInstituteRoute === 'inst-attendance-my' && (
                  <MyAttendanceView
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                    onOpenSendSms={() => setIsSendSmsOpen(true)}
                  />
                )}
                {['inst-attendance-staff-report', 'inst-attendance-consecutive', 'inst-attendance-low', 'inst-attendance-unmarked'].includes(safeInstituteRoute) && (
                  <AttendanceReportsViews
                    mode={
                      safeInstituteRoute === 'inst-attendance-staff-report' ? 'staff'
                        : safeInstituteRoute === 'inst-attendance-consecutive' ? 'consecutive'
                          : safeInstituteRoute === 'inst-attendance-unmarked' ? 'unmarked'
                            : 'low'
                    }
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenProfile={(sid) => setStudentProfileTargetId(sid)}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                  />
                )}
                {['inst-attendance', 'inst-attendance-settings'].includes(safeInstituteRoute) && (
                  <AttendanceView
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenProfile={(sid) => setStudentProfileTargetId(sid)}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                    initialTab="daily"
                    initialAction={safeInstituteRoute === 'inst-attendance-settings' ? 'settings' : null}
                  />
                )}
                {['inst-exams', 'inst-exams-schedule', 'inst-exams-assessments', 'inst-exams-marks'].includes(safeInstituteRoute) && (
                  <ExamsManagementViews
                    mode={
                      safeInstituteRoute === 'inst-exams-schedule' ? 'schedule'
                        : safeInstituteRoute === 'inst-exams-assessments' ? 'assessments'
                          : safeInstituteRoute === 'inst-exams-marks' ? 'marks'
                            : 'exams'
                    }
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                  />
                )}
                {['inst-exams-result-summary', 'inst-exams-report-cards', 'inst-exams-grades', 'inst-exams-settings'].includes(safeInstituteRoute) && (
                  <ExamsResultsViews
                    mode={
                      safeInstituteRoute === 'inst-exams-report-cards' ? 'report-cards'
                        : safeInstituteRoute === 'inst-exams-grades' ? 'grades'
                          : safeInstituteRoute === 'inst-exams-settings' ? 'settings'
                            : 'summary'
                    }
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                  />
                )}
                {safeInstituteRoute === 'inst-fees-history' && (
                  <StudentBillingHistoryView
                    currentInstitute={activeCampus}
                    studentId={billingHistoryStudentId}
                    onSelectStudent={setBillingHistoryStudentId}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                    onOpenSendSms={() => setIsSendSmsOpen(true)}
                    onOpenFeeSetup={(sid) => {
                      setFeeSetupTargetStudentId(sid)
                      setFeeSetupInitialMode('details')
                      setInstituteRoute('inst-fees-setup', { preserveFeeSetupStudent: true })
                    }}
                    onOpenViewProfile={(sid) => {
                      setStudentProfileTargetId(sid)
                      setInstituteRoute('inst-students', { preserveStudentProfile: true })
                    }}
                  />
                )}
                {safeInstituteRoute === 'inst-fees' && (
                  <InvoicesView
                    currentInstitute={activeCampus}
                    initialStudentScope={invoicesInitialScope}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                    onOpenSendSms={() => setIsSendSmsOpen(true)}
                    onOpenBillingHistory={(sid) => {
                      setBillingHistoryStudentId(sid)
                      setInstituteRoute('inst-fees-history')
                    }}
                  />
                )}
                {safeInstituteRoute === 'inst-fees-setup' && (
                  <StudentFeeSetupView
                    currentInstitute={activeCampus}
                    studentId={feeSetupTargetStudentId}
                    initialMode={feeSetupTargetStudentId ? feeSetupInitialMode : 'list'}
                    onSelectStudent={setFeeSetupTargetStudentId}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                    onOpenSendSms={() => setIsSendSmsOpen(true)}
                  />
                )}
                {safeInstituteRoute === 'inst-fees-family' && (
                  <FamilyInvoicesView
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenBillingHistory={(sid) => {
                      setBillingHistoryStudentId(sid)
                      setInstituteRoute('inst-fees-history')
                    }}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                  />
                )}
                {safeInstituteRoute === 'inst-fees-approvals' && (
                  <PaymentApprovalsView
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                  />
                )}
                {safeInstituteRoute === 'inst-fees-outstanding' && (
                  <OutstandingFeesView
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenBillingHistory={(sid) => {
                      setBillingHistoryStudentId(sid)
                      setInstituteRoute('inst-fees-history')
                    }}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                  />
                )}
                {safeInstituteRoute === 'inst-fees-fines' && (
                  <FinesView
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenBillingHistory={(sid) => {
                      setBillingHistoryStudentId(sid)
                      setInstituteRoute('inst-fees-history')
                    }}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                  />
                )}
                {['inst-fees-settings', 'inst-fees-categories', 'inst-fees-payment-methods', 'inst-fees-invoice-layout'].includes(safeInstituteRoute) && (
                  <FeeSettingsViews
                    mode={
                      safeInstituteRoute === 'inst-fees-payment-methods' ? 'payment-methods'
                        : safeInstituteRoute === 'inst-fees-invoice-layout' ? 'invoice-layout'
                          : 'categories'
                    }
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                  />
                )}
                {safeInstituteRoute === 'inst-accounts-expenses' && (
                  <ExpensesView
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                    onOpenSendSms={() => setIsSendSmsOpen(true)}
                  />
                )}
                {safeInstituteRoute === 'inst-accounts-collection' && (
                  <FeeCollectionReportView
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                    onOpenSendSms={() => setIsSendSmsOpen(true)}
                    onOpenBillingHistory={(sid) => {
                      setBillingHistoryStudentId(sid)
                      setInstituteRoute('inst-fees-history')
                    }}
                  />
                )}
                {['inst-accounts', 'inst-accounts-income'].includes(safeInstituteRoute) && (
                  <FinanceDashboardAndIncomeViews
                    mode={safeInstituteRoute === 'inst-accounts-income' ? 'other-income' : 'dashboard'}
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                  />
                )}
                {safeInstituteRoute === 'inst-accounts-categories' && (
                  <ExpenseCategoriesView
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                    onOpenSendSms={() => setIsSendSmsOpen(true)}
                  />
                )}
                {['inst-notices', 'inst-communication-inbox', 'inst-communication-notifications', 'inst-communication-whatsapp'].includes(safeInstituteRoute) && (
                  <CommunicationSuiteViews
                    mode={
                      safeInstituteRoute === 'inst-notices' ? 'announcements'
                        : safeInstituteRoute === 'inst-communication-notifications' ? 'notifications'
                          : safeInstituteRoute === 'inst-communication-whatsapp' ? 'whatsapp'
                            : 'inbox'
                    }
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                    onOpenSendSms={() => setIsSendSmsOpen(true)}
                  />
                )}
                {safeInstituteRoute === 'inst-learning' && (
                  <LearningResourcesView
                    currentInstitute={activeCampus}
                    initialTab="notes"
                  />
                )}
                {['inst-transport', 'inst-hostels'].includes(safeInstituteRoute) && (
                  <TransportAndHostelsViews
                    mode={safeInstituteRoute === 'inst-hostels' ? 'hostels' : 'transport'}
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                    onOpenSendSms={() => setIsSendSmsOpen(true)}
                  />
                )}
                {['inst-library', 'inst-library-issue'].includes(safeInstituteRoute) && (
                  <LibrarySuiteViews
                    mode={safeInstituteRoute === 'inst-library-issue' ? 'issue' : 'books'}
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                    onOpenSendSms={() => setIsSendSmsOpen(true)}
                  />
                )}
                {['inst-inventory', 'inst-inventory-categories', 'inst-inventory-receive', 'inst-inventory-issue'].includes(safeInstituteRoute) && (
                  <InventorySuiteViews
                    mode={
                      safeInstituteRoute === 'inst-inventory-categories' ? 'categories'
                        : safeInstituteRoute === 'inst-inventory-receive' ? 'receive'
                          : safeInstituteRoute === 'inst-inventory-issue' ? 'issue'
                            : 'items'
                    }
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                    onOpenSendSms={() => setIsSendSmsOpen(true)}
                  />
                )}
                {safeInstituteRoute === 'inst-inventory-reports' && (
                  <InventoryReportsView
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                    onOpenSendSms={() => setIsSendSmsOpen(true)}
                  />
                )}
                {safeInstituteRoute === 'inst-certificates' && (
                  <CertificatesView currentInstitute={activeCampus} />
                )}
                {safeInstituteRoute === 'inst-events-legacy' && (
                  <CampusEventsCalendarView currentInstitute={activeCampus} />
                )}
                {safeInstituteRoute === 'inst-reports' && (
                  <CampusReportsAnalyticsView currentInstitute={activeCampus} />
                )}
                {safeInstituteRoute === 'inst-reports-students' && (
                  <StudentPerformanceReportsView
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    onOpenProfile={(sid) => setStudentProfileTargetId(sid)}
                    onOpenQuickPayment={(sid) => openQuickPayment(sid)}
                  />
                )}
                {safeInstituteRoute === 'inst-users' && (
                  <UsersManagementView 
                    defaultTab="all" 
                    currentInstitute={activeCampus} 
                    onRouteChange={setInstituteRoute} 
                  />
                )}
                {['inst-settings', 'inst-settings-locations', 'inst-settings-activity'].includes(safeInstituteRoute) && (
                  <CampusSettingsView
                    currentInstitute={activeCampus}
                    onRouteChange={setInstituteRoute}
                    initialTab={
                      safeInstituteRoute === 'inst-settings-locations' ? 'locations'
                        : safeInstituteRoute === 'inst-settings-activity' ? 'activity'
                          : 'profile'
                    }
                  />
                )}
                {['inst-communication', 'inst-communication-sms'].includes(safeInstituteRoute) && (
                  <CommunicationGatewayView
                    initialTab={safeInstituteRoute === 'inst-communication-sms' ? 'settings' : 'compose'}
                    initialChannel="SMS"
                  />
                )}
                {safeInstituteRoute === 'inst-policies' && (
                  <CampusPoliciesView currentInstitute={activeCampus} />
                )}
                {safeInstituteRoute === 'inst-training' && (
                  <TrainingVideosView onRouteChange={setInstituteRoute} />
                )}
                {safeInstituteRoute === 'inst-my-account' && (
                  <MyAccountView currentInstitute={activeCampus} />
                )}
                {safeInstituteRoute === 'inst-program-levels' && (
                  <ProgramLevelsView currentInstitute={activeCampus} />
                )}
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>

      <Suspense fallback={null}>
        {isQuickPaymentOpen && (
          <QuickPaymentModal
            isOpen={isQuickPaymentOpen}
            onClose={() => setIsQuickPaymentOpen(false)}
            currentInstitute={activeCampus}
            preselectedStudentId={quickPayStudentId}
            onOpenBillingDetail={(studentOrId) => {
              const sid = typeof studentOrId === 'string' ? studentOrId : studentOrId?.id || null
              setBillingHistoryStudentId(sid)
              setIsQuickPaymentOpen(false)
              setInstituteRoute('inst-fees-history')
            }}
          />
        )}
        {isSendSmsOpen && (
          <SendSmsModal
            isOpen={isSendSmsOpen}
            onClose={() => setIsSendSmsOpen(false)}
            currentInstitute={activeCampus}
          />
        )}
      </Suspense>

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
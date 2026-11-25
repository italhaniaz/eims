import { DataService, getStoredData, saveStoredData } from './dataService'

/**
 * Enterprise Admin Control & Institute Feature Matrix Service
 *
 * Provides central governance over:
 * 1. Campus Feature Matrix (module switches per institute)
 * 2. Institute Administrator Granular Overrides (custom privileges)
 * 3. Platform Internal Team RBAC (permissions for Super Admin staff)
 */

// ---------------------------------------------------------------------
// 1. INSTITUTE FEATURES REGISTRY (15 Core Functional Capabilities)
// ---------------------------------------------------------------------
export const INSTITUTE_FEATURES_REGISTRY = [
  {
    key: 'students',
    name: 'Students & SIS',
    category: 'Core Academic',
    icon: 'Users',
    description: 'Student profiles, admission dossiers, B-Form verification, student ID cards',
    defaultInTrial: true,
    defaultInSchool: true,
    defaultInEnterprise: true,
    isCore: true
  },
  {
    key: 'fees',
    name: 'Fee Billing & POS',
    category: 'Finance',
    icon: 'DollarSign',
    description: 'Bank fee challan vouchers (1Link/1Bill), online collections, dues & ledgers',
    defaultInTrial: true,
    defaultInSchool: true,
    defaultInEnterprise: true,
    isCore: true
  },
  {
    key: 'exams',
    name: 'Examinations & Grading',
    category: 'Core Academic',
    icon: 'Award',
    description: 'Term exams, mark entry, admit cards, GPA calculation, progress report cards',
    defaultInTrial: true,
    defaultInSchool: true,
    defaultInEnterprise: true,
    isCore: true
  },
  {
    key: 'attendance',
    name: 'Attendance & Biometrics',
    category: 'Core Academic',
    icon: 'Clock',
    description: 'Daily student & staff attendance, RFID / biometric punch sync, leave slips',
    defaultInTrial: true,
    defaultInSchool: true,
    defaultInEnterprise: true,
    isCore: true
  },
  {
    key: 'classes',
    name: 'Classes & Timetables',
    category: 'Core Academic',
    icon: 'Calendar',
    description: 'Class sections, timetable period matrices, teacher assignments, room plans',
    defaultInTrial: true,
    defaultInSchool: true,
    defaultInEnterprise: true,
    isCore: true
  },
  {
    key: 'academics',
    name: 'Curriculum & Diary',
    category: 'Core Academic',
    icon: 'BookOpen',
    description: 'Syllabus coverage tracker, daily student homework diary, teacher lesson plans',
    defaultInTrial: false,
    defaultInSchool: true,
    defaultInEnterprise: true,
    isCore: false
  },
  {
    key: 'payroll',
    name: 'HR & Staff Payroll',
    category: 'Operations',
    icon: 'Briefcase',
    description: 'Staff compensation, payroll generation, monthly payslips, allowances & loans',
    defaultInTrial: false,
    defaultInSchool: false,
    defaultInEnterprise: true,
    isCore: false
  },
  {
    key: 'communication',
    name: 'Multi-Channel SMS & Notices',
    category: 'Messaging',
    icon: 'Megaphone',
    description: 'Automated fee SMS alerts, in-portal broadcast notices, WhatsApp integration',
    defaultInTrial: false,
    defaultInSchool: true,
    defaultInEnterprise: true,
    isCore: false
  },
  {
    key: 'library',
    name: 'Central Library Suite',
    category: 'Resources',
    icon: 'BookMarked',
    description: 'Book cataloging, barcode issue/return engine, student borrower records & fines',
    defaultInTrial: false,
    defaultInSchool: false,
    defaultInEnterprise: true,
    isCore: false
  },
  {
    key: 'transport',
    name: 'Fleet Logistics & Transport',
    category: 'Logistics',
    icon: 'Bus',
    description: 'School bus routes, driver rosters, vehicle tracking, pickup point allocations',
    defaultInTrial: false,
    defaultInSchool: false,
    defaultInEnterprise: true,
    isCore: false
  },
  {
    key: 'hostel',
    name: 'Hostel & Boarding',
    category: 'Logistics',
    icon: 'Home',
    description: 'Dormitory room allotments, bed capacities, mess billing, warden permissions',
    defaultInTrial: false,
    defaultInSchool: false,
    defaultInEnterprise: true,
    isCore: false
  },
  {
    key: 'admissions',
    name: 'Admissions Pipeline & CRM',
    category: 'Intake',
    icon: 'UserPlus',
    description: 'Online public applications, entrance test scorecards, candidate conversion',
    defaultInTrial: true,
    defaultInSchool: true,
    defaultInEnterprise: true,
    isCore: false
  },
  {
    key: 'inventory',
    name: 'Campus Assets & Inventory',
    category: 'Resources',
    icon: 'Package',
    description: 'Lab equipment tracking, furniture stock audits, stationery purchase vouchers',
    defaultInTrial: false,
    defaultInSchool: false,
    defaultInEnterprise: true,
    isCore: false
  },
  {
    key: 'certificates',
    name: 'Certificates & ID Generator',
    category: 'Resources',
    icon: 'FileBadge',
    description: 'Bulk printable student photo ID cards, character & school leaving certificates',
    defaultInTrial: true,
    defaultInSchool: true,
    defaultInEnterprise: true,
    isCore: false
  },
  {
    key: 'accounts',
    name: 'Campus Accounts & Cashflow',
    category: 'Finance',
    icon: 'LineChart',
    description: 'Cashflow ledgers, daily collection reconciliation, expense audits & accounts',
    defaultInTrial: false,
    defaultInSchool: false,
    defaultInEnterprise: true,
    isCore: false
  }
]

// ---------------------------------------------------------------------
// 2. INSTITUTE ADMIN GRANULAR OVERRIDES (Special Privileges)
// ---------------------------------------------------------------------
export const ADMIN_PRIVILEGE_OVERRIDES_REGISTRY = [
  {
    key: 'override_fee_discounts',
    name: 'Authorize Custom Fee Waivers',
    category: 'Financial Authority',
    risk: 'Medium',
    description: 'Allows campus principal to grant custom scholarship concessions & waivers up to 100% without central HQ pre-approval.'
  },
  {
    key: 'override_delete_records',
    name: 'Delete Student & Academic Records',
    category: 'Data Governance',
    risk: 'High',
    description: 'Grants permission to permanently purge historical student, fee, or examination records from the campus database.'
  },
  {
    key: 'override_capacity_bypass',
    name: 'Bypass Section Capacity Seat Limits',
    category: 'Enrollment Authority',
    risk: 'Low',
    description: 'Allows enrolling students even when a class section has reached maximum sanctioned seat capacity.'
  },
  {
    key: 'override_export_pii',
    name: 'Export Student & Guardian PII to CSV',
    category: 'Security & Privacy',
    risk: 'High',
    description: 'Grants access to bulk export student names, guardian contact numbers, NADRA CNIC, and home addresses.'
  },
  {
    key: 'override_cross_campus_view',
    name: 'View Network-wide Academic Benchmarks',
    category: 'Analytics Authority',
    risk: 'Low',
    description: 'Grants visibility into sister campus academic performance, grade distributions, and fee collection rankings.'
  },
  {
    key: 'override_emergency_broadcast',
    name: 'Broadcast Priority Emergency Alerts',
    category: 'Communication',
    risk: 'Medium',
    description: 'Allows issuing high-priority flash popups and urgent campus notifications directly to parents and students.'
  },
  {
    key: 'override_grading_formulas',
    name: 'Customize Exam Grading Scales',
    category: 'Academic Authority',
    risk: 'Medium',
    description: 'Permits altering grading letter boundaries, GPA formulas, and passing mark thresholds for internal exams.'
  },
  {
    key: 'override_payroll_customization',
    name: 'Customize Faculty Salary Schemes',
    category: 'Operations Authority',
    risk: 'Medium',
    description: 'Permits defining custom allowance heads, bonuses, and tax deductions on teacher payroll slips.'
  },
  {
    key: 'override_audit_inspector',
    name: 'Access Campus Security Audit Trail',
    category: 'Security & Privacy',
    risk: 'Low',
    description: 'Allows inspecting chronological security logs, login timestamps, and record modification history.'
  },
  {
    key: 'override_custom_branding',
    name: 'Upload Official Seals & Watermarks',
    category: 'Brand & Identity',
    risk: 'Low',
    description: 'Permits uploading custom institute crests, fee challan stamps, and certificate letterhead watermarks.'
  }
]

// ---------------------------------------------------------------------
// 3. PLATFORM INTERNAL TEAM PERMISSIONS (Super Admin Team RBAC)
// ---------------------------------------------------------------------
export const PLATFORM_TEAM_PERMISSIONS_REGISTRY = [
  {
    category: 'Campuses & Tenancy',
    permissions: [
      { id: 'schools:view', label: 'View Campuses & Profiles', description: 'Inspect campus rosters, registrations, student capacities, and contact info' },
      { id: 'schools:create', label: 'Onboard New School', description: 'Register and onboard new school entities into the platform' },
      { id: 'schools:edit', label: 'Modify School Configs', description: 'Update school details, plan tiers, and campus codes' },
      { id: 'schools:suspend', label: 'Suspend / Activate Campuses', description: 'Temporarily lock or restore school portal access' },
      { id: 'schools:delete', label: 'Delete School Records', description: 'Permanently remove school entities from platform ledger' }
    ]
  },
  {
    category: 'Subscriptions & Billing',
    permissions: [
      { id: 'billing:view', label: 'View Billing & Invoices', description: 'Inspect subscription revenue, invoices, and payment statuses' },
      { id: 'billing:manage_plans', label: 'Configure SaaS Packages', description: 'Modify pricing, student limits, and feature tiers' },
      { id: 'billing:create_invoices', label: 'Issue Platform Invoices', description: 'Create and dispatch manual SaaS fee vouchers' },
      { id: 'billing:extend_trials', label: 'Extend Trial Periods', description: 'Grant 14-day evaluation extensions and fee waivers' }
    ]
  },
  {
    category: 'Institute Feature Matrix',
    permissions: [
      { id: 'matrix:view', label: 'View Feature Matrices', description: 'Inspect enabled modules across all campuses' },
      { id: 'matrix:toggle', label: 'Toggle Campus Features', description: 'Enable or disable specific features per school' },
      { id: 'matrix:admin_overrides', label: 'Grant Admin Overrides', description: 'Assign extra privileges to specific school principals' }
    ]
  },
  {
    category: 'Personnel & Internal Team',
    permissions: [
      { id: 'team:view', label: 'View Team Roster', description: 'Inspect platform staff profiles and role assignments' },
      { id: 'team:manage', label: 'Add & Edit Team Members', description: 'Invite staff, edit profiles, and assign role titles' },
      { id: 'team:permissions', label: 'Configure Access Permissions', description: 'Toggle granular permission switches for team members' },
      { id: 'team:credentials', label: 'Reset Team Access Keys', description: 'Revoke sessions and reset team member credentials' }
    ]
  },
  {
    category: 'Security & Platform Governance',
    permissions: [
      { id: 'security:audit_logs', label: 'Access Audit Logs', description: 'Inspect platform security logs and staff action history' },
      { id: 'security:backups', label: 'Manage Database Backups', description: 'Create and download full database snapshot archives' },
      { id: 'security:policies', label: 'Update Compliance Policies', description: 'Draft and publish system-wide regulatory standards' }
    ]
  },
  {
    category: 'Broadcasts & Communications',
    permissions: [
      { id: 'broadcasts:view', label: 'View Broadcast History', description: 'Review sent circulars, SMS logs, and banners' },
      { id: 'broadcasts:send', label: 'Send Platform Announcements', description: 'Broadcast in-portal notifications to school users' },
      { id: 'broadcasts:emergency', label: 'Trigger Emergency Alerts', description: 'Display persistent high-priority flash advisories' }
    ]
  }
]

// All available permission IDs as a flat array
export const ALL_TEAM_PERMISSION_IDS = PLATFORM_TEAM_PERMISSIONS_REGISTRY.flatMap(
  c => c.permissions.map(p => p.id)
)

// Standard Role Templates for quick 1-click assignment
export const PLATFORM_ROLE_PRESETS = [
  {
    name: 'Platform Super Admin',
    badgeColor: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    description: 'Unrestricted full access across all platform modules and operations',
    permissions: [...ALL_TEAM_PERMISSION_IDS]
  },
  {
    name: 'Onboarding Manager',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    description: 'Manages school registrations, inquiries, feature matrices, and trial setup',
    permissions: [
      'schools:view', 'schools:create', 'schools:edit',
      'matrix:view', 'matrix:toggle',
      'billing:view', 'billing:extend_trials',
      'broadcasts:view', 'broadcasts:send'
    ]
  },
  {
    name: 'Billing & Finance Officer',
    badgeColor: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    description: 'Oversees SaaS invoices, tier packages, payment approvals, and ledger',
    permissions: [
      'billing:view', 'billing:manage_plans', 'billing:create_invoices', 'billing:extend_trials',
      'schools:view', 'matrix:view'
    ]
  },
  {
    name: 'Platform Support Engineer',
    badgeColor: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    description: 'Assists campuses with inquiries, feature toggles, and telemetry',
    permissions: [
      'schools:view', 'schools:edit',
      'matrix:view', 'matrix:toggle', 'matrix:admin_overrides',
      'security:health', 'broadcasts:view', 'broadcasts:send'
    ]
  },
  {
    name: 'Compliance & Security Auditor',
    badgeColor: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    description: 'Audits security logs, database snapshots, and compliance policies',
    permissions: [
      'security:health', 'security:audit_logs', 'security:backups', 'security:policies',
      'schools:view', 'team:view', 'matrix:view'
    ]
  }
]

// Initial seed platform team members
export const INITIAL_PLATFORM_TEAM = [
  {
    id: 'team-1',
    firstName: 'Tariq',
    lastName: 'Mehmood',
    email: 'tariq.mehmood@smartms.edu',
    countryCode: '+92',
    mobile: '3008472910',
    role: 'Platform Super Admin',
    status: 'Active',
    assignedScope: 'All Campuses (Platform-wide)',
    isSuperAdmin: true,
    permissions: [...ALL_TEAM_PERMISSION_IDS],
    createdAt: '2026-01-01T08:00:00.000Z',
    lastActive: 'Just now',
    avatarColor: 'from-purple-600 to-indigo-600'
  },
  {
    id: 'team-2',
    firstName: 'Olivia',
    lastName: 'Bennett',
    email: 'olivia.bennett@smartms.edu',
    countryCode: '+44',
    mobile: '7700900789',
    role: 'Onboarding Manager',
    status: 'Active',
    assignedScope: 'All Campuses (Platform-wide)',
    permissions: [
      'schools:view', 'schools:create', 'schools:edit',
      'matrix:view', 'matrix:toggle',
      'billing:view', 'billing:extend_trials',
      'broadcasts:view', 'broadcasts:send'
    ],
    createdAt: '2026-01-15T10:00:00.000Z',
    lastActive: '25 mins ago',
    avatarColor: 'from-emerald-600 to-teal-600'
  },
  {
    id: 'team-3',
    firstName: 'Alexander',
    lastName: 'Wright',
    email: 'alex.wright@smartms.edu',
    countryCode: '+92',
    mobile: '3214567890',
    role: 'Platform Support Engineer',
    status: 'Active',
    assignedScope: 'Beaconhouse Central High School, City School Model Town',
    permissions: [
      'schools:view', 'schools:edit',
      'matrix:view', 'matrix:toggle', 'matrix:admin_overrides',
      'security:health', 'broadcasts:view', 'broadcasts:send'
    ],
    createdAt: '2026-02-10T14:30:00.000Z',
    lastActive: '2 hours ago',
    avatarColor: 'from-blue-600 to-cyan-600'
  },
  {
    id: 'team-4',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.j@smartms.edu',
    countryCode: '+1',
    mobile: '4155552671',
    role: 'Billing & Finance Officer',
    status: 'Active',
    assignedScope: 'All Campuses (Platform-wide)',
    permissions: [
      'billing:view', 'billing:manage_plans', 'billing:create_invoices', 'billing:extend_trials',
      'schools:view', 'matrix:view'
    ],
    createdAt: '2026-02-20T09:15:00.000Z',
    lastActive: '1 day ago',
    avatarColor: 'from-amber-600 to-orange-600'
  },
  {
    id: 'team-5',
    firstName: 'Hamza',
    lastName: 'Farooq',
    email: 'hamza.f@smartms.edu',
    countryCode: '+92',
    mobile: '3339876543',
    role: 'Compliance & Security Auditor',
    status: 'Active',
    assignedScope: 'All Campuses (Platform-wide)',
    permissions: [
      'security:health', 'security:audit_logs', 'security:backups', 'security:policies',
      'schools:view', 'team:view', 'matrix:view'
    ],
    createdAt: '2026-03-01T12:00:00.000Z',
    lastActive: '3 hours ago',
    avatarColor: 'from-rose-600 to-red-600'
  }
]

// Storage Keys
const MATRIX_KEY = 'sms_institute_modules'
const ADMIN_OVERRIDES_KEY = 'sms_institute_admin_overrides'
const PLATFORM_TEAM_KEY = 'sms_platform_team_members'

// ---------------------------------------------------------------------
// 4. ADMIN CONTROL SERVICE IMPLEMENTATION
// ---------------------------------------------------------------------
export const AdminControlService = {
  // -------------------------------------------------------------------
  // A. Institute Feature Matrix
  // -------------------------------------------------------------------

  /**
   * Fetch complete matrix mapping all institutes to their 15 feature flags
   */
  getInstitutesFeatureMatrix(institutes = []) {
    let currentMatrix = []
    try {
      const raw = localStorage.getItem(MATRIX_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) currentMatrix = parsed
      }
    } catch {}

    const store = getStoredData()
    if (currentMatrix.length === 0 && Array.isArray(store.instituteModules)) {
      currentMatrix = store.instituteModules
    }

    let mutated = false
    const effectiveInstitutes = (institutes && institutes.length > 0)
      ? institutes
      : (store.institutes || [])

    effectiveInstitutes.forEach(inst => {
      const planTierLower = (inst.planTier || inst.planType || 'School Plan').toLowerCase()
      const isTrial = planTierLower.includes('trial')
      const isEnterprise = planTierLower.includes('network') || planTierLower.includes('enterprise')

      INSTITUTE_FEATURES_REGISTRY.forEach(feat => {
        const exists = currentMatrix.some(
          m => (m.instituteId === inst.id || m.institute_id === inst.id) &&
               (m.moduleKey === feat.key || m.module_key === feat.key)
        )
        if (!exists) {
          // Compute default based on plan tier
          let defaultEnabled = feat.isCore
          if (isTrial) defaultEnabled = feat.defaultInTrial
          else if (isEnterprise) defaultEnabled = feat.defaultInEnterprise
          else defaultEnabled = feat.defaultInSchool

          currentMatrix.push({
            id: `mod-${inst.id}-${feat.key}`,
            instituteId: inst.id,
            instituteName: inst.name,
            moduleKey: feat.key,
            moduleName: feat.name,
            category: feat.category,
            enabled: defaultEnabled,
            updatedAt: new Date().toISOString()
          })
          mutated = true
        }
      })
    })

    if (mutated) {
      try {
        localStorage.setItem(MATRIX_KEY, JSON.stringify(currentMatrix))
        store.instituteModules = currentMatrix
        saveStoredData(store)
      } catch {}
    }

    return currentMatrix
  },

  /**
   * Toggle a specific feature for an institute
   */
  toggleInstituteFeature(instituteId, featureKey, enabled, adminName = 'Super Administrator') {
    const matrix = this.getInstitutesFeatureMatrix()
    const idx = matrix.findIndex(
      m => (m.instituteId === instituteId || m.institute_id === instituteId) &&
           (m.moduleKey === featureKey || m.module_key === featureKey)
    )

    const feature = INSTITUTE_FEATURES_REGISTRY.find(f => f.key === featureKey)
    const featName = feature?.name || featureKey

    if (idx >= 0) {
      matrix[idx].enabled = enabled
      matrix[idx].updatedAt = new Date().toISOString()
    } else {
      matrix.push({
        id: `mod-${instituteId}-${featureKey}`,
        instituteId,
        moduleKey: featureKey,
        moduleName: featName,
        category: feature?.category || 'General',
        enabled,
        updatedAt: new Date().toISOString()
      })
    }

    try {
      localStorage.setItem(MATRIX_KEY, JSON.stringify(matrix))
      const store = getStoredData()
      store.instituteModules = matrix
      saveStoredData(store)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sms_modules_updated'))
      }
    } catch {}

    // Log to Platform Audit Trail
    DataService.logAuditEvent(
      `Toggled "${featName}" to ${enabled ? 'ENABLED' : 'DISABLED'} for Campus ${instituteId}`,
      adminName,
      'Success'
    )

    return { success: true, enabled }
  },

  /**
   * Apply a predefined feature profile (Preset) to an institute
   */
  applyFeaturePreset(instituteId, presetType = 'SCHOOL_STANDARD', adminName = 'Super Administrator') {
    const matrix = this.getInstitutesFeatureMatrix()
    let countChanged = 0

    matrix.forEach(entry => {
      if (entry.instituteId === instituteId || entry.institute_id === instituteId) {
        const feat = INSTITUTE_FEATURES_REGISTRY.find(f => f.key === (entry.moduleKey || entry.module_key))
        if (!feat) return

        let targetState = false
        if (presetType === 'ALL_ENABLED') {
          targetState = true
        } else if (presetType === 'TRIAL_MINIMAL') {
          targetState = feat.defaultInTrial
        } else if (presetType === 'ENTERPRISE_FULL') {
          targetState = feat.defaultInEnterprise
        } else if (presetType === 'FINANCIAL_LOCKED') {
          targetState = feat.category !== 'Finance' && feat.defaultInSchool
        } else {
          // SCHOOL_STANDARD
          targetState = feat.defaultInSchool
        }

        if (entry.enabled !== targetState) {
          entry.enabled = targetState
          entry.updatedAt = new Date().toISOString()
          countChanged++
        }
      }
    })

    try {
      localStorage.setItem(MATRIX_KEY, JSON.stringify(matrix))
      const store = getStoredData()
      store.instituteModules = matrix
      saveStoredData(store)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sms_modules_updated'))
      }
    } catch {}

    DataService.logAuditEvent(
      `Applied preset "${presetType}" to campus ${instituteId} (${countChanged} modules adjusted)`,
      adminName,
      'Success'
    )

    return { success: true, countChanged }
  },

  /**
   * Check if a specific module is currently enabled for an institute
   */
  isFeatureEnabled(instituteId, featureKey) {
    if (!instituteId || !featureKey) return true
    try {
      const raw = localStorage.getItem(MATRIX_KEY)
      if (raw) {
        const matrix = JSON.parse(raw)
        if (Array.isArray(matrix)) {
          const entry = matrix.find(
            m => (m.instituteId === instituteId || m.institute_id === instituteId) &&
                 (m.moduleKey === featureKey || m.module_key === featureKey)
          )
          if (entry !== undefined && entry.enabled !== undefined) {
            return Boolean(entry.enabled)
          }
        }
      }
    } catch {}
    // Fallback: check core
    const feat = INSTITUTE_FEATURES_REGISTRY.find(f => f.key === featureKey)
    return feat ? Boolean(feat.defaultInSchool) : true
  },

  // -------------------------------------------------------------------
  // B. Institute Administrator Granular Overrides
  // -------------------------------------------------------------------

  /**
   * Get custom overrides for a specific campus / administrator
   */
  getInstituteAdminOverrides(instituteId) {
    let allOverrides = {}
    try {
      const raw = localStorage.getItem(ADMIN_OVERRIDES_KEY)
      if (raw) {
        allOverrides = JSON.parse(raw) || {}
      }
    } catch {}

    const instituteOverrides = allOverrides[instituteId] || {}
    // Return with defaults false for any unconfigured override
    const normalized = {}
    ADMIN_PRIVILEGE_OVERRIDES_REGISTRY.forEach(o => {
      normalized[o.key] = Boolean(instituteOverrides[o.key])
    })

    return {
      instituteId,
      overrides: normalized,
      elevatedCount: Object.values(normalized).filter(Boolean).length,
      updatedAt: instituteOverrides._updatedAt || null,
      updatedBy: instituteOverrides._updatedBy || null
    }
  },

  /**
   * Save custom overrides for an institute administrator
   */
  saveInstituteAdminOverrides(instituteId, overridesMap, adminName = 'Super Administrator') {
    let allOverrides = {}
    try {
      const raw = localStorage.getItem(ADMIN_OVERRIDES_KEY)
      if (raw) allOverrides = JSON.parse(raw) || {}
    } catch {}

    allOverrides[instituteId] = {
      ...overridesMap,
      _updatedAt: new Date().toISOString(),
      _updatedBy: adminName
    }

    try {
      localStorage.setItem(ADMIN_OVERRIDES_KEY, JSON.stringify(allOverrides))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sms_admin_overrides_updated'))
      }
    } catch {}

    const elevatedCount = Object.entries(overridesMap).filter(([k, v]) => !k.startsWith('_') && Boolean(v)).length
    DataService.logAuditEvent(
      `Updated administrative privileges for campus ${instituteId} (${elevatedCount} elevated permissions active)`,
      adminName,
      'Success'
    )

    return { success: true, elevatedCount }
  },

  /**
   * Check if an institute administrator has a specific elevated privilege
   */
  hasAdminOverride(instituteId, overrideKey) {
    if (!instituteId || !overrideKey) return false
    try {
      const raw = localStorage.getItem(ADMIN_OVERRIDES_KEY)
      if (raw) {
        const all = JSON.parse(raw)
        return Boolean(all?.[instituteId]?.[overrideKey])
      }
    } catch {}
    return false
  },

  // -------------------------------------------------------------------
  // C. Platform Team & Internal Staff Control (RBAC)
  // -------------------------------------------------------------------

  /**
   * Retrieve full list of platform team members
   */
  getPlatformTeamMembers() {
    try {
      const raw = localStorage.getItem(PLATFORM_TEAM_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}

    // Initialize with seed team if empty
    try {
      localStorage.setItem(PLATFORM_TEAM_KEY, JSON.stringify(INITIAL_PLATFORM_TEAM))
    } catch {}
    return [...INITIAL_PLATFORM_TEAM]
  },

  /**
   * Add or update a platform team member
   */
  savePlatformTeamMember(memberData, adminName = 'Super Administrator') {
    const list = this.getPlatformTeamMembers()
    let savedMember = null

    if (memberData.id) {
      const idx = list.findIndex(m => m.id === memberData.id)
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          ...memberData,
          updatedAt: new Date().toISOString()
        }
        savedMember = list[idx]
      } else {
        list.push(memberData)
        savedMember = memberData
      }
    } else {
      savedMember = {
        ...memberData,
        id: `team-${Date.now()}`,
        status: memberData.status || 'Active',
        permissions: memberData.permissions || [...ALL_TEAM_PERMISSION_IDS],
        createdAt: new Date().toISOString(),
        lastActive: 'Just registered',
        avatarColor: memberData.avatarColor || 'from-purple-600 to-indigo-600'
      }
      list.push(savedMember)
    }

    try {
      localStorage.setItem(PLATFORM_TEAM_KEY, JSON.stringify(list))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sms_platform_team_updated'))
      }
    } catch {}

    DataService.logAuditEvent(
      `Saved platform team member: ${savedMember.firstName} ${savedMember.lastName} (${savedMember.role})`,
      adminName,
      'Success'
    )

    return { success: true, member: savedMember, list }
  },

  /**
   * Toggle Active / Suspended status of a team member
   */
  toggleTeamMemberStatus(memberId, adminName = 'Super Administrator') {
    const list = this.getPlatformTeamMembers()
    const idx = list.findIndex(m => m.id === memberId)
    if (idx === -1) return { success: false, error: 'Member not found' }

    if (list[idx].isSuperAdmin) {
      return { success: false, error: 'Cannot suspend primary Super Administrator account.' }
    }

    const nextStatus = list[idx].status === 'Active' ? 'Suspended' : 'Active'
    list[idx].status = nextStatus
    list[idx].updatedAt = new Date().toISOString()

    try {
      localStorage.setItem(PLATFORM_TEAM_KEY, JSON.stringify(list))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sms_platform_team_updated'))
      }
    } catch {}

    DataService.logAuditEvent(
      `Changed status for team member "${list[idx].firstName} ${list[idx].lastName}" to ${nextStatus}`,
      adminName,
      'Warning'
    )

    return { success: true, member: list[idx], nextStatus, list }
  },

  /**
   * Update exact permission IDs array for a team member
   */
  updateTeamMemberPermissions(memberId, permissionsArray = [], adminName = 'Super Administrator') {
    const list = this.getPlatformTeamMembers()
    const idx = list.findIndex(m => m.id === memberId)
    if (idx === -1) return { success: false, error: 'Member not found' }

    list[idx].permissions = permissionsArray
    list[idx].updatedAt = new Date().toISOString()

    try {
      localStorage.setItem(PLATFORM_TEAM_KEY, JSON.stringify(list))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sms_platform_team_updated'))
      }
    } catch {}

    DataService.logAuditEvent(
      `Configured permissions for team member "${list[idx].firstName} ${list[idx].lastName}" (${permissionsArray.length} permissions allowed)`,
      adminName,
      'Success'
    )

    return { success: true, member: list[idx], list }
  },

  /**
   * Delete a team member
   */
  deletePlatformTeamMember(memberId, adminName = 'Super Administrator') {
    let list = this.getPlatformTeamMembers()
    const target = list.find(m => m.id === memberId)
    if (!target) return { success: false, error: 'Member not found' }

    if (target.isSuperAdmin) {
      return { success: false, error: 'Primary Super Administrator cannot be deleted.' }
    }

    list = list.filter(m => m.id !== memberId)

    try {
      localStorage.setItem(PLATFORM_TEAM_KEY, JSON.stringify(list))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sms_platform_team_updated'))
      }
    } catch {}

    DataService.logAuditEvent(
      `Removed platform team member: ${target.firstName} ${target.lastName}`,
      adminName,
      'Warning'
    )

    return { success: true, list }
  },

  /**
   * Check if a team member has a specific permission
   */
  hasTeamPermission(memberIdOrEmail, permissionId) {
    if (!memberIdOrEmail || !permissionId) return true
    const list = this.getPlatformTeamMembers()
    const member = list.find(
      m => m.id === memberIdOrEmail || m.email?.toLowerCase() === String(memberIdOrEmail).toLowerCase()
    )
    if (!member) return true // default allow if not managed
    if (member.isSuperAdmin) return true
    return Array.isArray(member.permissions) && member.permissions.includes(permissionId)
  }
}

export default AdminControlService

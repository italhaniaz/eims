import { supabase, isSupabaseConfigured } from './supabaseClient'
import { DataService, getStoredData, saveStoredData } from './dataService'

const API_BASE_URL = 'http://localhost:5000'

export const PLATFORM_MODULES = [
  { key: 'students', name: 'Student Information System', category: 'Core Academic', defaultQuota: 1500, description: 'Student profiles, enrollments, documents & identity card generator' },
  { key: 'fees', name: 'Fee Billing & Online POS', category: 'Finance', defaultQuota: 1500, description: 'Bank challan print engine, fee ledgers, daily collections & defauters' },
  { key: 'payroll', name: 'HR & Staff Payroll', category: 'Operations', defaultQuota: 100, description: 'Staff attendance, salaries, payslips and employment records' },
  { key: 'exams', name: 'Examinations & Grading', category: 'Core Academic', defaultQuota: 1500, description: 'Exam schedules, admit cards, marksheets and progress reports' },
  { key: 'library', name: 'Central Library Management', category: 'Resources', defaultQuota: 5000, description: 'Book cataloging, barcode issuance, returns and overdue fines' },
  { key: 'transport', name: 'Transport & Fleet Logistics', category: 'Logistics', defaultQuota: 50, description: 'Vehicle tracking, driver roster, bus routes and pickup stations' },
  { key: 'hostel', name: 'Hostel & Boarding Facility', category: 'Logistics', defaultQuota: 200, description: 'Dormitory rooms, bed allocations, mess charges and warden alerts' },
  { key: 'admissions', name: 'Admissions Pipeline & CRM', category: 'Intake', defaultQuota: 500, description: 'Online applications, entrance tests, interviews and seat allotment' },
  { key: 'communication', name: 'SMS & WhatsApp Gateway', category: 'Messaging', defaultQuota: 10000, description: 'Automated fee alerts, circular broadcasts and attendance notifications' },
  { key: 'inventory', name: 'Campus Inventory & Assets', category: 'Resources', defaultQuota: 1000, description: 'Lab equipment, stationery, stock audits and maintenance tracking' }
]

export const SUBSCRIPTION_PLANS = [
  {
    id: 'plan-school',
    name: 'School Plan',
    type: 'School',
    planCode: 'SCHOOL',
    enabledTiers: ['school'],
    pricePKR: 25000,
    interval: 'Monthly',
    maxStudents: 1500,
    maxUsers: 50,
    maxCampuses: 2,
    storageMB: 5120,
    description: 'Tailored for Primary, Middle & Matric / O-Levels schools'
  },
  {
    id: 'plan-college',
    name: 'College Plan',
    type: 'College',
    planCode: 'COLLEGE',
    enabledTiers: ['college'],
    pricePKR: 35000,
    interval: 'Monthly',
    maxStudents: 3000,
    maxUsers: 100,
    maxCampuses: 3,
    storageMB: 10240,
    description: 'Built for Intermediate, F.Sc, ICS, FA, I.Com & A-Levels colleges'
  },
  {
    id: 'plan-university',
    name: 'University Plan',
    type: 'University',
    planCode: 'UNIVERSITY',
    enabledTiers: ['undergraduate'],
    pricePKR: 55000,
    interval: 'Monthly',
    maxStudents: 8000,
    maxUsers: 300,
    maxCampuses: 5,
    storageMB: 25600,
    description: 'Full Undergraduate BS degree management, Semesters, Credit Hours & CGPA'
  },
  {
    id: 'plan-custom',
    name: 'Custom Hybrid Plan',
    type: 'Custom',
    planCode: 'CUSTOM',
    enabledTiers: ['school', 'college'],
    pricePKR: 75000,
    interval: 'Monthly',
    maxStudents: 15000,
    maxUsers: 600,
    maxCampuses: 15,
    storageMB: 51200,
    description: 'Multi-wing educational groups combining School, College, and University wings'
  }
]

// Fallback Module Matrix Initializer for offline storage
export const getStoredModuleMatrix = () => {
  const data = getStoredData()
  if (!data.instituteModules) {
    data.instituteModules = []
    saveStoredData(data)
  }
  return data.instituteModules
}

export const PlatformService = {
  // 1. Get module state for specific institute
  async getInstituteModules(instituteId) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('institute_modules')
          .select('*')
          .eq('institute_id', instituteId)
        if (!error && data && data.length > 0) return data
      } catch (e) {
        console.warn('Supabase fetch failed for institute_modules:', e)
      }
    }

    const store = getStoredData()
    const list = (store.instituteModules || []).filter(m => m.instituteId === instituteId)
    if (list.length > 0) return list

    // Return default set if not customized yet
    return PLATFORM_MODULES.map(m => ({
      instituteId,
      moduleKey: m.key,
      moduleName: m.name,
      enabled: ['students', 'fees', 'exams', 'library', 'admissions'].includes(m.key),
      quotaStudents: 1500,
      quotaUsers: 50,
      quotaCampuses: 3,
      quotaStorageMb: 2048
    }))
  },

  // 2. Fetch full matrix of institutes x modules
  async getAllInstitutesModulesMatrix(institutes = []) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('institute_modules').select('*')
        if (!error && data && data.length > 0) {
          return data
        }
      } catch (e) {
        console.warn('Supabase matrix fetch failed:', e)
      }
    }

    const store = getStoredData()
    let currentMatrix = store.instituteModules || []

    // Ensure all institutes have module entries
    let changed = false
    institutes.forEach(inst => {
      PLATFORM_MODULES.forEach(mod => {
        const exists = currentMatrix.some(
          m => (m.instituteId === inst.id || m.institute_id === inst.id) && (m.moduleKey === mod.key || m.module_key === mod.key)
        )
        if (!exists) {
          currentMatrix.push({
            id: `mod-${inst.id}-${mod.key}`,
            instituteId: inst.id,
            instituteName: inst.name,
            moduleKey: mod.key,
            moduleName: mod.name,
            enabled: ['students', 'fees', 'exams', 'communication'].includes(mod.key) || inst.type === 'University',
            quotaStudents: inst.type === 'University' ? 5000 : 1500,
            quotaUsers: inst.type === 'University' ? 200 : 50,
            quotaCampuses: inst.type === 'University' ? 10 : 3,
            quotaStorageMb: inst.type === 'University' ? 10240 : 2048
          })
          changed = true
        }
      })
    })

    if (changed) {
      store.instituteModules = currentMatrix
      saveStoredData(store)
    }

    return currentMatrix
  },

  // 3. Update single module flag for an institute
  async toggleInstituteModule(instituteId, moduleKey, enabled) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('institute_modules')
          .upsert({
            institute_id: instituteId,
            module_key: moduleKey,
            module_name: PLATFORM_MODULES.find(m => m.key === moduleKey)?.name || moduleKey,
            enabled: enabled,
            updated_at: new Date().toISOString()
          }, { onConflict: 'institute_id,module_key' })
      } catch (e) {
        console.warn('Supabase toggle failed:', e)
      }
    }

    const store = getStoredData()
    store.instituteModules = store.instituteModules || []
    const idx = store.instituteModules.findIndex(
      m => (m.instituteId === instituteId || m.institute_id === instituteId) && (m.moduleKey === moduleKey || m.module_key === moduleKey)
    )

    if (idx >= 0) {
      store.instituteModules[idx].enabled = enabled
    } else {
      store.instituteModules.push({
        id: `mod-${instituteId}-${moduleKey}`,
        instituteId,
        moduleKey,
        moduleName: PLATFORM_MODULES.find(m => m.key === moduleKey)?.name || moduleKey,
        enabled,
        quotaStudents: 1500,
        quotaUsers: 50,
        quotaCampuses: 3,
        quotaStorageMb: 2048
      })
    }

    saveStoredData(store)

    // Audit Log
    DataService.logAuditEvent(
      `Toggled module "${moduleKey}" to ${enabled ? 'ENABLED' : 'DISABLED'} for institute ${instituteId}`,
      'Super Administrator',
      'Success'
    )

    return true
  },

  // 4. Bulk update a module across all or selected institutes
  async bulkApplyModuleStatus(moduleKey, enabled, instituteIds = []) {
    const store = getStoredData()
    store.instituteModules = store.instituteModules || []

    const targetInstIds = instituteIds.length > 0 ? instituteIds : (store.institutes || []).map(i => i.id)

    targetInstIds.forEach(instId => {
      const idx = store.instituteModules.findIndex(
        m => (m.instituteId === instId || m.institute_id === instId) && (m.moduleKey === moduleKey || m.module_key === moduleKey)
      )
      if (idx >= 0) {
        store.instituteModules[idx].enabled = enabled
      } else {
        store.instituteModules.push({
          id: `mod-${instId}-${moduleKey}`,
          instituteId: instId,
          moduleKey,
          moduleName: PLATFORM_MODULES.find(m => m.key === moduleKey)?.name || moduleKey,
          enabled,
          quotaStudents: 1500,
          quotaUsers: 50,
          quotaCampuses: 3,
          quotaStorageMb: 2048
        })
      }
    })

    saveStoredData(store)

    DataService.logAuditEvent(
      `Bulk applied module "${moduleKey}" as ${enabled ? 'ENABLED' : 'DISABLED'} across ${targetInstIds.length} campuses`,
      'Super Administrator',
      'Success'
    )

    return true
  },

  // 5. Update quota limits for an institute
  async updateInstituteQuotas(instituteId, quotas) {
    const store = getStoredData()
    store.instituteModules = store.instituteModules || []

    store.instituteModules = store.instituteModules.map(m => {
      if (m.instituteId === instituteId || m.institute_id === instituteId) {
        return {
          ...m,
          quotaStudents: quotas.quotaStudents ?? m.quotaStudents,
          quotaUsers: quotas.quotaUsers ?? m.quotaUsers,
          quotaCampuses: quotas.quotaCampuses ?? m.quotaCampuses,
          quotaStorageMb: quotas.quotaStorageMb ?? m.quotaStorageMb
        }
      }
      return m
    })

    // Also update on institute root object
    store.institutes = (store.institutes || []).map(inst => {
      if (inst.id === instituteId) {
        return {
          ...inst,
          quotaStudents: quotas.quotaStudents ?? inst.quotaStudents,
          quotaUsers: quotas.quotaUsers ?? inst.quotaUsers,
          quotaCampuses: quotas.quotaCampuses ?? inst.quotaCampuses,
          quotaStorageMb: quotas.quotaStorageMb ?? inst.quotaStorageMb
        }
      }
      return inst
    })

    saveStoredData(store)

    DataService.logAuditEvent(
      `Updated platform quotas for institute ${instituteId}`,
      'Super Administrator',
      'Success'
    )

    return true
  },

  // 6. Institute Lifecycle Actions (Activate, Suspend with reason, Archive, Restore)
  async updateInstituteLifecycle(instituteId, action, reason = '') {
    const validActions = ['Activate', 'Suspend', 'Archive', 'Restore']
    if (!validActions.includes(action)) throw new Error('Invalid lifecycle action')

    let newLifecycleStatus = 'Active'
    let rootStatus = 'Active'

    if (action === 'Activate' || action === 'Restore') {
      newLifecycleStatus = 'Active'
      rootStatus = 'Active'
    } else if (action === 'Suspend') {
      newLifecycleStatus = 'Suspended'
      rootStatus = 'Suspended'
    } else if (action === 'Archive') {
      newLifecycleStatus = 'Archived'
      rootStatus = 'Archived'
    }

    // Supabase update
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('institutes')
          .update({
            status: rootStatus,
            lifecycle_status: newLifecycleStatus,
            suspension_reason: action === 'Suspend' ? reason : null
          })
          .eq('id', instituteId)

        await supabase.from('institute_lifecycle_logs').insert({
          institute_id: instituteId,
          action: action.toUpperCase(),
          reason: reason || `Institute transitioned to ${newLifecycleStatus}`,
          performed_by: 'Super Administrator'
        })
      } catch (e) {
        console.warn('Supabase lifecycle update failed:', e)
      }
    }

    // LocalStorage update
    const store = getStoredData()
    let instituteName = 'Institute'
    store.institutes = (store.institutes || []).map(inst => {
      if (inst.id === instituteId) {
        instituteName = inst.name || 'Institute'
        return {
          ...inst,
          status: rootStatus,
          lifecycleStatus: newLifecycleStatus,
          suspensionReason: action === 'Suspend' ? reason : null
        }
      }
      return inst
    })

    store.recentActivity = store.recentActivity || []
    store.recentActivity.unshift({
      id: `act-${Date.now()}`,
      text: `Institute "${instituteName}" ${action.toLowerCase()}d by Superadmin${reason ? ` (${reason})` : ''}`,
      time: 'Just now',
      type: 'institute',
      dotColor: action === 'Suspend' ? '#f43f5e' : action === 'Archive' ? '#94a3b8' : '#10b981'
    })

    saveStoredData(store)

    DataService.logAuditEvent(
      `Institute "${instituteName}" (${instituteId}) set to ${newLifecycleStatus.toUpperCase()}${reason ? ` - Reason: ${reason}` : ''}`,
      'Super Administrator',
      action === 'Suspend' ? 'Warning' : 'Success'
    )

    return { success: true, newLifecycleStatus }
  },

  // 7. Onboarding Wizard Full Registration
  async onboardInstitute(wizardData) {
    const store = getStoredData()
    const instituteId = `inst-${Date.now()}`
    const timestamp = new Date().toISOString()

    // 1. Prepare institute model
    const newInstitute = {
      id: instituteId,
      name: wizardData.name,
      code: wizardData.code.toUpperCase().trim(),
      type: wizardData.type || 'School', // School, College, University
      city: wizardData.city || 'Lahore',
      province: wizardData.province || 'Punjab',
      divisionId: wizardData.divisionId || null,
      districtId: wizardData.districtId || null,
      principal: wizardData.principal || 'In-Charge Principal',
      email: wizardData.email || 'info@campus.edu',
      phone: wizardData.phone || '+92 300 0000000',
      address: wizardData.address || `${wizardData.city}, Pakistan`,
      affiliatedBoard: wizardData.affiliatedBoard || 'BISE Lahore',
      slug: wizardData.slug || wizardData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      primaryColor: wizardData.primaryColor || '#2563eb',
      logoUrl: wizardData.logoUrl || null,
      planTier: wizardData.planTier || 'Pro',
      lifecycleStatus: 'Active',
      status: 'Active',
      totalStudents: 0,
      totalTeachers: 0,
      quotaStudents: wizardData.quotaStudents || 1500,
      quotaUsers: wizardData.quotaUsers || 50,
      quotaCampuses: wizardData.campuses?.length || 1,
      quotaStorageMb: wizardData.quotaStorageMb || 2048,
      createdAt: timestamp,
      joinedDate: timestamp.split('T')[0]
    }

    // 2. Prepare campuses
    const campusesList = (wizardData.campuses && wizardData.campuses.length > 0)
      ? wizardData.campuses.map((c, idx) => ({
          id: `cmp-${Date.now()}-${idx}`,
          instituteId: instituteId,
          campusName: c.name || `Main Campus`,
          campusCode: c.code || `${newInstitute.code}-01`,
          city: c.city || newInstitute.city,
          address: c.address || newInstitute.address,
          isMainCampus: idx === 0,
          createdAt: timestamp
        }))
      : [{
          id: `cmp-${Date.now()}-0`,
          instituteId: instituteId,
          campusName: 'Main Campus',
          campusCode: `${newInstitute.code}-MAIN`,
          city: newInstitute.city,
          address: newInstitute.address,
          isMainCampus: true,
          createdAt: timestamp
        }]

    // 3. Prepare initial institute-admin user
    const adminUser = {
      id: `usr-${Date.now()}`,
      name: wizardData.adminName || `${newInstitute.name} Administrator`,
      email: wizardData.adminEmail || `admin@${newInstitute.slug || 'campus'}.edu`,
      password: wizardData.adminPassword || 'admin123',
      role: 'institute_admin',
      roleTitle: 'Institute Administrator',
      instituteId: instituteId,
      institute: newInstitute.name,
      phone: wizardData.adminPhone || newInstitute.phone,
      status: 'Active',
      lastLogin: 'Never',
      createdAt: timestamp
    }

    // 4. Default feature flags
    const moduleFlags = PLATFORM_MODULES.map(m => ({
      id: `mod-${instituteId}-${m.key}`,
      instituteId: instituteId,
      instituteName: newInstitute.name,
      moduleKey: m.key,
      moduleName: m.name,
      enabled: wizardData.enabledModules ? Boolean(wizardData.enabledModules[m.key]) : ['students', 'fees', 'exams', 'library', 'admissions'].includes(m.key),
      quotaStudents: newInstitute.quotaStudents,
      quotaUsers: newInstitute.quotaUsers,
      quotaCampuses: newInstitute.quotaCampuses,
      quotaStorageMb: newInstitute.quotaStorageMb
    }))

    // Save to local storage
    store.institutes = [newInstitute, ...(store.institutes || [])]
    store.users = [adminUser, ...(store.users || [])]
    store.instituteCampuses = [...campusesList, ...(store.instituteCampuses || [])]
    store.instituteModules = [...moduleFlags, ...(store.instituteModules || [])]

    store.recentActivity = store.recentActivity || []
    store.recentActivity.unshift({
      id: `act-${Date.now()}`,
      text: `Onboarded new ${newInstitute.type} "${newInstitute.name}" with initial Admin account`,
      time: 'Just now',
      type: 'institute',
      dotColor: '#2563eb'
    })

    saveStoredData(store)

    // Supabase cloud sync
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('institutes').insert({
          id: instituteId,
          name: newInstitute.name,
          code: newInstitute.code,
          email: newInstitute.email,
          phone: newInstitute.phone,
          address: newInstitute.address,
          status: 'Active',
          type: newInstitute.type,
          slug: newInstitute.slug,
          primary_color: newInstitute.primaryColor,
          plan_tier: newInstitute.planTier,
          lifecycle_status: 'Active'
        })
      } catch (err) {
        console.warn('Supabase sync for new institute failed:', err)
      }
    }

    DataService.logAuditEvent(
      `Onboarded new ${newInstitute.type} "${newInstitute.name}" (${newInstitute.code}) via Lifecycle Wizard`,
      'Super Administrator',
      'Success'
    )

    return { newInstitute, adminUser }
  },

  // 8. Reset Admin Password
  async resetAdminPassword(instituteId, newPassword) {
    const store = getStoredData()
    const targetUser = (store.users || []).find(u => u.instituteId === instituteId && u.role === 'institute_admin')

    if (!targetUser) {
      throw new Error('No Institute Administrator account found for this campus.')
    }

    targetUser.password = newPassword
    saveStoredData(store)

    DataService.logAuditEvent(
      `Reset administrator password for ${targetUser.email} (${targetUser.institute || instituteId})`,
      'Super Administrator',
      'Success'
    )

    return { success: true, email: targetUser.email }
  },

  // 9. Impersonation Session Engine (Server-first, local-backed)
  async startImpersonation(institute, superadminUser) {
    let sessionToken = `imp_local_${Date.now()}`
    const durationMinutes = 60
    const expiresAt = Date.now() + (durationMinutes * 60 * 1000)

    // Attempt Express server session creation
    try {
      const resp = await fetch(`${API_BASE_URL}/api/auth/impersonate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instituteId: institute.id,
          instituteName: institute.name,
          superadminEmail: superadminUser?.email || 'admin@schoolms.com',
          durationMinutes
        })
      })
      if (resp.ok) {
        const json = await resp.json()
        if (json.token) {
          sessionToken = json.token
        }
      }
    } catch (e) {
      // Local fallback
    }

    const sessionState = {
      token: sessionToken,
      instituteId: institute.id,
      instituteName: institute.name,
      superadminEmail: superadminUser?.email || 'admin@schoolms.com',
      startedAt: Date.now(),
      expiresAt,
      durationMinutes
    }

    localStorage.setItem('sms_active_impersonation', JSON.stringify(sessionState))
    window.dispatchEvent(new Event('impersonation-changed'))

    DataService.logAuditEvent(
      `Superadmin initiated 60-minute delegation/impersonation into "${institute.name}"`,
      superadminUser?.email || 'Super Administrator',
      'Success'
    )

    return sessionState
  },

  async endImpersonation() {
    const raw = localStorage.getItem('sms_active_impersonation')
    let session = null
    if (raw) {
      try { session = JSON.parse(raw) } catch (e) {}
    }

    // Call server to terminate
    if (session?.token) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/impersonate/end`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}` 
          },
          body: JSON.stringify({ token: session.token })
        })
      } catch (e) {}
    }

    localStorage.removeItem('sms_active_impersonation')
    window.dispatchEvent(new Event('impersonation-changed'))

    if (session) {
      DataService.logAuditEvent(
        `Ended impersonation session for campus "${session.instituteName || session.instituteId}" and returned to Superadmin`,
        'Super Administrator',
        'Success'
      )
    }

    return true
  },

  getImpersonationSession() {
    try {
      const raw = localStorage.getItem('sms_active_impersonation')
      if (!raw) return null
      const session = JSON.parse(raw)
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem('sms_active_impersonation')
        return null
      }
      return session
    } catch (e) {
      return null
    }
  }
}

export default PlatformService

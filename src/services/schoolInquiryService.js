import { DataService, getStoredData, saveStoredData } from './dataService'
import { PlatformService } from './platformService'
import { API_BASE_URL } from './apiConfig'

const INQUIRIES_STORAGE_KEY = 'sms_school_inquiries'
const INQUIRY_SETTING_STORAGE_KEY = 'sms_school_inquiry_setting'

// Sample initial inquiries to provide immediate testable data for Super Admin
const INITIAL_DEMO_INQUIRIES = [
  {
    id: 'inq-1001',
    schoolName: 'Beaconhouse Al-Falah Campus',
    schoolCodePrefix: 'BAFC',
    contactPerson: 'Dr. Shahzad Rafique',
    email: 'principal.alfalah@beaconhouse.edu.pk',
    phone: '+92 300 8472910',
    city: 'Lahore',
    province: 'Punjab',
    address: 'Plot 42, Block C, Al-Falah Housing Society, Lahore',
    planTier: 'Enterprise',
    status: 'Pending',
    submissionDate: new Date(Date.now() - 3600000 * 5).toISOString(),
    adminPassword: 'Password@123',
    notes: 'Require computerized 1Link fee challan integration for 1,200 students and multi-wing portal access.',
    wingsCount: 3,
    campusesCount: 1,
    rejectionReason: null,
    approvedAt: null,
    approvedInstituteId: null,
    assignedSchoolCode: null
  },
  {
    id: 'inq-1002',
    schoolName: 'The City School Capital Branch',
    schoolCodePrefix: 'TCS',
    contactPerson: 'Mrs. Saima Noor',
    email: 'saima.capital@cityschool.edu.pk',
    phone: '+92 321 4590123',
    city: 'Islamabad',
    province: 'Federal',
    address: 'Sector F-8/3, Street 19, Islamabad',
    planTier: 'Pro',
    status: 'Pending',
    submissionDate: new Date(Date.now() - 3600000 * 22).toISOString(),
    adminPassword: 'Password@123',
    notes: 'Requesting 14-day evaluation for Primary and Middle wings with digital attendance SMS.',
    wingsCount: 2,
    campusesCount: 1,
    rejectionReason: null,
    approvedAt: null,
    approvedInstituteId: null,
    assignedSchoolCode: null
  },
  {
    id: 'inq-1003',
    schoolName: 'Al-Huda International School',
    schoolCodePrefix: 'AHIS',
    contactPerson: 'Muhammad Tariq',
    email: 'info@alhuda-edu.com',
    phone: '+92 333 9928174',
    city: 'Karachi',
    province: 'Sindh',
    address: 'Gulshan-e-Iqbal, Block 6, Karachi',
    planTier: 'Standard',
    status: 'Rejected',
    submissionDate: new Date(Date.now() - 3600000 * 72).toISOString(),
    adminPassword: 'Password@123',
    notes: 'Campus registration application.',
    wingsCount: 1,
    campusesCount: 1,
    rejectionReason: 'Invalid contact verification. School official email and physical address could not be verified.',
    rejectedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    approvedAt: null,
    approvedInstituteId: null,
    assignedSchoolCode: null
  }
]

export const SchoolInquiryService = {
  // -------------------------------------------------------------
  // 1. SETTING MANAGEMENT (ON / OFF)
  // -------------------------------------------------------------
  /**
   * Check if School Inquiry approval workflow is enabled
   * Default: TRUE (Approval required)
   */
  isSchoolInquiryEnabled() {
    try {
      const local = localStorage.getItem(INQUIRY_SETTING_STORAGE_KEY)
      if (local !== null) {
        return JSON.parse(local) === true
      }
      const store = getStoredData()
      if (store?.settings?.schoolInquiryEnabled !== undefined) {
        return Boolean(store.settings.schoolInquiryEnabled)
      }
    } catch (e) {
      console.warn('Error reading school inquiry setting:', e)
    }
    // Default to true (Approval Gate ON)
    return true
  },

  /**
   * Save School Inquiry approval setting
   */
  async setSchoolInquirySetting(enabled) {
    const isEnabled = Boolean(enabled)
    try {
      localStorage.setItem(INQUIRY_SETTING_STORAGE_KEY, JSON.stringify(isEnabled))
      const store = getStoredData()
      if (!store.settings) store.settings = {}
      store.settings.schoolInquiryEnabled = isEnabled
      saveStoredData(store)

      // Notify backend if available
      try {
        await fetch(`${API_BASE_URL}/api/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            general: { schoolInquiryEnabled: isEnabled }
          })
        })
      } catch (err) {
        // Backend offline, local persistence already done
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sms_settings_updated'))
        window.dispatchEvent(new Event('sms_inquiries_updated'))
      }

      DataService.logActivity(
        'School Inquiry Policy Updated',
        `School Inquiries Approval Gate set to ${isEnabled ? 'ON (Approval Required)' : 'OFF (Instant Registration)'}`,
        'Super Admin'
      )

      return { success: true, enabled: isEnabled }
    } catch (e) {
      console.error('Error saving school inquiry setting:', e)
      return { success: false, error: e.message }
    }
  },

  // -------------------------------------------------------------
  // 2. RETRIEVE INQUIRIES
  // -------------------------------------------------------------
  async getInquiries(filter = 'ALL') {
    // 1. Try backend API first
    try {
      const res = await fetch(`${API_BASE_URL}/api/school-inquiries?filter=${filter}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(data))
          return data
        }
      }
    } catch (e) {
      // Backend unavailable, fallback to local
    }

    // 2. Local storage persistence
    let list = []
    try {
      const raw = localStorage.getItem(INQUIRIES_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed
        }
      }
    } catch (e) {
      console.warn('Error reading inquiries from localStorage:', e)
    }

    // 3. Fallback to demo inquiries if empty
    if (!list || list.length === 0) {
      list = [...INITIAL_DEMO_INQUIRIES]
      try {
        localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(list))
      } catch {}
    }

    // 4. Apply filter
    const upperFilter = (filter || 'ALL').toUpperCase()
    if (upperFilter === 'PENDING') {
      return list.filter(item => item.status?.toUpperCase() === 'PENDING')
    } else if (upperFilter === 'APPROVED') {
      return list.filter(item => item.status?.toUpperCase() === 'APPROVED')
    } else if (upperFilter === 'REJECTED') {
      return list.filter(item => item.status?.toUpperCase() === 'REJECTED')
    }

    return list
  },

  async getInquiryById(id) {
    const list = await this.getInquiries('ALL')
    return list.find(item => item.id === id) || null
  },

  // -------------------------------------------------------------
  // 3. CREATE INQUIRY (From Public Landing Page / Registration)
  // -------------------------------------------------------------
  async createInquiry(data) {
    const inquiries = await this.getInquiries('ALL')
    const timestamp = new Date().toISOString()
    const newId = `inq-${Date.now().toString().slice(-6)}`

    // Generate smart uppercase prefix (2 to 6 characters)
    let rawPrefix = (data.schoolCodePrefix || data.schoolName || 'SCHL')
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 4)
      .toUpperCase()
    if (!rawPrefix) rawPrefix = 'SCHL'

    const newInquiry = {
      id: newId,
      schoolName: data.schoolName?.trim() || 'New School Campus',
      schoolCodePrefix: rawPrefix,
      contactPerson: data.contactPerson?.trim() || 'Principal In-Charge',
      email: data.email?.trim().toLowerCase() || '',
      phone: data.phone?.trim() || '',
      city: data.city?.trim() || 'Lahore',
      province: data.province?.trim() || 'Punjab',
      address: data.address?.trim() || `${data.city || 'Lahore'}, Pakistan`,
      planTier: data.planTier || 'Standard',
      status: 'Pending',
      submissionDate: timestamp,
      adminPassword: data.adminPassword || 'Admin@123',
      notes: data.notes?.trim() || '',
      wingsCount: Number(data.wingsCount) || 1,
      campusesCount: Number(data.campusesCount) || 1,
      rejectionReason: null,
      approvedAt: null,
      approvedInstituteId: null,
      assignedSchoolCode: null
    }

    // Try backend API
    try {
      await fetch(`${API_BASE_URL}/api/school-inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInquiry)
      })
    } catch {}

    inquiries.unshift(newInquiry)
    localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(inquiries))

    DataService.logActivity(
      'New School Inquiry Submitted',
      `Application received from "${newInquiry.schoolName}" (${newInquiry.city})`,
      newInquiry.contactPerson
    )

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sms_inquiries_updated'))
      window.dispatchEvent(new Event('storage'))
    }

    return newInquiry
  },

  // -------------------------------------------------------------
  // 4. UPDATE INQUIRY (e.g. Editing School Code Prefix)
  // -------------------------------------------------------------
  async updateInquiry(id, updates = {}) {
    const inquiries = await this.getInquiries('ALL')
    const idx = inquiries.findIndex(item => item.id === id)
    if (idx === -1) {
      throw new Error(`Inquiry with ID "${id}" not found`)
    }

    // Clean prefix if provided
    if (updates.schoolCodePrefix) {
      updates.schoolCodePrefix = updates.schoolCodePrefix.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6)
    }

    inquiries[idx] = {
      ...inquiries[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    // Backend sync
    try {
      await fetch(`${API_BASE_URL}/api/school-inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
    } catch {}

    localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(inquiries))

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sms_inquiries_updated'))
    }

    return inquiries[idx]
  },

  // -------------------------------------------------------------
  // 5. APPROVE INQUIRY (Transactional Provisioning & Idempotency)
  // -------------------------------------------------------------
  async approveInquiry(id, customOverrides = {}) {
    const inquiries = await this.getInquiries('ALL')
    const inquiry = inquiries.find(item => item.id === id)
    if (!inquiry) {
      throw new Error(`Inquiry "${id}" not found`)
    }

    // TRANSACTIONAL IDEMPOTENCY CHECK:
    // Prevent duplicate institute creation on repeated requests
    if (inquiry.status === 'Approved' && inquiry.approvedInstituteId) {
      const store = getStoredData()
      const existingInst = store.institutes?.find(i => i.id === inquiry.approvedInstituteId)
      if (existingInst) {
        return {
          success: true,
          alreadyApproved: true,
          message: `Inquiry was already approved as institute "${existingInst.name}" (${existingInst.code})`,
          institute: existingInst,
          inquiry
        }
      }
    }

    const currentStore = getStoredData()
    const existingInstitutes = currentStore.institutes || []

    // 1. Determine final prefix and unique school code
    const prefix = (customOverrides.schoolCodePrefix || inquiry.schoolCodePrefix || 'SCHL')
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase()
      .trim() || 'SCHL'

    // Deduplicate school code against existing institutes
    let finalCode = `${prefix}`
    let counter = 1
    while (existingInstitutes.some(inst => (inst.code || '').toUpperCase() === finalCode)) {
      finalCode = `${prefix}-${String(counter).padStart(2, '0')}`
      counter++
    }

    const newInstId = `inst-${Date.now().toString().slice(-6)}`
    const timestamp = new Date().toISOString()
    const adminPassword = customOverrides.adminPassword || inquiry.adminPassword || 'Admin@123'
    const adminEmail = inquiry.email || `admin@${finalCode.toLowerCase()}.edu.pk`

    // 2. Prepare comprehensive Institute model matching PlatformService specification
    const wizardPayload = {
      name: inquiry.schoolName,
      code: finalCode,
      type: 'School',
      country: 'Pakistan',
      city: inquiry.city || 'Lahore',
      province: inquiry.province || 'Punjab',
      principal: inquiry.contactPerson || 'School Principal',
      email: adminEmail,
      phone: inquiry.phone || '+92 300 0000000',
      address: inquiry.address || `${inquiry.city || 'Lahore'}, Pakistan`,
      planTier: inquiry.planTier || 'Standard',
      adminName: inquiry.contactPerson || `${inquiry.schoolName} Administrator`,
      adminEmail: adminEmail,
      adminPassword: adminPassword,
      adminPhone: inquiry.phone,
      quotaStudents: inquiry.planTier === 'Enterprise' ? 3000 : 1500,
      quotaUsers: 50,
      quotaCampuses: inquiry.campusesCount || 1,
      quotaStorageMb: 2048,
      campuses: [
        {
          name: `${inquiry.schoolName} (Main Campus)`,
          code: `${finalCode}-01`,
          city: inquiry.city || 'Lahore',
          address: inquiry.address || `${inquiry.city || 'Lahore'}, Pakistan`
        }
      ]
    }

    // 3. Provision the institute atomically using PlatformService
    let provisionedInstitute = null
    try {
      if (PlatformService?.onboardInstitute) {
        await PlatformService.onboardInstitute(wizardPayload)
        const updatedStore = getStoredData()
        provisionedInstitute = updatedStore.institutes?.find(i => i.code === finalCode)
      }
    } catch (onboardError) {
      console.warn('PlatformService.onboardInstitute failed, performing resilient fallback creation:', onboardError)
    }

    // Fallback ensure institute is stored
    if (!provisionedInstitute) {
      const fallbackStore = getStoredData()
      provisionedInstitute = {
        id: newInstId,
        name: inquiry.schoolName,
        code: finalCode,
        type: 'School',
        enabledTiers: ['school'],
        country: 'Pakistan',
        city: inquiry.city || 'Lahore',
        province: inquiry.province || 'Punjab',
        principal: inquiry.contactPerson,
        email: adminEmail,
        phone: inquiry.phone,
        address: inquiry.address,
        planTier: inquiry.planTier || 'Standard',
        lifecycleStatus: 'Active',
        status: 'Active',
        totalStudents: 0,
        totalTeachers: 0,
        quotaStudents: 1500,
        quotaUsers: 50,
        quotaCampuses: 1,
        quotaStorageMb: 2048,
        createdAt: timestamp,
        joinedDate: timestamp.split('T')[0]
      }
      fallbackStore.institutes = [provisionedInstitute, ...(fallbackStore.institutes || [])]

      // Initial admin user
      const adminUser = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        name: inquiry.contactPerson || `${inquiry.schoolName} Administrator`,
        email: adminEmail,
        password: adminPassword,
        role: 'institute_admin',
        roleTitle: 'Institute Administrator',
        instituteId: newInstId,
        institute: inquiry.schoolName,
        phone: inquiry.phone,
        status: 'Active',
        lastLogin: 'Never',
        createdAt: timestamp
      }
      fallbackStore.users = [adminUser, ...(fallbackStore.users || [])]
      saveStoredData(fallbackStore)
    }

    // 4. Mark inquiry as Approved
    inquiry.status = 'Approved'
    inquiry.approvedAt = timestamp
    inquiry.approvedInstituteId = provisionedInstitute?.id || newInstId
    inquiry.assignedSchoolCode = finalCode
    inquiry.schoolCodePrefix = prefix
    inquiry.rejectionReason = null
    if (customOverrides.notes) {
      inquiry.notes = `${inquiry.notes || ''}\n[Super Admin Approval Note]: ${customOverrides.notes}`.trim()
    }

    // Persist inquiry state
    localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(inquiries))

    // Backend sync
    try {
      await fetch(`${API_BASE_URL}/api/school-inquiries/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolCodePrefix: prefix,
          assignedSchoolCode: finalCode,
          approvedInstituteId: inquiry.approvedInstituteId,
          notes: customOverrides.notes || ''
        })
      })
    } catch {}

    DataService.logActivity(
      'School Inquiry Approved',
      `Approved and provisioned "${inquiry.schoolName}" with School Code: ${finalCode}`,
      'Super Admin'
    )

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sms_inquiries_updated'))
      window.dispatchEvent(new Event('sms_institutes_updated'))
      window.dispatchEvent(new Event('sms_users_updated'))
      window.dispatchEvent(new Event('storage'))
    }

    return {
      success: true,
      inquiry,
      institute: provisionedInstitute,
      assignedCode: finalCode,
      adminEmail,
      adminPassword
    }
  },

  // -------------------------------------------------------------
  // 6. REJECT INQUIRY
  // -------------------------------------------------------------
  async rejectInquiry(id, reason = '') {
    const inquiries = await this.getInquiries('ALL')
    const inquiry = inquiries.find(item => item.id === id)
    if (!inquiry) {
      throw new Error(`Inquiry "${id}" not found`)
    }

    inquiry.status = 'Rejected'
    inquiry.rejectionReason = reason?.trim() || 'Application does not meet platform admission criteria at this time.'
    inquiry.rejectedAt = new Date().toISOString()

    localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(inquiries))

    // Backend sync
    try {
      await fetch(`${API_BASE_URL}/api/school-inquiries/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: inquiry.rejectionReason })
      })
    } catch {}

    DataService.logActivity(
      'School Inquiry Rejected',
      `Rejected application for "${inquiry.schoolName}". Reason: ${inquiry.rejectionReason}`,
      'Super Admin'
    )

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sms_inquiries_updated'))
      window.dispatchEvent(new Event('storage'))
    }

    return { success: true, inquiry }
  },

  // -------------------------------------------------------------
  // 7. DELETE SINGLE INQUIRY
  // -------------------------------------------------------------
  async deleteInquiry(id) {
    const inquiries = await this.getInquiries('ALL')
    const target = inquiries.find(item => item.id === id)
    const filtered = inquiries.filter(item => item.id !== id)

    localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(filtered))

    // Backend sync
    try {
      await fetch(`${API_BASE_URL}/api/school-inquiries/${id}`, {
        method: 'DELETE'
      })
    } catch {}

    if (target) {
      DataService.logActivity(
        'School Inquiry Deleted',
        `Removed inquiry "${target.schoolName}" (${target.id})`,
        'Super Admin'
      )
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sms_inquiries_updated'))
      window.dispatchEvent(new Event('storage'))
    }

    return { success: true }
  },

  // -------------------------------------------------------------
  // 8. BULK DELETE INQUIRIES
  // -------------------------------------------------------------
  async bulkDeleteInquiries(ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) return { success: true, count: 0 }

    const idSet = new Set(ids)
    const inquiries = await this.getInquiries('ALL')
    const remaining = inquiries.filter(item => !idSet.has(item.id))

    localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(remaining))

    // Backend sync
    try {
      await fetch(`${API_BASE_URL}/api/school-inquiries/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      })
    } catch {}

    DataService.logActivity(
      'Bulk School Inquiries Deleted',
      `Deleted ${ids.length} school inquiries from system`,
      'Super Admin'
    )

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sms_inquiries_updated'))
      window.dispatchEvent(new Event('storage'))
    }

    return { success: true, count: ids.length }
  }
}

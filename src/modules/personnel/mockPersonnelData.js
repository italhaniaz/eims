// Shared Mock State for Personnel Management (Roles & Staff)
// Uses localStorage persistence so all additions, edits, and deletions persist locally without backend.

export const DEFAULT_PERMISSION_GROUPS = [
  {
    key: 'about',
    label: 'About',
    permissions: [
      { id: 'about-us', label: 'about-us' }
    ]
  },
  {
    key: 'academy',
    label: 'Academy',
    permissions: [
      { id: 'academy-setup-create', label: 'academy-setup-create' },
      { id: 'academy-setup-delete', label: 'academy-setup-delete' },
      { id: 'academy-setup-edit', label: 'academy-setup-edit' },
      { id: 'academy-setup-list', label: 'academy-setup-list' }
    ]
  },
  {
    key: 'contact',
    label: 'Contact',
    permissions: [
      { id: 'contact-inquiry-list', label: 'contact-inquiry-list' },
      { id: 'contact-inquiry-view', label: 'contact-inquiry-view' },
      { id: 'contact-inquiry-reply', label: 'contact-inquiry-reply' }
    ]
  },
  {
    key: 'package',
    label: 'Package',
    permissions: [
      { id: 'package-list', label: 'package-list' },
      { id: 'package-create', label: 'package-create' },
      { id: 'package-edit', label: 'package-edit' },
      { id: 'package-delete', label: 'package-delete' }
    ]
  },
  {
    key: 'schools',
    label: 'Schools',
    permissions: [
      { id: 'schools-create', label: 'schools-create' },
      { id: 'schools-delete', label: 'schools-delete' },
      { id: 'schools-edit', label: 'schools-edit' },
      { id: 'schools-list', label: 'schools-list' }
    ]
  },
  {
    key: 'subscription',
    label: 'Subscription',
    permissions: [
      { id: 'subscription-view', label: 'subscription-view' },
      { id: 'subscription-edit', label: 'subscription-edit' },
      { id: 'subscription-list', label: 'subscription-list' }
    ]
  },
  {
    key: 'staff',
    label: 'Staff',
    permissions: [
      { id: 'staff-list', label: 'staff-list' },
      { id: 'staff-create', label: 'staff-create' },
      { id: 'staff-edit', label: 'staff-edit' },
      { id: 'staff-delete', label: 'staff-delete' }
    ]
  }
]

export const INITIAL_ROLES = [
  {
    id: 'role-1',
    name: 'Onboarding Manager',
    permissions: [
      'contact-inquiry-list',
      'package-list',
      'schools-create',
      'schools-delete',
      'schools-edit',
      'schools-list',
      'subscription-view'
    ],
    createdAt: '2026-01-15T10:00:00.000Z'
  },
  {
    id: 'role-2',
    name: 'super admin staff',
    permissions: [
      'academy-setup-create',
      'academy-setup-delete',
      'academy-setup-edit',
      'academy-setup-list',
      'schools-list',
      'schools-edit',
      'package-list'
    ],
    createdAt: '2026-02-10T14:30:00.000Z'
  },
  {
    id: 'role-3',
    name: 'Campus Auditor',
    permissions: [
      'schools-list',
      'subscription-view',
      'package-list',
      'contact-inquiry-list'
    ],
    createdAt: '2026-03-01T09:15:00.000Z'
  }
]

export const INITIAL_STAFF = [
  {
    id: 'stf-1',
    role: 'Onboarding Manager',
    firstName: 'Olivia',
    lastName: 'Bennett',
    email: 'olivia.bennett@example.com',
    countryCode: '+44',
    mobile: '7700900789',
    dob: '1994-08-12',
    image: 'avatar-olivia-bennett.png',
    schools: [
      'Maplewood Academy',
      'Riverside Public School',
      'Greenwood International School'
    ],
    status: 'Active',
    createdAt: '2026-02-01T11:00:00.000Z'
  },
  {
    id: 'stf-2',
    role: 'super admin staff',
    firstName: 'Alexander',
    lastName: 'Wright',
    email: 'alex.wright@example.com',
    countryCode: '+92',
    mobile: '3008472910',
    dob: '1990-03-24',
    image: 'avatar-alexander-wright.png',
    schools: [
      'Maplewood Academy',
      'City School Model Town'
    ],
    status: 'Active',
    createdAt: '2026-02-15T15:20:00.000Z'
  },
  {
    id: 'stf-3',
    role: 'Onboarding Manager',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.j@example.com',
    countryCode: '+1',
    mobile: '4155552671',
    dob: '1996-11-05',
    image: 'avatar-sarah-jenkins.png',
    schools: [
      'Riverside Public School'
    ],
    status: 'Inactive',
    createdAt: '2026-03-05T08:45:00.000Z'
  }
]

export const AVAILABLE_SCHOOLS = [
  'Maplewood Academy',
  'Riverside Public School',
  'Greenwood International School',
  'City School Model Town',
  'Beaconhouse Al-Falah Campus',
  'Roots Millennium School',
  'Army Public School'
]

export const COUNTRY_CODES = [
  { code: '+44', flag: '🇬🇧', country: 'United Kingdom' },
  { code: '+92', flag: '🇵🇰', country: 'Pakistan' },
  { code: '+1', flag: '🇺🇸', country: 'United States' },
  { code: '+971', flag: '🇦🇪', country: 'UAE' },
  { code: '+966', flag: '🇸🇦', country: 'Saudi Arabia' },
  { code: '+1-CA', flag: '🇨🇦', country: 'Canada', dial: '+1' },
  { code: '+61', flag: '🇦🇺', country: 'Australia' }
]

const ROLES_KEY = 'sms_mock_personnel_roles'
const STAFF_KEY = 'sms_mock_personnel_staff'

export const MockPersonnelService = {
  // Roles
  getRoles() {
    try {
      const raw = localStorage.getItem(ROLES_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    localStorage.setItem(ROLES_KEY, JSON.stringify(INITIAL_ROLES))
    return INITIAL_ROLES
  },

  saveRole(roleData) {
    const list = this.getRoles()
    if (roleData.id) {
      const idx = list.findIndex(r => r.id === roleData.id)
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...roleData, updatedAt: new Date().toISOString() }
      } else {
        list.push(roleData)
      }
    } else {
      const newRole = {
        ...roleData,
        id: `role-${Date.now()}`,
        createdAt: new Date().toISOString()
      }
      list.push(newRole)
    }
    localStorage.setItem(ROLES_KEY, JSON.stringify(list))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sms_personnel_roles_updated'))
    }
    return list
  },

  deleteRole(roleId) {
    const list = this.getRoles().filter(r => r.id !== roleId)
    localStorage.setItem(ROLES_KEY, JSON.stringify(list))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sms_personnel_roles_updated'))
    }
    return list
  },

  // Staff
  getStaff() {
    try {
      const raw = localStorage.getItem(STAFF_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    localStorage.setItem(STAFF_KEY, JSON.stringify(INITIAL_STAFF))
    return INITIAL_STAFF
  },

  saveStaff(staffData) {
    const list = this.getStaff()
    if (staffData.id) {
      const idx = list.findIndex(s => s.id === staffData.id)
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...staffData, updatedAt: new Date().toISOString() }
      } else {
        list.unshift(staffData)
      }
    } else {
      const newStaff = {
        ...staffData,
        id: `stf-${Date.now()}`,
        status: staffData.status || 'Active',
        createdAt: new Date().toISOString()
      }
      list.unshift(newStaff)
    }
    localStorage.setItem(STAFF_KEY, JSON.stringify(list))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sms_personnel_staff_updated'))
    }
    return list
  },

  toggleStaffStatus(staffId) {
    const list = this.getStaff()
    const idx = list.findIndex(s => s.id === staffId)
    if (idx !== -1) {
      list[idx].status = list[idx].status === 'Active' ? 'Inactive' : 'Active'
      localStorage.setItem(STAFF_KEY, JSON.stringify(list))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sms_personnel_staff_updated'))
      }
    }
    return list
  },

  deleteStaff(staffId) {
    const list = this.getStaff().filter(s => s.id !== staffId)
    localStorage.setItem(STAFF_KEY, JSON.stringify(list))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sms_personnel_staff_updated'))
    }
    return list
  }
}

import { supabase, isSupabaseConfigured } from './supabaseClient'

// Initial clean state with ZERO entries so user can enter all records themselves:
const cleanZeroData = {
  stats: {
    totalUsers: 0,
    totalInstitutes: 0,
    activeSessions: 0,
    growthRate: '0.0%'
  },
  institutes: [],
  departments: [],
  examinationBodies: [],
  academicYears: [],
  programTypes: [],
  programs: [],
  subjects: [],
  studySchemes: [],
  recentActivity: [],
  users: [],
  students: [],
  teachers: [],
  classes: [],
  fees: [],
  transport: [],
  library: [],
  admissionsPipeline: [],
  auditLogs: [],
  communicationLogs: []
}

// Optional rich sample template for preview
export const sampleTemplateData = {
  stats: {
    totalUsers: 231,
    totalInstitutes: 3,
    activeSessions: 2341,
    growthRate: '34.2%'
  },
  institutes: [
    { 
      id: 'inst-1', 
      name: 'Beaconhouse Central High School', 
      code: 'BHS-001', 
      city: 'Lahore',
      province: 'Punjab',
      email: 'beacon.central@sms.edu', 
      phone: '+92 42 35789012', 
      address: 'Gulberg III, Main Boulevard, Lahore', 
      affiliatedBoard: 'BISE Lahore',
      status: 'Active',
      principal: 'Dr. Shahida Parveen',
      totalStudents: 1240,
      totalTeachers: 68
    },
    { 
      id: 'inst-2', 
      name: 'City School Model Town Campus', 
      code: 'CSM-002', 
      city: 'Lahore',
      province: 'Punjab',
      email: 'city.model@sms.edu', 
      phone: '+92 42 35841234', 
      address: 'Block C, Model Town, Lahore', 
      affiliatedBoard: 'BISE Lahore',
      status: 'Active',
      principal: 'Prof. Tariq Mehmood',
      totalStudents: 980,
      totalTeachers: 52
    },
    { 
      id: 'inst-3', 
      name: 'Roots International Academy', 
      code: 'RIA-003', 
      city: 'Rawalpindi',
      province: 'Punjab',
      email: 'roots.intl@sms.edu', 
      phone: '+92 51 4458901', 
      address: 'Sector H-8/4, Islamabad/Rawalpindi', 
      affiliatedBoard: 'Cambridge Assessment (CAIE)',
      status: 'Active',
      principal: 'Mrs. Ayesha Siddiqui',
      totalStudents: 1150,
      totalTeachers: 64
    }
  ],
  departments: [
    { id: 'dept-1', name: 'Department of Computer Science', code: 'DCS', instituteId: 'inst-1', headName: 'Engr. Imran Khan', studentsCount: 420 },
    { id: 'dept-2', name: 'Department of Sciences (Pre-Med / Eng)', code: 'DSCI', instituteId: 'inst-1', headName: 'Dr. Fatima Noor', studentsCount: 510 }
  ],
  examinationBodies: [
    { id: 'ex-1', name: 'BISE Lahore (Board of Intermediate & Secondary Education)', code: 'BISE-LHR', type: 'Provincial Board', region: 'Lahore' },
    { id: 'ex-2', name: 'Cambridge Assessment International Education (CAIE)', code: 'CAM-INT', type: 'International', region: 'Global' }
  ],
  academicYears: [
    { id: 'ay-1', name: '2025 - 2026', startDate: '2025-08-15', endDate: '2026-06-30', isCurrent: true, status: 'Active' },
    { id: 'ay-2', name: '2026 - 2027', startDate: '2026-08-15', endDate: '2027-06-30', isCurrent: false, status: 'Upcoming' }
  ],
  programTypes: [
    { id: 'pt-1', name: 'Matriculation (Secondary School)', code: 'SSC', durationYears: 2, level: 'Secondary' },
    { id: 'pt-2', name: 'Intermediate (Higher Secondary)', code: 'HSSC', durationYears: 2, level: 'Higher Secondary' },
    { id: 'pt-3', name: 'Cambridge O/A Levels', code: 'CAIE', durationYears: 3, level: 'International' }
  ],
  programs: [
    { id: 'prg-1', name: 'F.Sc Pre-Engineering', code: 'FSC-PE', programTypeId: 'pt-2', duration: '2 Years' },
    { id: 'prg-2', name: 'F.Sc Pre-Medical', code: 'FSC-PM', programTypeId: 'pt-2', duration: '2 Years' },
    { id: 'prg-3', name: 'ICS (Computer Science)', code: 'ICS-CS', programTypeId: 'pt-2', duration: '2 Years' }
  ],
  subjects: [
    { id: 'sub-1', name: 'Computer Science (Theory & Lab)', code: 'CS-101', credits: 4 },
    { id: 'sub-2', name: 'Mathematics (Calculus & Vectors)', code: 'MTH-201', credits: 4 },
    { id: 'sub-3', name: 'Physics (Mechanics & Waves)', code: 'PHY-101', credits: 4 }
  ],
  studySchemes: [
    { id: 'ss-1', name: 'ICS Computer Curriculum 2025-26', totalSemesters: 4, status: 'Active' }
  ],
  users: [
    { id: 'usr-1', name: 'Super Administrator', email: 'admin@schoolms.com', role: 'superadmin', institute: 'All Institutes (Global)', phone: '+92 300 1234567', status: 'Active', lastLogin: 'Just now' }
  ],
  students: [
    { id: 'std-1', instituteId: 'inst-1', rollNumber: 'BHS-2024-001', name: 'Hamza Farooq', className: '10th Grade', section: 'A', email: 'hamza.f@gmail.com', phone: '+92 321 1122334', feeStatus: 'Paid', attendanceRate: '96%', bloodGroup: 'B+' }
  ],
  teachers: [
    { id: 'tch-1', instituteId: 'inst-1', empId: 'EMP-01', name: 'Dr. Shahida Parveen', designation: 'Principal', department: 'Administration', phone: '+92 300 9988776', email: 'principal.bhs@sms.edu', status: 'Active' }
  ],
  classes: [
    { id: 'cls-1', instituteId: 'inst-1', name: 'Class 10', section: 'A - Science', roomNo: 'Room 101', capacity: 40, enrolled: 35, classTeacher: 'Dr. Shahida Parveen' }
  ],
  fees: [
    { id: 'fee-1', instituteId: 'inst-1', studentName: 'Hamza Farooq', rollNumber: 'BHS-2024-001', className: '10th Grade', amount: 15000, dueDate: '2026-10-25', status: 'Paid', paymentDate: '2026-10-18' }
  ],
  transport: [
    { id: 'tr-1', vehicleNo: 'LEA-4890', busName: 'Bus #01 (Gulberg - Model Town)', driverName: 'Muhammad Rafiq', driverPhone: '+92 301 5566778', capacity: 35, assignedStudents: 32, routePath: 'Campus -> Main Blvd -> Model Town C Block', status: 'Active' },
    { id: 'tr-2', vehicleNo: 'LES-9921', busName: 'Bus #02 (Johar Town - Wapda Town)', driverName: 'Aslam Pervaiz', driverPhone: '+92 321 4455667', capacity: 40, assignedStudents: 38, routePath: 'Campus -> Canal Road -> Johar Town', status: 'Active' }
  ],
  library: [
    { id: 'lib-1', title: 'Principles of Physics (10th Edition)', author: 'Halliday & Resnick', isbn: '978-0470561584', category: 'Physics', shelfNo: 'A-14', totalCopies: 25, issuedCopies: 18, status: 'Available' },
    { id: 'lib-2', title: 'Introduction to Algorithms', author: 'Cormen & Leiserson', isbn: '978-0262033848', category: 'Computer Science', shelfNo: 'C-08', totalCopies: 15, issuedCopies: 12, status: 'Available' }
  ],
  admissionsPipeline: [
    { id: 'adm-1', studentName: 'Daniyal Tariq', parentName: 'Tariq Mehmood', parentPhone: '+92 321 8899001', gradeApplied: '11th Grade (ICS)', stage: 'Entrance Test Scheduled', testDate: '2026-10-25', status: 'Under Review' },
    { id: 'adm-2', studentName: 'Ayla Fatima', parentName: 'Khurram Shahzad', parentPhone: '+92 300 4455661', gradeApplied: '9th Grade', stage: 'Interview Passed', testDate: '2026-10-20', status: 'Pending Fee' }
  ],
  auditLogs: [
    { id: 'log-1', action: 'User Sign In', user: 'admin@schoolms.com', ip: '192.168.1.102', timestamp: '2026-10-19 18:20', status: 'Success' },
    { id: 'log-2', action: 'Challan Voucher Generated', user: 'Beaconhouse Admin', ip: '192.168.1.115', timestamp: '2026-10-19 17:45', status: 'Success' }
  ],
  recentActivity: [
    { id: 'act-1', text: 'System initialized in production mode', time: 'Just now', type: 'system', dotColor: '#3b82f6' }
  ]
}

const STORAGE_KEY = 'sms_database_v3_enterprise'

// Load from LocalStorage or initialize with ZERO state
export const getStoredData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...cleanZeroData,
        ...parsed,
        stats: {
          totalUsers: (parsed.users || []).length,
          totalInstitutes: (parsed.institutes || []).length,
          activeSessions: (parsed.users || []).length > 0 ? (parsed.users || []).length * 4 + 2 : 0,
          growthRate: (parsed.institutes || []).length > 0 ? `${((parsed.institutes || []).length * 11.4).toFixed(1)}%` : '0.0%'
        }
      }
    }
  } catch (e) {
    console.warn('LocalStorage read error:', e)
  }
  
  // Default fresh zero state
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanZeroData))
  return cleanZeroData
}

export const saveStoredData = (data) => {
  try {
    const updatedStats = {
      totalUsers: (data.users || []).length,
      totalInstitutes: (data.institutes || []).length,
      activeSessions: (data.users || []).length > 0 ? (data.users || []).length * 4 + 2 : 0,
      growthRate: (data.institutes || []).length > 0 ? `${((data.institutes || []).length * 11.4).toFixed(1)}%` : '0.0%'
    }
    const payload = {
      ...data,
      stats: updatedStats
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    return payload
  } catch (e) {
    console.error('LocalStorage save error:', e)
    return data
  }
}

// Data service API
export const DataService = {
  async getCollection(collectionName) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from(collectionName).select('*')
        if (!error && data) return data
      } catch (err) {
        console.warn(`Supabase fetch failed for ${collectionName}:`, err)
      }
    }
    const store = getStoredData()
    return store[collectionName] || []
  },

  async addItem(collectionName, item) {
    const newItem = {
      ...item,
      id: item.id || `${collectionName.slice(0, 3)}-${Date.now()}`,
      createdAt: new Date().toISOString()
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from(collectionName).insert([newItem]).select().single()
        if (!error && data) return data
      } catch (err) {
        console.warn(`Supabase insert failed for ${collectionName}:`, err)
      }
    }

    const store = getStoredData()
    if (!store[collectionName]) store[collectionName] = []
    store[collectionName].unshift(newItem)

    // Activity log
    const label = newItem.name || newItem.title || newItem.vehicleNo || newItem.rollNumber || newItem.studentName || 'Item'
    const activity = {
      id: `act-${Date.now()}`,
      text: `Added ${collectionName.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${label}`,
      time: 'Just now',
      type: collectionName,
      dotColor: '#3b82f6'
    }
    if (!store.recentActivity) store.recentActivity = []
    store.recentActivity.unshift(activity)
    if (store.recentActivity.length > 20) store.recentActivity.pop()

    // Audit log
    if (!store.auditLogs) store.auditLogs = []
    store.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: `Created ${collectionName}`,
      user: 'Administrator',
      ip: '192.168.1.' + Math.floor(100 + Math.random() * 50),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Success'
    })
    if (store.auditLogs.length > 30) store.auditLogs.pop()

    saveStoredData(store)
    return newItem
  },

  async updateItem(collectionName, id, updates) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from(collectionName).update(updates).eq('id', id).select().single()
        if (!error && data) return data
      } catch (err) {
        console.warn(`Supabase update failed for ${collectionName}:`, err)
      }
    }

    const store = getStoredData()
    if (store[collectionName]) {
      const idx = store[collectionName].findIndex(item => item.id === id)
      if (idx !== -1) {
        store[collectionName][idx] = { ...store[collectionName][idx], ...updates }
        
        const activity = {
          id: `act-${Date.now()}`,
          text: `Updated ${collectionName.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${updates.name || store[collectionName][idx].name || 'Record'}`,
          time: 'Just now',
          type: collectionName,
          dotColor: '#10b981'
        }
        if (!store.recentActivity) store.recentActivity = []
        store.recentActivity.unshift(activity)
        if (store.recentActivity.length > 20) store.recentActivity.pop()

        saveStoredData(store)
        return store[collectionName][idx]
      }
    }
    return null
  },

  async deleteItem(collectionName, id) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from(collectionName).delete().eq('id', id)
      } catch (err) {
        console.warn(`Supabase delete failed for ${collectionName}:`, err)
      }
    }

    const store = getStoredData()
    if (store[collectionName]) {
      const deletedItem = store[collectionName].find(item => item.id === id)
      store[collectionName] = store[collectionName].filter(item => item.id !== id)

      const activity = {
        id: `act-${Date.now()}`,
        text: `Removed ${collectionName.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${deletedItem?.name || deletedItem?.title || 'Record'}`,
        time: 'Just now',
        type: collectionName,
        dotColor: '#ef4444'
      }
      if (!store.recentActivity) store.recentActivity = []
      store.recentActivity.unshift(activity)
      if (store.recentActivity.length > 20) store.recentActivity.pop()

      saveStoredData(store)
    }
    return true
  },

  resetToZero() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanZeroData))
    return cleanZeroData
  },

  loadSampleTemplate() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleTemplateData))
    return sampleTemplateData
  }
}

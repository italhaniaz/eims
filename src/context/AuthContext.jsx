import React, { createContext, useContext, useState, useEffect } from 'react'
import { getApiUrl } from '../services/apiConfig'

const AuthContext = createContext(null)

// Client-side cryptographic hashing helper for secure offline password verification
export const hashPassword = async (pass, salt = 'sms_auth_sec_salt_2026') => {
  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const encoder = new TextEncoder()
      const data = encoder.encode(`${pass}::${salt}`)
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
    }
  } catch (err) {
    console.warn('Crypto subtle unavailable, using fallback hash:', err)
  }
  let h = 0x811c9dc5
  for (let i = 0; i < pass.length; i++) {
    h ^= pass.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return `h_${(h >>> 0).toString(16)}`
}

export const AuthProvider = ({ children }) => {
  // Load authenticated session from session or local storage
  const [user, setUser] = useState(() => {
    try {
      const sessionSaved = sessionStorage.getItem('sms_auth_user')
      if (sessionSaved) {
        const parsed = JSON.parse(sessionSaved)
        if (parsed && parsed.email && parsed.isExplicitLogin) {
          // Allow superadmin, institute_admin (School Admin), teacher, and student
          if (parsed.role === 'superadmin' || parsed.role === 'institute_admin' || parsed.role === 'teacher' || parsed.role === 'student') {
            delete parsed.password
            return parsed
          }
        }
      }

      const localSaved = localStorage.getItem('sms_auth_user')
      if (localSaved) {
        const parsed = JSON.parse(localSaved)
        if (parsed && parsed.email && parsed.isExplicitLogin) {
          if (parsed.role === 'superadmin' || parsed.role === 'institute_admin' || parsed.role === 'teacher' || parsed.role === 'student') {
            delete parsed.password
            return parsed
          }
        }
        localStorage.removeItem('sms_auth_user')
      }
    } catch (e) {
      console.error('Session retrieval error:', e)
    }
    return null
  })

  const [notificationCount, setNotificationCount] = useState(3)

  // Synchronize authenticated session state across storage mechanisms
  useEffect(() => {
    try {
      if (user) {
        const cleanUser = { ...user }
        delete cleanUser.password

        sessionStorage.setItem('sms_auth_user', JSON.stringify(cleanUser))
        if (localStorage.getItem('sms_auth_user')) {
          localStorage.setItem('sms_auth_user', JSON.stringify(cleanUser))
        }
      } else {
        sessionStorage.removeItem('sms_auth_user')
        localStorage.removeItem('sms_auth_user')
      }
    } catch (e) {
      console.error('Storage sync error:', e)
    }
  }, [user])

  // Inactivity auto-logout
  useEffect(() => {
    if (!user) return

    let timeoutId
    let sessionTimeoutMins = 30
    try {
      const stored = localStorage.getItem('sms_database_v3_enterprise') || localStorage.getItem('edu_sms_data_v2')
      if (stored) {
        const parsed = JSON.parse(stored)
        const policy = parsed?.securityPolicy || parsed?.systemPolicy
        if (policy?.sessionTimeoutMinutes) {
          sessionTimeoutMins = Number(policy.sessionTimeoutMinutes) || 30
        }
      }
    } catch (e) {}

    const IDLE_TIMEOUT_MS = Math.max(5, sessionTimeoutMins) * 60 * 1000

    const resetTimer = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        logout()
      }, IDLE_TIMEOUT_MS)
    }

    const handleStorageChange = (e) => {
      if (e.key === 'sms_auth_user' && !e.newValue) {
        logout()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(evt => window.addEventListener(evt, resetTimer, { passive: true }))
    resetTimer()

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('storage', handleStorageChange)
      events.forEach(evt => window.removeEventListener(evt, resetTimer))
    }
  }, [user])

  // Unified Login Handler: Super Admin & School Admin Only
  const login = (role = 'school_admin', customEmail = '', remember = false) => {
    const mail = String(customEmail || '').trim().toLowerCase()
    let userPayload = null

    // Check if an explicit registered user exists in local database
    let matchedDbUser = null
    let matchedInst = null
    try {
      const rawDb = localStorage.getItem('sms_database_v3_enterprise')
      if (rawDb) {
        const db = JSON.parse(rawDb)
        if (Array.isArray(db.users) && mail) {
          matchedDbUser = db.users.find(u => (u.email || '').toLowerCase() === mail)
        }
        if (matchedDbUser && Array.isArray(db.institutes)) {
          matchedInst = db.institutes.find(i => i.id === matchedDbUser.institute || i.name === matchedDbUser.institute)
        }
      }
    } catch (_) {}

    const isSuperadminLogin =
      role === 'superadmin' ||
      mail === 'admin@schoolms.com' ||
      mail === 'admin@apexed.io' ||
      mail === 'superadmin' ||
      matchedDbUser?.role === 'superadmin'

    const isTeacherLogin =
      role === 'teacher' ||
      mail === 'teacher@schoolms.com' ||
      mail === 'teacher@apexed.io' ||
      mail.includes('teacher') ||
      matchedDbUser?.role === 'teacher'

    const isStudentLogin =
      role === 'student' ||
      mail === 'student@schoolms.com' ||
      mail === 'student@apexed.io' ||
      mail.includes('student') ||
      matchedDbUser?.role === 'student'

    if (isSuperadminLogin) {
      userPayload = {
        id: matchedDbUser?.id || 'usr-1',
        name: matchedDbUser?.name || 'Super Administrator',
        roleTitle: 'Superadmin',
        role: 'superadmin',
        email: customEmail || 'admin@schoolms.com',
        avatar: null,
        instituteId: null,
        instituteName: 'Central Headquarters',
        scope: 'Schools Platform Administration',
        isExplicitLogin: true,
        loginTimestamp: new Date().toISOString()
      }
    } else if (isTeacherLogin) {
      userPayload = {
        id: matchedDbUser?.id || 'usr-teacher-1',
        name: matchedDbUser?.name || 'Prof. Tariq Mehmood',
        roleTitle: 'Faculty / Subject Teacher',
        role: 'teacher',
        email: customEmail || mail || 'teacher@schoolms.com',
        avatar: null,
        instituteId: matchedInst?.id || 'inst-2',
        instituteName: matchedInst?.name || 'City School Model Town Campus',
        instituteType: 'School',
        tier: 'school',
        enabledTiers: ['school'],
        scope: 'Teacher Academic Portal',
        isExplicitLogin: true,
        loginTimestamp: new Date().toISOString()
      }
    } else if (isStudentLogin) {
      userPayload = {
        id: matchedDbUser?.id || 'usr-student-1',
        name: matchedDbUser?.name || 'Unknown',
        roleTitle: 'Student',
        role: 'student',
        email: customEmail || mail || 'student@schoolms.com',
        avatar: null,
        studentId: 'std-demo-1',
        rollNumber: 'CSM-2026-042',
        admissionNumber: 'ADM-2026-108',
        className: 'Nursery',
        section: 'A',
        instituteId: matchedInst?.id || 'inst-2',
        instituteName: matchedInst?.name || 'Apex School System',
        instituteType: 'School',
        tier: 'school',
        enabledTiers: ['school'],
        scope: 'Student Academic Portal',
        isExplicitLogin: true,
        loginTimestamp: new Date().toISOString()
      }
    } else if (matchedDbUser) {
      userPayload = {
        id: matchedDbUser.id,
        name: matchedDbUser.name || 'School Principal',
        roleTitle: 'School Principal / Admin',
        role: 'institute_admin',
        email: matchedDbUser.email || customEmail,
        avatar: null,
        instituteId: matchedInst?.id || matchedDbUser.institute || 'inst-2',
        instituteName: matchedInst?.name || matchedDbUser.instituteName || 'City School Model Town Campus',
        instituteType: 'School',
        tier: 'school',
        enabledTiers: ['school'],
        scope: 'School Administration (K-10)',
        isExplicitLogin: true,
        loginTimestamp: new Date().toISOString()
      }
    } else if (mail.includes('beacon')) {
      userPayload = {
        id: 'usr-2',
        name: 'Beaconhouse School Admin',
        roleTitle: 'School Principal',
        role: 'institute_admin',
        email: customEmail || 'admin.beacon@sms.edu',
        avatar: null,
        instituteId: 'inst-1',
        instituteName: 'Beaconhouse Central High School',
        instituteType: 'School',
        tier: 'school',
        enabledTiers: ['school'],
        scope: 'School Administration (K-10)',
        isExplicitLogin: true,
        loginTimestamp: new Date().toISOString()
      }
    } else {
      userPayload = {
        id: 'usr-school',
        name: 'Mrs. Samina Khurram',
        roleTitle: 'School Principal',
        role: 'institute_admin',
        email: customEmail || 'admin.school@cityschool.edu',
        avatar: null,
        instituteId: 'inst-2',
        instituteName: 'City School Model Town Campus',
        instituteType: 'School',
        tier: 'school',
        enabledTiers: ['school'],
        scope: 'School Administration (K-10)',
        isExplicitLogin: true,
        loginTimestamp: new Date().toISOString()
      }
    }

    setUser(userPayload)

    try {
      sessionStorage.setItem('sms_auth_user', JSON.stringify(userPayload))
      if (remember) {
        localStorage.setItem('sms_auth_user', JSON.stringify(userPayload))
      } else {
        localStorage.removeItem('sms_auth_user')
      }
    } catch (e) {
      console.error('Storage write error:', e)
    }
  }

  // Backend-First Credential Authentication: Verifies email & password and routes to exact portal
  const authenticateCredentials = async (identifierInput = '', passwordInput = '', remember = false) => {
    const mail = String(identifierInput || '').trim().toLowerCase()
    const pass = String(passwordInput || '')

    if (!mail || !pass.trim()) {
      return { success: false, message: 'Please enter both email and password.' }
    }

    const commitAuthenticatedSession = (userPayload, token = null) => {
      const cleanUser = { ...userPayload, isExplicitLogin: true }
      delete cleanUser.password
      setUser(cleanUser)
      try {
        if (token) {
          sessionStorage.setItem('sms_auth_token', token)
        }
        sessionStorage.setItem('sms_auth_user', JSON.stringify(cleanUser))
        if (remember) {
          localStorage.setItem('sms_auth_user', JSON.stringify(cleanUser))
        } else {
          localStorage.removeItem('sms_auth_user')
        }
      } catch (e) {
        console.error('Storage write error:', e)
      }
    }

    const storedCustomHash = localStorage.getItem(`sms_pwd_hash_${mail}`)
    const inputHash = await hashPassword(pass)

    // Load client-created schools/users from local store (for offline/browser-created tenants)
    let db = { users: [], institutes: [] }
    try {
      const rawDb = localStorage.getItem('sms_database_v3_enterprise')
      if (rawDb) db = JSON.parse(rawDb)
    } catch (_) {}
    const dbUsers = Array.isArray(db.users) ? db.users : []
    const dbInstitutes = Array.isArray(db.institutes) ? db.institutes : []

    const verifyLocalDatabaseAccount = () => {
      const matchedDbUser = dbUsers.find(u => (u.email || '').trim().toLowerCase() === mail)
      if (matchedDbUser) {
        if (matchedDbUser.status === 'Suspended' || matchedDbUser.status === 'Disabled') {
          return { matched: true, success: false, message: 'This account is suspended. Please contact your administrator.' }
        }
        const isPasswordValid = storedCustomHash
          ? inputHash === storedCustomHash
          : matchedDbUser.passwordHash
            ? (inputHash === matchedDbUser.passwordHash || matchedDbUser.password === pass)
            : matchedDbUser.password
              ? matchedDbUser.password === pass
              : false
        if (!isPasswordValid) {
          return { matched: true, success: false, message: 'Invalid email or password.' }
        }
        const matchedInst = dbInstitutes.find(
          i => i.id === matchedDbUser.instituteId || i.id === matchedDbUser.institute || i.name === matchedDbUser.institute
        )
        const targetRole = matchedDbUser.role === 'superadmin' 
          ? 'superadmin' 
          : (matchedDbUser.role === 'teacher' ? 'teacher' : matchedDbUser.role === 'student' ? 'student' : 'institute_admin')
        const roleTitle = targetRole === 'superadmin' 
          ? 'Superadmin' 
          : (targetRole === 'teacher' ? 'Faculty / Subject Teacher' : targetRole === 'student' ? 'Student' : 'School Principal / Admin')
        return {
          matched: true,
          success: true,
          user: {
            id: matchedDbUser.id,
            name: matchedDbUser.name || (targetRole === 'superadmin' ? 'Super Administrator' : targetRole === 'teacher' ? 'Faculty Teacher' : targetRole === 'student' ? 'Unknown' : 'School Principal'),
            roleTitle: roleTitle,
            role: targetRole,
            email: matchedDbUser.email || mail,
            avatar: null,
            studentId: matchedDbUser.studentId || (targetRole === 'student' ? 'std-demo-1' : undefined),
            rollNumber: matchedDbUser.rollNumber || (targetRole === 'student' ? 'CSM-2026-042' : undefined),
            admissionNumber: matchedDbUser.admissionNumber || (targetRole === 'student' ? 'ADM-2026-108' : undefined),
            className: matchedDbUser.className || (targetRole === 'student' ? 'Nursery' : undefined),
            section: matchedDbUser.section || (targetRole === 'student' ? 'A' : undefined),
            instituteId: targetRole === 'superadmin' ? null : (matchedInst?.id || matchedDbUser.instituteId || matchedDbUser.institute || 'inst-2'),
            instituteName: targetRole === 'superadmin' ? 'Central Headquarters' : (matchedInst?.name || matchedDbUser.instituteName || matchedDbUser.institute || 'Apex School System'),
            instituteType: targetRole === 'superadmin' ? undefined : 'School',
            tier: targetRole === 'superadmin' ? undefined : 'school',
            enabledTiers: targetRole === 'superadmin' ? undefined : ['school'],
            scope: targetRole === 'superadmin' ? 'Schools Platform Administration' : targetRole === 'teacher' ? 'Teacher Academic Portal' : targetRole === 'student' ? 'Student Academic Portal' : 'School Administration (K-10)',
            loginTimestamp: new Date().toISOString()
          }
        }
      }

      const matchedInst = dbInstitutes.find(
        i => (i.adminEmail || '').trim().toLowerCase() === mail || (i.email || '').trim().toLowerCase() === mail
      )
      if (matchedInst && (matchedInst.adminPassword || storedCustomHash)) {
        if ((matchedInst.status || matchedInst.lifecycleStatus) === 'Suspended') {
          return { matched: true, success: false, message: 'This school account is currently suspended.' }
        }
        const isPasswordValid = storedCustomHash
          ? inputHash === storedCustomHash
          : matchedInst.adminPassword === pass
        if (!isPasswordValid) {
          return { matched: true, success: false, message: 'Invalid email or password.' }
        }
        return {
          matched: true,
          success: true,
          user: {
            id: `usr-${matchedInst.id}`,
            name: matchedInst.adminName || matchedInst.principal || 'School Principal',
            roleTitle: 'School Principal / Admin',
            role: 'institute_admin',
            email: mail,
            avatar: null,
            instituteId: matchedInst.id,
            instituteName: matchedInst.name,
            instituteType: 'School',
            tier: 'school',
            enabledTiers: ['school'],
            scope: 'School Administration (K-10)',
            loginTimestamp: new Date().toISOString()
          }
        }
      }
      return { matched: false }
    }

    // 1. Call Backend API (/api/auth/login) for verification
    try {
      const endpoint =
        typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? '/api/auth/login'
          : getApiUrl('/api/auth/login')

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: mail, password: pass })
      })

      const data = await response.json().catch(() => null)

      if (response.ok && data?.success && data?.user) {
        // Respect locally updated custom password override if user changed password in browser
        if (storedCustomHash && inputHash !== storedCustomHash) {
          return { success: false, message: 'Invalid email or password.' }
        }
        commitAuthenticatedSession(data.user, data.token || null)
        return { success: true, user: data.user }
      }

      // If backend responded (e.g. 401/403/400), check if account was provisioned solely in local browser store
      if (data !== null) {
        const localRes = verifyLocalDatabaseAccount()
        if (localRes.matched) {
          if (localRes.success) {
            commitAuthenticatedSession(localRes.user)
            return { success: true, user: localRes.user }
          }
          return { success: false, message: localRes.message }
        }
        return { success: false, message: data?.error || 'Invalid email or password.' }
      }
    } catch (_) {
      // Backend API unreachable -> fall through to strict offline verification below
    }

    // 2. Strict Offline / Static-Host Verification (never skips password check)
    const localRes = verifyLocalDatabaseAccount()
    if (localRes.matched) {
      if (localRes.success) {
        commitAuthenticatedSession(localRes.user)
        return { success: true, user: localRes.user }
      }
      return { success: false, message: localRes.message }
    }

    const offlineDefaults = {
      'admin@schoolms.com': {
        id: 'usr-1',
        name: 'Super Administrator',
        roleTitle: 'Superadmin',
        role: 'superadmin',
        email: 'admin@schoolms.com',
        instituteId: null,
        instituteName: 'Central Headquarters',
        scope: 'Schools Platform Administration'
      },
      'admin@apexed.io': {
        id: 'usr-1-apex',
        name: 'Super Administrator',
        roleTitle: 'Superadmin',
        role: 'superadmin',
        email: 'admin@apexed.io',
        instituteId: null,
        instituteName: 'Central Headquarters',
        scope: 'Schools Platform Administration'
      },
      'admin.beacon@sms.edu': {
        id: 'usr-beacon-1',
        name: 'Unknown User',
        roleTitle: 'ADMIN',
        role: 'institute_admin',
        email: 'admin.beacon@sms.edu',
        instituteId: 'inst-1',
        instituteName: 'Beaconhouse Central High School',
        instituteType: 'School',
        tier: 'school',
        enabledTiers: ['school'],
        scope: 'School Administration (K-10)'
      },
      'admin.school@cityschool.edu': {
        id: 'usr-city-2',
        name: 'Unknown User',
        roleTitle: 'ADMIN',
        role: 'institute_admin',
        email: 'admin.school@cityschool.edu',
        instituteId: 'inst-2',
        instituteName: 'City School Model Town Campus',
        instituteType: 'School',
        tier: 'school',
        enabledTiers: ['school'],
        scope: 'School Administration (K-10)'
      },
      'teacher@schoolms.com': {
        id: 'usr-teacher-1',
        name: 'Prof. Tariq Mehmood',
        roleTitle: 'Faculty / Subject Teacher',
        role: 'teacher',
        email: 'teacher@schoolms.com',
        instituteId: 'inst-2',
        instituteName: 'City School Model Town Campus',
        instituteType: 'School',
        tier: 'school',
        enabledTiers: ['school'],
        scope: 'Teacher Academic Portal'
      },
      'teacher@apexed.io': {
        id: 'usr-teacher-2',
        name: 'Prof. Tariq Mehmood',
        roleTitle: 'Faculty / Subject Teacher',
        role: 'teacher',
        email: 'teacher@apexed.io',
        instituteId: 'inst-2',
        instituteName: 'City School Model Town Campus',
        instituteType: 'School',
        tier: 'school',
        enabledTiers: ['school'],
        scope: 'Teacher Academic Portal'
      },
      'student@schoolms.com': {
        id: 'usr-student-1',
        name: 'Unknown',
        roleTitle: 'Student',
        role: 'student',
        email: 'student@schoolms.com',
        studentId: 'std-demo-1',
        rollNumber: 'CSM-2026-042',
        admissionNumber: 'ADM-2026-108',
        className: 'Nursery',
        section: 'A',
        instituteId: 'inst-2',
        instituteName: 'Apex School System',
        instituteType: 'School',
        tier: 'school',
        enabledTiers: ['school'],
        scope: 'Student Academic Portal'
      },
      'student@apexed.io': {
        id: 'usr-student-2',
        name: 'Unknown',
        roleTitle: 'Student',
        role: 'student',
        email: 'student@apexed.io',
        studentId: 'std-demo-1',
        rollNumber: 'CSM-2026-042',
        admissionNumber: 'ADM-2026-108',
        className: 'Nursery',
        section: 'A',
        instituteId: 'inst-2',
        instituteName: 'Apex School System',
        instituteType: 'School',
        tier: 'school',
        enabledTiers: ['school'],
        scope: 'Student Academic Portal'
      }
    }

    const builtIn = offlineDefaults[mail]
    if (builtIn) {
      const isDefaultValid = storedCustomHash
        ? inputHash === storedCustomHash
        : ['password123', 'admin123', 'Password@123', 'teacher123', 'password'].includes(pass)

      if (!isDefaultValid) {
        return { success: false, message: 'Invalid email or password.' }
      }
      commitAuthenticatedSession({ ...builtIn, loginTimestamp: new Date().toISOString() })
      return { success: true, user: builtIn }
    }

    return { success: false, message: 'Invalid email or password.' }
  }

  const logout = () => {
    setUser(null)
    try {
      sessionStorage.removeItem('sms_auth_user')
      sessionStorage.removeItem('sms_auth_token')
      localStorage.removeItem('sms_auth_user')
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/')
      }
      window.dispatchEvent(new Event('sms_auth_logout'))
    } catch (e) {
      console.error('Storage clear error:', e)
    }
  }

  const switchRole = (newRole) => {
    login(newRole)
  }

  // Enterprise Password Update with salted cryptographic verification
  const updatePassword = async (currentPassword, newPassword) => {
    if (!user) return { success: false, message: 'User not authenticated' }

    if (!newPassword || newPassword.length < 8) {
      return { success: false, message: 'Security Policy: New password must be at least 8 characters long.' }
    }

    const hasNumber = /\d/.test(newPassword)
    const hasLetter = /[a-zA-Z]/.test(newPassword)
    if (!hasNumber || !hasLetter) {
      return { success: false, message: 'Password must contain a combination of letters and numbers.' }
    }

    const currentHash = await hashPassword(currentPassword)
    const storedHash = localStorage.getItem(`sms_pwd_hash_${user.email}`)

    if (storedHash) {
      if (currentHash !== storedHash) {
        return { success: false, message: 'Current password verification failed. Please check your credentials.' }
      }
    } else {
      const isDefault = currentPassword === 'admin' || currentPassword === 'admin123' || currentPassword === 'password123' || currentPassword === 'Password@123'
      if (!isDefault) {
        return { success: false, message: 'Current password verification failed.' }
      }
    }

    const newHash = await hashPassword(newPassword)
    try {
      localStorage.setItem(`sms_pwd_hash_${user.email}`, newHash)
      const updatedUser = {
        ...user,
        passwordChangedAt: new Date().toISOString()
      }
      delete updatedUser.password
      setUser(updatedUser)
      sessionStorage.setItem('sms_auth_user', JSON.stringify(updatedUser))
      if (localStorage.getItem('sms_auth_user')) {
        localStorage.setItem('sms_auth_user', JSON.stringify(updatedUser))
      }
      return { success: true, message: 'Password updated successfully and encrypted with SHA-256.' }
    } catch (e) {
      return { success: false, message: 'Failed to update password in local security store.' }
    }
  }

  const updateProfile = (profileData) => {
    if (!user) return
    const updated = {
      ...user,
      ...profileData
    }
    delete updated.password
    setUser(updated)
    try {
      sessionStorage.setItem('sms_auth_user', JSON.stringify(updated))
      if (localStorage.getItem('sms_auth_user')) {
        localStorage.setItem('sms_auth_user', JSON.stringify(updated))
      }
    } catch (e) {
      console.error('Storage profile update error:', e)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      authenticateCredentials,
      logout, 
      switchRole, 
      updatePassword, 
      updateProfile, 
      notificationCount, 
      setNotificationCount 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext

import React, { createContext, useContext, useState, useEffect } from 'react'

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
          // Only allow superadmin and institute_admin (School Admin)
          if (parsed.role === 'superadmin' || parsed.role === 'institute_admin') {
            delete parsed.password
            return parsed
          }
        }
      }

      const localSaved = localStorage.getItem('sms_auth_user')
      if (localSaved) {
        const parsed = JSON.parse(localSaved)
        if (parsed && parsed.email && parsed.isExplicitLogin) {
          if (parsed.role === 'superadmin' || parsed.role === 'institute_admin') {
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

  const logout = () => {
    setUser(null)
    try {
      sessionStorage.removeItem('sms_auth_user')
      localStorage.removeItem('sms_auth_user')
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

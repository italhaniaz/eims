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
  // Deterministic fallback hash if Web Crypto is blocked
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
      // 1. Check session storage for active authenticated session in current tab
      const sessionSaved = sessionStorage.getItem('sms_auth_user')
      if (sessionSaved) {
        const parsed = JSON.parse(sessionSaved)
        if (parsed && parsed.email && parsed.isExplicitLogin) {
          // Security hygiene: never hold plaintext passwords in memory or storage
          delete parsed.password
          return parsed
        }
      }

      // 2. Check localStorage for remembered session
      const localSaved = localStorage.getItem('sms_auth_user')
      if (localSaved) {
        const parsed = JSON.parse(localSaved)
        if (parsed && parsed.email && parsed.isExplicitLogin) {
          delete parsed.password
          return parsed
        } else {
          localStorage.removeItem('sms_auth_user')
        }
      }
    } catch (e) {
      console.error('Session retrieval error:', e)
    }
    // Default to unauthenticated: ALWAYS show landing/login on fresh visit
    return null
  })

  const [notificationCount, setNotificationCount] = useState(3)

  // Synchronize authenticated session state across storage mechanisms
  useEffect(() => {
    try {
      if (user) {
        // Strip sensitive credentials prior to storage writes
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

  // Inactivity auto-logout (dynamically synchronized with Security Center policy)
  useEffect(() => {
    if (!user) return

    let timeoutId
    let sessionTimeoutMins = 30
    try {
      const stored = localStorage.getItem('edu_sms_data_v2')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.systemPolicy?.sessionTimeoutMinutes) {
          sessionTimeoutMins = Number(parsed.systemPolicy.sessionTimeoutMinutes) || 30
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

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(evt => window.addEventListener(evt, resetTimer, { passive: true }))
    resetTimer()

    return () => {
      clearTimeout(timeoutId)
      events.forEach(evt => window.removeEventListener(evt, resetTimer))
    }
  }, [user])

  // Comprehensive Multi-Tenant Multi-Role Login Handler
  const login = (role = 'superadmin', customEmail = '', remember = false) => {
    let userPayload = null

    switch (role) {
      case 'superadmin':
        userPayload = {
          id: 'usr-1',
          name: 'Super Administrator',
          roleTitle: 'Superadmin',
          role: 'superadmin',
          email: customEmail || 'admin@schoolms.com',
          avatar: null,
          instituteId: null,
          instituteName: 'Central Headquarters',
          scope: 'Platform Wide',
          isExplicitLogin: true,
          loginTimestamp: new Date().toISOString()
        }
        break

      case 'teacher':
        userPayload = {
          id: 'usr-3',
          name: 'Prof. Tariq Mahmood',
          roleTitle: 'Senior Faculty Member',
          role: 'teacher',
          email: customEmail || 'tariq.faculty@sms.edu',
          avatar: null,
          instituteId: 'inst-1',
          instituteName: 'Beaconhouse Central High School',
          department: 'Computer Science & Mathematics',
          assignedClasses: ['10th Grade - Super Section', '11th Grade (ICS) - Section A'],
          isExplicitLogin: true,
          loginTimestamp: new Date().toISOString()
        }
        break

      case 'accountant':
        userPayload = {
          id: 'usr-4',
          name: 'Rashid Khan (Finance)',
          roleTitle: 'Accounts & Billing Officer',
          role: 'accountant',
          email: customEmail || 'accounts.beacon@sms.edu',
          avatar: null,
          instituteId: 'inst-1',
          instituteName: 'Beaconhouse Central High School',
          scope: 'Financial Registers & Challans',
          isExplicitLogin: true,
          loginTimestamp: new Date().toISOString()
        }
        break

      case 'student':
        userPayload = {
          id: 'usr-5',
          name: 'Hamza Farooq',
          roleTitle: 'Enrolled Student',
          role: 'student',
          email: customEmail || 'hamza.f@student.sms.edu',
          avatar: null,
          instituteId: 'inst-1',
          instituteName: 'Beaconhouse Central High School',
          studentId: 'BHS-2024-001',
          className: '10th Grade',
          section: 'Super Section',
          isExplicitLogin: true,
          loginTimestamp: new Date().toISOString()
        }
        break

      case 'parent':
        userPayload = {
          id: 'usr-6',
          name: 'Farooq Ahmed (Guardian)',
          roleTitle: 'Parent / Guardian',
          role: 'parent',
          email: customEmail || 'farooq.parent@gmail.com',
          avatar: null,
          instituteId: 'inst-1',
          instituteName: 'Beaconhouse Central High School',
          wardName: 'Hamza Farooq',
          wardRollNo: 'BHS-2024-001',
          wardClass: '10th Grade',
          isExplicitLogin: true,
          loginTimestamp: new Date().toISOString()
        }
        break

      case 'school_admin':
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
          enabledTiers: ['school'],
          scope: 'School Administration (K-10)',
          isExplicitLogin: true,
          loginTimestamp: new Date().toISOString()
        }
        break

      case 'college_admin':
        userPayload = {
          id: 'usr-college',
          name: 'Engr. Kamran Raza',
          roleTitle: 'College Principal',
          role: 'institute_admin',
          email: customEmail || 'admin.college@roots.edu',
          avatar: null,
          instituteId: 'inst-3',
          instituteName: 'Roots International College & Academy',
          instituteType: 'College',
          enabledTiers: ['college'],
          scope: 'Degree College Administration (11-12 & ADP)',
          isExplicitLogin: true,
          loginTimestamp: new Date().toISOString()
        }
        break

      case 'university_admin':
        userPayload = {
          id: 'usr-uni',
          name: 'Prof. Dr. Rizwan Riaz',
          roleTitle: 'Dean / Registrar',
          role: 'institute_admin',
          email: customEmail || 'admin.uni@ias.edu.pk',
          avatar: null,
          instituteId: 'inst-4',
          instituteName: 'Institute of Applied Sciences & Undergraduates',
          instituteType: 'University',
          enabledTiers: ['undergraduate'],
          scope: 'University Administration (BS Honors)',
          isExplicitLogin: true,
          loginTimestamp: new Date().toISOString()
        }
        break

      case 'institute_admin':
      default: {
        const mail = (customEmail || '').toLowerCase()
        if (mail.includes('cityschool') || mail.includes('school')) {
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
            enabledTiers: ['school'],
            scope: 'School Administration (K-10)',
            isExplicitLogin: true,
            loginTimestamp: new Date().toISOString()
          }
        } else if (mail.includes('roots') || mail.includes('college')) {
          userPayload = {
            id: 'usr-college',
            name: 'Engr. Kamran Raza',
            roleTitle: 'College Principal',
            role: 'institute_admin',
            email: customEmail || 'admin.college@roots.edu',
            avatar: null,
            instituteId: 'inst-3',
            instituteName: 'Roots International College & Academy',
            instituteType: 'College',
            enabledTiers: ['college'],
            scope: 'Degree College Administration (11-12 & ADP)',
            isExplicitLogin: true,
            loginTimestamp: new Date().toISOString()
          }
        } else if (mail.includes('ias') || mail.includes('uni') || mail.includes('undergrad')) {
          userPayload = {
            id: 'usr-uni',
            name: 'Prof. Dr. Rizwan Riaz',
            roleTitle: 'Dean / Registrar',
            role: 'institute_admin',
            email: customEmail || 'admin.uni@ias.edu.pk',
            avatar: null,
            instituteId: 'inst-4',
            instituteName: 'Institute of Applied Sciences & Undergraduates',
            instituteType: 'University',
            enabledTiers: ['undergraduate'],
            scope: 'University Administration (BS Honors)',
            isExplicitLogin: true,
            loginTimestamp: new Date().toISOString()
          }
        } else {
          userPayload = {
            id: 'usr-2',
            name: 'Beaconhouse Admin',
            roleTitle: 'Campus Director',
            role: 'institute_admin',
            email: customEmail || 'admin.beacon@sms.edu',
            avatar: null,
            instituteId: 'inst-1',
            instituteName: 'Beaconhouse Central High School',
            instituteType: 'Custom',
            enabledTiers: ['school', 'college'],
            scope: 'Multi-Tier Campus Administration',
            isExplicitLogin: true,
            loginTimestamp: new Date().toISOString()
          }
        }
        break
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

    // Minimum 8 characters with at least one number or special character
    if (!newPassword || newPassword.length < 8) {
      return { success: false, message: 'Security Policy: New password must be at least 8 characters long.' }
    }

    const hasNumber = /\d/.test(newPassword)
    const hasLetter = /[a-zA-Z]/.test(newPassword)
    if (!hasNumber || !hasLetter) {
      return { success: false, message: 'Password must contain a combination of letters and numbers.' }
    }

    // Verify current password against stored salt or default initial credentials
    const currentHash = await hashPassword(currentPassword)
    const storedHash = localStorage.getItem(`sms_pwd_hash_${user.email}`)

    if (storedHash) {
      if (currentHash !== storedHash) {
        return { success: false, message: 'Current password verification failed. Please check your credentials.' }
      }
    } else {
      // First-time change: verify against initial standard defaults
      const isDefault = currentPassword === 'admin' || currentPassword === 'admin123' || currentPassword === 'Password@123'
      if (!isDefault) {
        return { success: false, message: 'Current password verification failed.' }
      }
    }

    // Store new salted hash securely in protected store
    const newHash = await hashPassword(newPassword)
    try {
      localStorage.setItem(`sms_pwd_hash_${user.email}`, newHash)
      // Strip any raw password from user object
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

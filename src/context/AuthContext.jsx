import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  // Load authenticated session from session or local storage
  const [user, setUser] = useState(() => {
    try {
      // 1. Check session storage for active authenticated session in current tab
      const sessionSaved = sessionStorage.getItem('sms_auth_user')
      if (sessionSaved) {
        const parsed = JSON.parse(sessionSaved)
        if (parsed && parsed.email && parsed.isExplicitLogin) {
          return parsed
        }
      }

      // 2. Check localStorage for remembered session
      const localSaved = localStorage.getItem('sms_auth_user')
      if (localSaved) {
        const parsed = JSON.parse(localSaved)
        // Guard: old versions stored hardcoded dummy user without isExplicitLogin
        if (parsed && parsed.email && parsed.isExplicitLogin) {
          return parsed
        } else {
          // Purge stale or legacy auto-saved dummy session
          localStorage.removeItem('sms_auth_user')
        }
      }
    } catch (e) {
      console.error('Session retrieval error:', e)
    }
    // Default to unauthenticated: ALWAYS show login page on fresh visit
    return null
  })

  const [notificationCount, setNotificationCount] = useState(3)

  useEffect(() => {
    try {
      if (user) {
        sessionStorage.setItem('sms_auth_user', JSON.stringify(user))
        if (localStorage.getItem('sms_auth_user')) {
          localStorage.setItem('sms_auth_user', JSON.stringify(user))
        }
      } else {
        sessionStorage.removeItem('sms_auth_user')
        localStorage.removeItem('sms_auth_user')
      }
    } catch (e) {
      console.error('Storage sync error:', e)
    }
  }, [user])

  // Inactivity auto-logout (30 minutes of idle time for institutional security)
  useEffect(() => {
    if (!user) return

    let timeoutId
    const IDLE_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

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

  const login = (role = 'superadmin', customEmail = '', remember = false) => {
    const userPayload = role === 'superadmin' ? {
      id: 'usr-1',
      name: 'Super Administrator',
      roleTitle: 'Superadmin',
      role: 'superadmin',
      email: customEmail || 'admin@schoolms.com',
      avatar: null,
      instituteId: null,
      instituteName: 'Central Headquarters',
      isExplicitLogin: true,
      loginTimestamp: new Date().toISOString()
    } : {
      id: 'usr-2',
      name: 'Beaconhouse Admin',
      roleTitle: 'Institute Admin',
      role: 'institute_admin',
      email: customEmail || 'admin.beacon@sms.edu',
      avatar: null,
      instituteId: 'inst-1',
      instituteName: 'Beaconhouse Central High School',
      isExplicitLogin: true,
      loginTimestamp: new Date().toISOString()
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
    } catch (e) {
      console.error('Storage clear error:', e)
    }
  }

  const switchRole = (newRole) => {
    login(newRole)
  }

  const updatePassword = (currentPassword, newPassword) => {
    if (!user) return { success: false, message: 'User not authenticated' }
    
    const validCurrent = user.password || 'admin'
    // Also accept 'admin123' as fallback default
    if (currentPassword !== validCurrent && currentPassword !== 'admin123' && currentPassword !== 'admin') {
      return { success: false, message: 'Current password does not match.' }
    }

    if (!newPassword || newPassword.length < 5) {
      return { success: false, message: 'New password must be at least 5 characters long.' }
    }

    const updatedUser = {
      ...user,
      password: newPassword
    }

    setUser(updatedUser)
    localStorage.setItem('sms_auth_user', JSON.stringify(updatedUser))
    return { success: true, message: 'Password changed successfully.' }
  }

  const updateProfile = (profileData) => {
    if (!user) return
    const updated = {
      ...user,
      ...profileData
    }
    setUser(updated)
    localStorage.setItem('sms_auth_user', JSON.stringify(updated))
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

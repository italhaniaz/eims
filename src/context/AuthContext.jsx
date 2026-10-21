import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  // Preset default user or load from localStorage
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sms_auth_user')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    // Default active user is Superadmin
    return {
      id: 'usr-1',
      name: 'admin',
      roleTitle: 'admin',
      role: 'superadmin', // 'superadmin' or 'institute_admin'
      email: 'admin@schoolms.com',
      password: 'admin',
      avatar: null,
      instituteId: 'inst-1',
      instituteName: 'Beaconhouse Central High School'
    }
  })

  const [notificationCount, setNotificationCount] = useState(3)

  useEffect(() => {
    if (user) {
      localStorage.setItem('sms_auth_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('sms_auth_user')
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

  const login = (role = 'superadmin', customEmail = '') => {
    if (role === 'superadmin') {
      setUser({
        id: 'usr-1',
        name: 'admin',
        roleTitle: 'admin',
        role: 'superadmin',
        email: customEmail || 'superadmin@sms.com',
        avatar: null,
        instituteId: null,
        instituteName: 'Central Headquarters'
      })
    } else {
      setUser({
        id: 'usr-2',
        name: 'Beaconhouse Admin',
        roleTitle: 'Institute Admin',
        role: 'institute_admin',
        email: customEmail || 'admin.beacon@sms.edu',
        avatar: null,
        instituteId: 'inst-1',
        instituteName: 'Beaconhouse Central High School'
      })
    }
  }

  const logout = () => {
    setUser(null)
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

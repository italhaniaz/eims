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
    // Default active user is Superadmin as in the screenshot:
    // "admin" / "admin"
    return {
      id: 'usr-1',
      name: 'admin',
      roleTitle: 'admin',
      role: 'superadmin', // 'superadmin' or 'institute_admin'
      email: 'admin@schoolms.com',
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

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, notificationCount, setNotificationCount }}>
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

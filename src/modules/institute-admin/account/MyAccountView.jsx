import React, { useState } from 'react'
import {
  User,
  Key,
  ShieldCheck,
  Save,
  Eye,
  EyeOff,
  Building2,
  LogOut
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'

export const MyAccountView = ({ currentInstitute }) => {
  const { user, updateProfile, updatePassword, logout } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState(user?.name || '')
  const [roleTitle, setRoleTitle] = useState(user?.roleTitle || 'School Principal')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [updatingPass, setUpdatingPass] = useState(false)

  const handleSaveProfile = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Display name is required.')
      return
    }
    updateProfile({ name: name.trim(), roleTitle: roleTitle.trim() || 'School Principal' })
    toast.success('Account profile updated.')
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both current and new passwords.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.')
      return
    }
    setUpdatingPass(true)
    try {
      const res = await updatePassword(currentPassword, newPassword)
      if (!res?.success) {
        toast.error(res?.message || 'Unable to update password.')
      } else {
        toast.success(res.message || 'Password updated successfully.')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } finally {
      setUpdatingPass(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] font-heading flex items-center gap-2.5">
            <User className="w-6 h-6 text-emerald-600" />
            <span>My Account &amp; Security</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Manage your administrator profile, school assignment, and login password.
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* School Assignment Banner */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text)]">{currentInstitute?.name || user?.instituteName || 'School Campus'}</p>
            <p className="text-xs text-[var(--text-muted)] font-mono">{user?.email}</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified School Admin</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <form onSubmit={handleSaveProfile} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Profile Details</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1">Designation / Role Title</label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1">Login Email</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </form>

        {/* Password Card */}
        <form onSubmit={handlePasswordChange} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
              <Key className="w-4 h-4 text-emerald-600" />
              <span>Change Login Password</span>
            </div>
            <button
              type="button"
              onClick={() => setShowPass(prev => !prev)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] flex items-center gap-1 cursor-pointer"
            >
              {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPass ? 'Hide' : 'Show'}</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1">Current Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1">New Password (8+ chars, letters &amp; numbers)</label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1">Confirm New Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
            />
          </div>
          <button
            type="submit"
            disabled={updatingPass}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            {updatingPass ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default MyAccountView

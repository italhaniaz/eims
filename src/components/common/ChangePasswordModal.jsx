import React, { useState } from 'react'
import { ShieldCheck, Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, Key } from 'lucide-react'
import Modal from './Modal'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { user, updatePassword } = useAuth()
  const { toast } = useToast()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: 'None', color: 'bg-slate-200' }
    let score = 0
    if (pass.length >= 6) score += 1
    if (pass.length >= 10) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1

    if (score <= 2) return { score: 33, text: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-600' }
    if (score <= 4) return { score: 66, text: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-600' }
    return { score: 100, text: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-600' }
  }

  const strength = getPasswordStrength(newPassword)

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!currentPassword) {
      setErrorMsg('Please enter your current password.')
      return
    }

    if (newPassword.length < 5) {
      setErrorMsg('New password must be at least 5 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.')
      return
    }

    const res = updatePassword(currentPassword, newPassword)
    if (!res.success) {
      setErrorMsg(res.message)
      return
    }

    toast.success('Security credentials updated! Your new password is now active.')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account Security & Password Management">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">{user?.name || 'Administrator'}</p>
              <p className="text-[11px] text-slate-400 font-mono">{user?.email}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
            {user?.role || 'Superadmin'}
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Current Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Current Password *
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              required
              placeholder="Enter current password (default: admin)"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Default preset credentials are "admin" or "admin123"
          </span>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            New Secure Password *
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              required
              placeholder="Minimum 5+ characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength Bar */}
          {newPassword && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Password Strength:</span>
                <span className={`font-bold ${strength.textColor}`}>{strength.text}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${strength.score}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Confirm New Password *
          </label>
          <input
            type="password"
            required
            placeholder="Re-type new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Update Password</span>
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ChangePasswordModal

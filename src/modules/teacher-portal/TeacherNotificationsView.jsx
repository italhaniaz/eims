import React, { useState } from 'react'
import {
  Bell,
  Inbox as InboxIcon,
  CheckCircle2,
  Calendar,
  BookMarked,
  Megaphone,
  CheckSquare,
  FileEdit,
  Wallet,
  ArrowLeft,
  X,
  Trash2,
  Check
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'

export default function TeacherNotificationsView({
  onBack,
  onNavigate,
  onOpenModal,
  teacherName = 'Teacher'
}) {
  const { toast } = useToast()

  // Notifications state (Defaults to 0 empty state as in screenshot)
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('teacher_portal_notifications')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch {}
    return []
  })

  // Clear all
  const handleClearAll = () => {
    setNotifications([])
    try {
      localStorage.setItem('teacher_portal_notifications', JSON.stringify([]))
    } catch {}
    toast?.success?.('All notifications cleared.')
  }

  // Mark single as read
  const handleDismiss = (id) => {
    const updated = notifications.filter((n) => n.id !== id)
    setNotifications(updated)
    try {
      localStorage.setItem('teacher_portal_notifications', JSON.stringify(updated))
    } catch {}
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70 dark:bg-slate-950">
      {/* ========================================================= */}
      {/* 1. SUB-HEADER BAR */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
            <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Notifications</span>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 flex items-center gap-1.5 transition-colors mt-0.5 cursor-pointer text-left w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Top Quick Links Bar */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onNavigate ? onNavigate('assignments') : onOpenModal && onOpenModal('assignments')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Assignments</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('announcements') : onOpenModal && onOpenModal('announcements')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Announcements</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('mark-attendance') : onOpenModal && onOpenModal('mark-attendance')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('marks-entry') : onOpenModal && onOpenModal('marks-entry')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Marks Entry</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('timetable') : onOpenModal && onOpenModal('timetable')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timetables & Exam Schedules</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('my-transactions') : onOpenModal && onOpenModal('salary')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>My Salary</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN SCROLL CONTAINER */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs min-h-[460px] flex flex-col justify-between">
          {/* Header Row matching screenshot 1 */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Notification Center
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 cursor-pointer"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('inbox')}
                className="px-3.5 py-1.5 rounded-xl border border-sky-400 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-xs font-bold transition-colors cursor-pointer"
              >
                Inbox
              </button>
            </div>
          </div>

          {/* Body Content matching screenshot 1 */}
          {notifications.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Bell className="w-7 h-7" />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                No notifications yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2 flex-1">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className="py-3 px-2 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.message}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {item.time}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDismiss(item.id)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

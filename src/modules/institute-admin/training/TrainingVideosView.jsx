import React, { useState, useMemo } from 'react'
import {
  PlayCircle,
  CheckCircle2,
  Search,
  Clock,
  BookOpen,
  ArrowRight,
  X
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'

const TRAINING_GUIDES = [
  {
    id: 'vid-admissions',
    module: 'Admissions & Students',
    title: 'How to Process Admission Inquiries & Enroll Students',
    duration: '04:30',
    route: 'inst-admissions',
    summary: 'Capture new guardian inquiries, review admission test results, and convert leads into enrolled students in one flow.',
    steps: [
      'Open Admissions from the left menu and click Add Lead / Inquiry.',
      'Enter student details, guardian phone, and desired class grade.',
      'Move inquiry status through Screening and Offer Letter.',
      'Click Convert to Student to automatically generate admission number and roll record.'
    ]
  },
  {
    id: 'vid-fees',
    module: 'Billing & Fees',
    title: 'Generating Monthly Fee Challans & Recording Payments',
    duration: '05:15',
    route: 'inst-fees',
    summary: 'Generate single or batch fee vouchers, apply scholarships or waivers, and collect partial/full payments with printable receipts.',
    steps: [
      'Navigate to Billing & Fees -> Fee Invoices & Challans.',
      'Generate monthly invoices for a class section or individual student.',
      'Record cash, bank deposit, or 1Link/online receipt against an invoice.',
      'Print official school challan or guardian payment receipt.'
    ]
  },
  {
    id: 'vid-attendance',
    module: 'Attendance',
    title: 'Daily Roll Call, Biometric Sync & Absentee Alerts',
    duration: '03:45',
    route: 'inst-attendance',
    summary: 'Mark daily Present/Absent/Late status per class section, export monthly attendance sheets, and notify parents immediately.',
    steps: [
      'Open Attendance from the sidebar and select class, section, and date.',
      'Mark exceptions quickly (default all present or bulk mark).',
      'Save daily register to lock records and track consecutive absences.'
    ]
  },
  {
    id: 'vid-exams',
    module: 'Exams & Results',
    title: 'Date Sheets, Subject Marks Entry & Result Cards',
    duration: '06:10',
    route: 'inst-exams',
    summary: 'Schedule term examinations, configure grading rules, enter subject-wise marks, and print consolidated student report cards.',
    steps: [
      'Create exam term under Exams & Results.',
      'Configure class subjects and total/passing marks.',
      'Enter student obtained marks and verify auto-calculated percentages & grades.',
      'Generate printable date sheets and official result cards.'
    ]
  },
  {
    id: 'vid-staff',
    module: 'Staff & Payroll',
    title: 'Teacher Roster, Salary Slips & Staff Attendance',
    duration: '04:50',
    route: 'inst-teachers',
    summary: 'Onboard teaching and non-teaching staff, assign classes/subjects, process monthly salary runs, and print payslips.',
    steps: [
      'Add teachers and administrative staff in Faculty & Staff Roster.',
      'Open Payroll & Compensation tab to review monthly base pay, allowances, and deductions.',
      'Generate payslips and export payroll ledger.'
    ]
  },
  {
    id: 'vid-accounts',
    module: 'Finance & Accounts',
    title: 'Tracking Campus Expenses, Cashbook & Monthly Closing',
    duration: '04:15',
    route: 'inst-accounts',
    summary: 'Log operational expenses, utility bills, and miscellaneous income to maintain an accurate campus financial ledger.',
    steps: [
      'Open Finance & Accounts -> Campus Accounts & Ledger.',
      'Record vouchers with category, payment method, and receipt reference.',
      'Review cash inflows vs outflows and export statements for audits.'
    ]
  }
]

const getProgressKey = (email) => `eims_training_completed_${email || 'default'}`

export const TrainingVideosView = ({ onRouteChange }) => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModule, setSelectedModule] = useState('All')
  const [activeGuide, setActiveGuide] = useState(null)

  const [completedIds, setCompletedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(getProgressKey(user?.email))
      return saved ? JSON.parse(saved) : []
    } catch (_) {
      return []
    }
  })

  const modules = useMemo(
    () => ['All', ...Array.from(new Set(TRAINING_GUIDES.map(g => g.module)))],
    []
  )

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return TRAINING_GUIDES.filter(g => {
      if (selectedModule !== 'All' && g.module !== selectedModule) return false
      if (!q) return true
      return (
        g.title.toLowerCase().includes(q) ||
        g.module.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q)
      )
    })
  }, [searchQuery, selectedModule])

  const toggleCompleted = (id) => {
    const next = completedIds.includes(id)
      ? completedIds.filter(item => item !== id)
      : [...completedIds, id]
    setCompletedIds(next)
    try {
      localStorage.setItem(getProgressKey(user?.email), JSON.stringify(next))
    } catch (_) {}
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] font-heading flex items-center gap-2.5">
            <PlayCircle className="w-6 h-6 text-emerald-600" />
            <span>Training Videos &amp; Staff Walkthroughs</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Step-by-step interactive operational guides to onboard school administrators, accountants, and teachers.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 self-start sm:self-auto">
          Completed: {completedIds.length} / {TRAINING_GUIDES.length} Modules
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {modules.map(mod => (
            <button
              key={mod}
              type="button"
              onClick={() => setSelectedModule(mod)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                selectedModule === mod
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-50 text-[var(--text-muted)] hover:bg-slate-100'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides..."
            className="pl-9 pr-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] w-full md:w-56"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(guide => {
          const isDone = completedIds.includes(guide.id)
          return (
            <div key={guide.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-soft flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    {guide.module}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {guide.duration}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--text)] mt-3">{guide.title}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">{guide.summary}</p>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveGuide(guide)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Open Walkthrough</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleCompleted(guide.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                    isDone ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isDone ? 'Completed' : 'Mark Done'}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Interactive Walkthrough Modal */}
      {activeGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  {activeGuide.module} • {activeGuide.duration}
                </span>
                <h2 className="text-lg font-bold text-[var(--text)] mt-1">{activeGuide.title}</h2>
              </div>
              <button type="button" onClick={() => setActiveGuide(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-muted)]">{activeGuide.summary}</p>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>Step-by-Step SOP</span>
              </div>
              <ol className="space-y-2 text-xs text-slate-700 list-decimal list-inside">
                {activeGuide.steps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">{step}</li>
                ))}
              </ol>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => toggleCompleted(activeGuide.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                  completedIds.includes(activeGuide.id)
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{completedIds.includes(activeGuide.id) ? 'Completed' : 'Mark Complete'}</span>
              </button>

              {onRouteChange && activeGuide.route && (
                <button
                  type="button"
                  onClick={() => {
                    const target = activeGuide.route
                    setActiveGuide(null)
                    onRouteChange(target)
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Go to Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrainingVideosView

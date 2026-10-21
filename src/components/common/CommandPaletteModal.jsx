import React, { useState, useEffect, useRef, useMemo } from 'react'
import { 
  Search, 
  Command, 
  Users, 
  GraduationCap, 
  Receipt, 
  CalendarCheck, 
  Award, 
  Megaphone, 
  Bus, 
  BookOpen, 
  ShieldCheck, 
  Settings, 
  DollarSign, 
  Layers, 
  ArrowRight, 
  CornerDownLeft, 
  X,
  Plus,
  Database,
  Building2,
  Clock,
  Sparkles,
  School,
  FileText
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'

export const CommandPaletteModal = ({ isOpen, onClose, onNavigate, onOpenSettings }) => {
  const { user } = useAuth()
  const { 
    students = [], 
    teachers = [], 
    institutes = [], 
    classes = [],
    fees = []
  } = useAppData()

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Navigation Items according to user role
  const navigationItems = useMemo(() => {
    if (user?.role === 'superadmin') {
      return [
        { 
          id: 'nav-dash', 
          title: 'Superadmin Executive Overview', 
          category: 'Navigation', 
          route: 'dashboard', 
          icon: Building2, 
          keywords: ['overview', 'executive', 'stats', 'analytics', 'dashboard', 'main'] 
        },
        { 
          id: 'nav-inst', 
          title: 'Institutes & Campus Directory', 
          category: 'Campuses', 
          route: 'institutes', 
          icon: School, 
          keywords: ['campuses', 'schools', 'colleges', 'branches', 'institutes', 'directory'] 
        },
        { 
          id: 'nav-users', 
          title: 'Users Directory & Accounts', 
          category: 'RBAC Security', 
          route: 'users-all', 
          icon: Users, 
          keywords: ['users', 'admins', 'logins', 'accounts', 'passwords', 'profiles'] 
        },
        { 
          id: 'nav-roles', 
          title: 'Role Permissions & Access Matrix', 
          category: 'RBAC Security', 
          route: 'users-roles', 
          icon: ShieldCheck, 
          keywords: ['roles', 'permissions', 'access control', 'superadmin', 'matrix', 'privileges'] 
        },
        { 
          id: 'nav-audit', 
          title: 'System Security & Audit Trail', 
          category: 'System', 
          route: 'audit-logs', 
          icon: ShieldCheck, 
          keywords: ['audit', 'logs', 'history', 'security', 'activity', 'monitoring'] 
        },
        { 
          id: 'nav-fin', 
          title: 'Enterprise Financial Analytics', 
          category: 'Finance', 
          route: 'finance', 
          icon: DollarSign, 
          keywords: ['finance', 'revenue', 'income', 'money', 'accounts', 'collection', 'paisa'] 
        },
        { 
          id: 'nav-trans', 
          title: 'Transport & Fleet Management', 
          category: 'Fleet', 
          route: 'transport', 
          icon: Bus, 
          keywords: ['transport', 'bus', 'van', 'fleet', 'routes', 'gaari', 'driver'] 
        },
        { 
          id: 'nav-lib', 
          title: 'Central Digital Library', 
          category: 'Academic', 
          route: 'library', 
          icon: BookOpen, 
          keywords: ['library', 'books', 'catalog', 'kitab', 'circulation', 'kutub khana'] 
        },
        { 
          id: 'nav-adm', 
          title: 'Admissions Pipeline & CRM', 
          category: 'Enrollment', 
          route: 'admissions-pipeline', 
          icon: GraduationCap, 
          keywords: ['admissions', 'crm', 'leads', 'inquiry', 'dakhla', 'prospects'] 
        },
        { 
          id: 'nav-comm', 
          title: 'SMS & WhatsApp Gateway', 
          category: 'Communication', 
          route: 'communication', 
          icon: Megaphone, 
          keywords: ['sms', 'whatsapp', 'broadcast', 'messages', 'gateway', 'alerts', 'paigham'] 
        },
        { 
          id: 'nav-dept', 
          title: 'Academic Departments', 
          category: 'Academics', 
          route: 'departments', 
          icon: Layers, 
          keywords: ['departments', 'faculties', 'divisions', 'branches'] 
        },
        { 
          id: 'nav-exam-bodies', 
          title: 'Examination Bodies & Boards', 
          category: 'Academics', 
          route: 'examination-bodies', 
          icon: Award, 
          keywords: ['bise', 'fbise', 'boards', 'cambridge', 'exam bodies', 'affiliation'] 
        },
        { 
          id: 'nav-acad-years', 
          title: 'Academic Years & Sessions', 
          category: 'Academics', 
          route: 'academic-years', 
          icon: Clock, 
          keywords: ['sessions', 'academic year', 'terms', 'session', 'salana'] 
        },
        { 
          id: 'nav-prog-types', 
          title: 'Program Types & Curriculums', 
          category: 'Academics', 
          route: 'program-types', 
          icon: BookOpen, 
          keywords: ['curriculum', 'program types', 'k-12', 'higher education', 'matric', 'inter'] 
        },
        { 
          id: 'nav-subjects', 
          title: 'Subjects & Course Catalog', 
          category: 'Academics', 
          route: 'subjects', 
          icon: BookOpen, 
          keywords: ['subjects', 'courses', 'syllabus', 'mazameen'] 
        }
      ]
    } else {
      return [
        { 
          id: 'nav-inst-dash', 
          title: 'Campus Executive Dashboard', 
          category: 'Dashboard', 
          route: 'inst-dashboard', 
          icon: Building2, 
          keywords: ['dashboard', 'home', 'overview', 'main', 'campus'] 
        },
        { 
          id: 'nav-std', 
          title: 'Students Directory & Admissions', 
          category: 'Students', 
          route: 'inst-students', 
          icon: GraduationCap, 
          keywords: ['students', 'talib ilm', 'shagird', 'dakhla', 'admissions', 'roll number', 'id card', 'roster'] 
        },
        { 
          id: 'nav-tch', 
          title: 'Teachers & Faculty Directory', 
          category: 'Faculty', 
          route: 'inst-teachers', 
          icon: Users, 
          keywords: ['teachers', 'ustad', 'faculty', 'staff', 'payroll', 'salary', 'tankhwah', 'professors'] 
        },
        { 
          id: 'nav-cls', 
          title: 'Classes & Custom Multi-Sections', 
          category: 'Academics', 
          route: 'inst-classes', 
          icon: Layers, 
          keywords: ['classes', 'jammat', 'sections', 'super section', 'grades', 'promotion', 'class room'] 
        },
        { 
          id: 'nav-fee', 
          title: 'Fee Challans & POS Cashier Counter', 
          category: 'Finance', 
          route: 'inst-fees', 
          icon: Receipt, 
          keywords: ['fees', 'challan', 'voucher', 'pos', 'cashier', 'fess', 'dues', 'payments', 'kist', 'wasool'] 
        },
        { 
          id: 'nav-att', 
          title: 'Daily Attendance Sentinel', 
          category: 'Attendance', 
          route: 'inst-attendance', 
          icon: CalendarCheck, 
          keywords: ['attendance', 'hazri', 'rollcall', 'present', 'absent', 'leave', 'chutti'] 
        },
        { 
          id: 'nav-tmt', 
          title: 'Weekly Timetable & Period Schedule', 
          category: 'Academics', 
          route: 'inst-timetable', 
          icon: Clock, 
          keywords: ['timetable', 'schedule', 'period', 'routine', 'bell', 'ghanti', 'clash'] 
        },
        { 
          id: 'nav-exm', 
          title: 'Exams, Date Sheets & Marks Entry', 
          category: 'Examinations', 
          route: 'inst-exams', 
          icon: Award, 
          keywords: ['exams', 'imtihan', 'paper', 'datesheet', 'result', 'admit card', 'marks', 'parcha'] 
        },
        { 
          id: 'nav-not', 
          title: 'Campus Digital Notice Board', 
          category: 'Communication', 
          route: 'inst-notices', 
          icon: Megaphone, 
          keywords: ['notices', 'circular', 'announcement', 'ittila', 'broadcast', 'elan', 'paigham'] 
        },
        { 
          id: 'nav-lvl', 
          title: 'Academic Program Levels (K-12 / College)', 
          category: 'Academics', 
          route: 'inst-program-levels', 
          icon: Layers, 
          keywords: ['program levels', 'matric', 'inter', 'fsc', 'levels', 'elementary', 'secondary', 'college'] 
        },
        { 
          id: 'nav-adm2', 
          title: 'Admissions Pipeline & CRM', 
          category: 'Admissions', 
          route: 'inst-admissions', 
          icon: GraduationCap, 
          keywords: ['admissions', 'leads', 'inquiry', 'crm', 'prospects', 'dakhla'] 
        },
        { 
          id: 'nav-trans2', 
          title: 'Transport Routes & Digital Passes', 
          category: 'Services', 
          route: 'inst-transport', 
          icon: Bus, 
          keywords: ['transport', 'bus', 'van', 'gaari', 'routes', 'driver', 'passes'] 
        },
        { 
          id: 'nav-lib2', 
          title: 'Digital Library & Book Circulation', 
          category: 'Services', 
          route: 'inst-library', 
          icon: BookOpen, 
          keywords: ['library', 'books', 'kitab', 'circulation', 'borrow', 'kutub khana'] 
        }
      ]
    }
  }, [user?.role])

  // Quick Action Items
  const actionItems = useMemo(() => {
    return [
      { 
        id: 'act-settings', 
        title: 'Open System Database & Backup Settings', 
        subtitle: 'Manage Supabase connection, schema tables & offline sync', 
        category: 'System', 
        action: onOpenSettings, 
        icon: Database, 
        keywords: ['settings', 'database', 'supabase', 'backup', 'export', 'sync'] 
      },
      { 
        id: 'act-std', 
        title: 'Enroll New Student in Portal', 
        subtitle: 'Direct admission registration with roll number and dossier', 
        category: 'Quick Action', 
        route: 'inst-students', 
        icon: Plus, 
        keywords: ['new student', 'enroll', 'admission', 'dakhla', 'add student'] 
      },
      { 
        id: 'act-fee', 
        title: 'Issue Fee Challan / POS Voucher', 
        subtitle: 'Print bank challan slip or record counter cash payment', 
        category: 'Quick Action', 
        route: 'inst-fees', 
        icon: Receipt, 
        keywords: ['fee challan', 'collect fee', 'issue voucher', 'pos', 'challan', 'fess'] 
      },
      { 
        id: 'act-att', 
        title: 'Mark Morning Attendance Roll-Call', 
        subtitle: 'One-click all present / absent batch attendance', 
        category: 'Quick Action', 
        route: 'inst-attendance', 
        icon: CalendarCheck, 
        keywords: ['attendance', 'hazri', 'rollcall', 'mark attendance', 'daily hazri'] 
      },
      { 
        id: 'act-cls', 
        title: 'Add New Class or Custom Section', 
        subtitle: 'Create classes with custom sections (Super Section, Section A/B/C)', 
        category: 'Quick Action', 
        route: 'inst-classes', 
        icon: Layers, 
        keywords: ['add class', 'create section', 'new class', 'jammat', 'super section'] 
      },
      { 
        id: 'act-notice', 
        title: 'Broadcast New Campus Notice', 
        subtitle: 'Send instant notification to teachers, parents, and students', 
        category: 'Quick Action', 
        route: 'inst-notices', 
        icon: Megaphone, 
        keywords: ['notice', 'circular', 'broadcast', 'alert', 'ittila', 'announcement'] 
      }
    ]
  }, [onOpenSettings])

  // Filtered & Indexed Results
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    
    // Default View: Top navigation & quick actions
    if (!q) {
      return [...navigationItems.slice(0, 6), ...actionItems.slice(0, 3)]
    }

    const matchesQuery = (item) => {
      if (item.title?.toLowerCase().includes(q)) return true
      if (item.category?.toLowerCase().includes(q)) return true
      if (item.subtitle && item.subtitle.toLowerCase().includes(q)) return true
      if (item.keywords && item.keywords.some(k => k.toLowerCase().includes(q))) return true
      return false
    }

    // 1. Navigation items
    const matchedNav = navigationItems.filter(matchesQuery)

    // 2. Action items
    const matchedActions = actionItems.filter(matchesQuery)

    // 3. Classes and Custom Sections matching
    const matchedClasses = classes
      .filter(c => {
        const nameMatch = (c.name || '').toLowerCase().includes(q)
        const codeMatch = (c.code || '').toLowerCase().includes(q)
        const levelMatch = (c.level || c.programLevel || '').toLowerCase().includes(q)
        const sectionsMatch = (c.sections || []).some(s => {
          const sName = typeof s === 'string' ? s : (s.name || '')
          return sName.toLowerCase().includes(q)
        })
        const urduMatch = ['jammat', 'class', 'section', 'sabaq'].some(k => k.includes(q))
        return nameMatch || codeMatch || levelMatch || sectionsMatch || (urduMatch && q.length >= 3)
      })
      .slice(0, 4)
      .map(c => {
        const secList = (c.sections || []).map(s => typeof s === 'string' ? s : (s.name || '')).filter(Boolean)
        const secText = secList.length > 0 ? `Sections: ${secList.join(', ')}` : 'Single Section'
        return {
          id: `cls-${c.id}`,
          title: `${c.name} (${c.code || 'Academic'})`,
          subtitle: `${secText} • Capacity: ${c.capacity || 40} Seats • Room: ${c.roomNumber || 'A-1'}`,
          category: 'Classes & Sections',
          route: 'inst-classes',
          icon: Layers,
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }
      })

    // 4. Students Directory matching
    const matchedStudents = students
      .filter(s => 
        (s.name || '').toLowerCase().includes(q) || 
        (s.rollNumber || '').toLowerCase().includes(q) ||
        (s.className || '').toLowerCase().includes(q) ||
        (s.section || '').toLowerCase().includes(q) ||
        (s.fatherName || '').toLowerCase().includes(q) ||
        (s.phone || '').toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map(s => ({
        id: `std-${s.id}`,
        title: `${s.name} (${s.rollNumber || 'STD'})`,
        subtitle: `${s.className || 'General'} • Sec ${s.section || 'A'} • Father: ${s.fatherName || 'Parent'} • Fee: ${s.feeStatus || 'Active'}`,
        category: 'Students',
        route: 'inst-students',
        icon: GraduationCap,
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
      }))

    // 5. Teachers & Staff Directory matching
    const matchedTeachers = teachers
      .filter(t => 
        (t.name || '').toLowerCase().includes(q) || 
        (t.empId || '').toLowerCase().includes(q) ||
        (t.designation || '').toLowerCase().includes(q) ||
        (t.department || '').toLowerCase().includes(q) ||
        (t.subject || '').toLowerCase().includes(q) ||
        (t.phone || '').toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map(t => ({
        id: `tch-${t.id}`,
        title: `${t.name} (${t.designation || 'Teacher'})`,
        subtitle: `${t.department || 'Academic'} • ${t.subject || 'All Subjects'} • ${t.phone || 'Staff'}`,
        category: 'Faculty',
        route: 'inst-teachers',
        icon: Users,
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
      }))

    // 6. Institutes matching (Superadmin only)
    const matchedInstitutes = (user?.role === 'superadmin' ? institutes : [])
      .filter(i => 
        (i.name || '').toLowerCase().includes(q) || 
        (i.code || '').toLowerCase().includes(q) || 
        (i.city || '').toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map(i => ({
        id: `inst-${i.id}`,
        title: `${i.name} (${i.code || 'Campus'})`,
        subtitle: `${i.city || 'Central District'} • ${i.type || 'Institute'}`,
        category: 'Campuses',
        route: 'institutes',
        icon: School,
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
      }))

    return [
      ...matchedNav, 
      ...matchedActions, 
      ...matchedClasses, 
      ...matchedStudents, 
      ...matchedTeachers,
      ...matchedInstitutes
    ]
  }, [query, navigationItems, actionItems, classes, students, teachers, institutes, user?.role])

  const handleSelect = (item) => {
    if (item.action) {
      item.action()
    } else if (item.route && onNavigate) {
      onNavigate(item.route)
    }
    onClose()
  }

  // Keyboard navigation listener
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredResults.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredResults[selectedIndex]) {
        handleSelect(filteredResults[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  // Auto-scroll selected item into view in list
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 px-3 sm:px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[82vh] sm:max-h-[75vh] animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center gap-3 bg-white sticky top-0 z-10">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Search classes, students, teachers, fees, or modules (e.g. 9th, Hazri, Challan)..."
            className="w-full text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setSelectedIndex(0)
                inputRef.current?.focus()
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Clear Search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 shrink-0">
            ESC
          </span>
          <button 
            onClick={onClose}
            className="sm:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 sm:p-2.5 divide-y divide-slate-50/80 overscroll-contain"
        >
          {filteredResults.length > 0 ? (
            filteredResults.map((item, index) => {
              const Icon = item.icon || Layers
              const isSelected = index === selectedIndex

              return (
                <div
                  key={item.id}
                  data-index={index}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-2.5 sm:p-3 rounded-xl cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected 
                      ? 'bg-indigo-50 text-indigo-950 shadow-2xs' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-colors ${
                      isSelected 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold truncate flex items-center gap-2">
                        <span className="truncate">{item.title}</span>
                        {item.category && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md border shrink-0 hidden sm:inline-block ${
                            item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {item.category}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <span className="text-[10px] font-mono text-indigo-600 hidden sm:flex items-center gap-0.5">
                        <CornerDownLeft className="w-3 h-3" /> Select
                      </span>
                    )}
                    <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300'}`} />
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-12 px-4 text-center text-slate-400">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No Matching Results</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try searching by student name, roll number, class ("9th Grade", "Super Section"), or module ("Fees", "Attendance", "Exams").
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="hidden sm:flex items-center gap-3">
            <span><kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold">↑↓</kbd> Navigate</span>
            <span><kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold">↵</kbd> Select</span>
            <span><kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold">ESC</kbd> Close</span>
          </div>
          <div className="sm:hidden text-[10px] text-slate-400">
            Tap any result to jump directly
          </div>
          <div className="flex items-center gap-1.5 text-indigo-600 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-sans font-medium text-xs">Spotlight Omni-Search</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommandPaletteModal

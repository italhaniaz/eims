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
  Key,
  Database,
  Building2,
  Clock
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'

export const CommandPaletteModal = ({ isOpen, onClose, onNavigate, onOpenSettings }) => {
  const { user } = useAuth()
  const { students = [], teachers = [], institutes = [] } = useAppData()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

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
        { id: 'nav-dash', title: 'Superadmin Executive Overview', category: 'Navigation', route: 'dashboard', icon: Building2 },
        { id: 'nav-inst', title: 'Institutes & Campus Directory', category: 'Navigation', route: 'institutes', icon: Building2 },
        { id: 'nav-users', title: 'Users Directory & RBAC Matrix', category: 'Navigation', route: 'users-all', icon: Users },
        { id: 'nav-audit', title: 'System Security & Audit Trail', category: 'Navigation', route: 'audit-logs', icon: ShieldCheck },
        { id: 'nav-fin', title: 'Enterprise Financial Analytics', category: 'Navigation', route: 'finance', icon: DollarSign },
        { id: 'nav-trans', title: 'Transport & Fleet Management', category: 'Navigation', route: 'transport', icon: Bus },
        { id: 'nav-lib', title: 'Central Digital Library', category: 'Navigation', route: 'library', icon: BookOpen },
        { id: 'nav-adm', title: 'Admissions Pipeline & CRM', category: 'Navigation', route: 'admissions-pipeline', icon: GraduationCap },
        { id: 'nav-comm', title: 'SMS & WhatsApp Gateway', category: 'Navigation', route: 'communication', icon: Megaphone },
        { id: 'nav-dept', title: 'Academic Departments', category: 'Navigation', route: 'departments', icon: Layers },
      ]
    } else {
      return [
        { id: 'nav-inst-dash', title: 'Institute Campus Dashboard', category: 'Navigation', route: 'inst-dashboard', icon: Building2 },
        { id: 'nav-std', title: 'Students Directory & ID Cards', category: 'Navigation', route: 'students', icon: GraduationCap },
        { id: 'nav-tch', title: 'Teachers & Faculty Payroll', category: 'Navigation', route: 'teachers', icon: Users },
        { id: 'nav-fee', title: 'Fee Challans & POS Cashier', category: 'Navigation', route: 'fees', icon: Receipt },
        { id: 'nav-att', title: 'Daily Attendance Sentinel', category: 'Navigation', route: 'attendance', icon: CalendarCheck },
        { id: 'nav-exm', title: 'Exams, Date Sheets & Admit Slips', category: 'Navigation', route: 'exams', icon: Award },
        { id: 'nav-not', title: 'Campus Digital Notice Board', category: 'Navigation', route: 'notices', icon: Megaphone },
        { id: 'nav-cls', title: 'Classes & Student Promotion Engine', category: 'Navigation', route: 'classes', icon: Layers },
        { id: 'nav-tmt', title: 'Weekly Timetable & Clash Engine', category: 'Navigation', route: 'timetable', icon: Clock },
        { id: 'nav-trans2', title: 'Transport Routes & Digital Passes', category: 'Navigation', route: 'transport', icon: Bus },
        { id: 'nav-lib2', title: 'Library Catalog & Book Circulation', category: 'Navigation', route: 'library', icon: BookOpen },
        { id: 'nav-adm2', title: 'Admissions Pipeline & CRM', category: 'Navigation', route: 'admissions-pipeline', icon: GraduationCap },
      ]
    }
  }, [user?.role])

  // Quick Action Items
  const actionItems = useMemo(() => {
    return [
      { id: 'act-settings', title: 'Open System Database & Backup Settings', category: 'Quick Action', action: onOpenSettings, icon: Database },
      { id: 'act-std', title: 'Enroll New Student in Portal', category: 'Quick Action', route: 'students', icon: Plus },
      { id: 'act-fee', title: 'Issue Fee Challan / POS Counter', category: 'Quick Action', route: 'fees', icon: Receipt },
      { id: 'act-notice', title: 'Broadcast New Campus Notice / Circular', category: 'Quick Action', route: 'notices', icon: Megaphone },
      { id: 'act-att', title: 'Mark Morning Attendance Roll-Call', category: 'Quick Action', route: 'attendance', icon: CalendarCheck },
    ]
  }, [onOpenSettings])

  // Filtered Results
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return [...navigationItems.slice(0, 6), ...actionItems.slice(0, 3)]
    }

    const matchedNav = navigationItems.filter(item => 
      item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    )

    const matchedActions = actionItems.filter(item =>
      item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    )

    const matchedStudents = students
      .filter(s => (s.name || '').toLowerCase().includes(q) || (s.rollNumber || '').toLowerCase().includes(q))
      .slice(0, 5)
      .map(s => ({
        id: `std-${s.id}`,
        title: `${s.name} (${s.rollNumber || 'STD'})`,
        subtitle: `${s.className || '10th Grade'} • Status: ${s.feeStatus || 'Active'}`,
        category: 'Students Directory',
        route: 'students',
        icon: GraduationCap
      }))

    const matchedTeachers = teachers
      .filter(t => (t.name || '').toLowerCase().includes(q) || (t.empId || '').toLowerCase().includes(q))
      .slice(0, 3)
      .map(t => ({
        id: `tch-${t.id}`,
        title: `${t.name} (${t.designation || 'Teacher'})`,
        subtitle: `${t.department || 'Academic'} • ${t.phone || ''}`,
        category: 'Faculty & Staff',
        route: 'teachers',
        icon: Users
      }))

    return [...matchedNav, ...matchedActions, ...matchedStudents, ...matchedTeachers]
  }, [query, navigationItems, actionItems, students, teachers])

  const handleSelect = (item) => {
    if (item.action) {
      item.action()
    } else if (item.route && onNavigate) {
      onNavigate(item.route)
    }
    onClose()
  }

  // Keyboard navigation
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Box */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Type a module, student name, or action (e.g. Fees, Hamza)..."
            className="w-full text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-500 rounded border">
            ESC to close
          </span>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-50">
          {filteredResults.length > 0 ? (
            filteredResults.map((item, index) => {
              const Icon = item.icon || Layers
              const isSelected = index === selectedIndex

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-indigo-50/80 text-indigo-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider hidden sm:inline">
                          • {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-400 truncate">{item.subtitle}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <span className="text-[10px] font-mono text-indigo-600 flex items-center gap-0.5">
                        <CornerDownLeft className="w-3 h-3" /> Select
                      </span>
                    )}
                    <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300'}`} />
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No Matching Results</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for "Students", "Fees", "Exams", or an exact name.</p>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-indigo-600 font-semibold">Spotlight Omni-Search</span>
        </div>
      </div>
    </div>
  )
}

export default CommandPaletteModal
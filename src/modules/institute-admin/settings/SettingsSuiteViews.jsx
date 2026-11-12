import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Building2,
  Calendar,
  Globe,
  Image as ImageIcon,
  Save,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Users,
  UserCheck,
  Printer,
  Info,
  History,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { downloadSimplePdf } from '../../../utils/pdfExport'

const SESSIONS = ['2024-2025', '2025-2026', '2026-2027', '2027-2028']
const COUNTRIES = [
  { name: 'Pakistan', currency: 'Pakistani Rupee (PKR)', timezone: 'Asia/Karachi' },
  { name: 'United Arab Emirates', currency: 'UAE Dirham (AED)', timezone: 'Asia/Dubai' },
  { name: 'Saudi Arabia', currency: 'Saudi Riyal (SAR)', timezone: 'Asia/Riyadh' },
  { name: 'United Kingdom', currency: 'British Pound (GBP)', timezone: 'Europe/London' },
  { name: 'United States', currency: 'US Dollar (USD)', timezone: 'America/New_York' }
]
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DEFAULT_POLICIES = [
  {
    id: 'teacher',
    title: 'Teacher Guidelines',
    description: 'Guidelines for teachers including punctuality, leave policy, and responsibilities.',
    active: true,
    accent: 'sky',
    content:
      '1. Teachers must arrive at least 15 minutes before the morning assembly.\n2. Daily lesson plans and attendance registers must be updated before 10:00 AM.\n3. Leave requests must be submitted at least 24 hours in advance except in emergencies.\n4. Maintain respectful communication with students, parents, and colleagues at all times.'
  },
  {
    id: 'student',
    title: 'Student Guidelines',
    description: 'Guidelines for students including discipline, attendance, and behavior.',
    active: true,
    accent: 'cyan',
    content:
      '1. Minimum 80% attendance is required to appear in final term examinations.\n2. Students must wear neat and complete institute uniform on all working days.\n3. Mobile phones and unauthorized electronic gadgets are prohibited during class hours.\n4. Respect campus property, library books, and laboratory equipment.'
  },
  {
    id: 'parent',
    title: 'Parent Guidelines',
    description: 'Guidelines for parents including fee payment, meetings, and communication.',
    active: true,
    accent: 'emerald',
    content:
      '1. Monthly tuition fees must be cleared by the 10th of each month.\n2. Parents are requested to attend scheduled Parent-Teacher Meetings (PTMs).\n3. Please notify the administration office promptly regarding any change in contact number or address.\n4. Official communication is sent via institute notices, SMS, and WhatsApp.'
  }
]

const QuickHeader = ({ title, onBack, onRouteChange, onOpenQuickPayment, onOpenSendSms }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
    <div>
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-slate-600" />
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-admissions-enroll')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span>New Enrollment</span>
      </button>
      <button
        type="button"
        onClick={() => onOpenQuickPayment?.()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <CreditCard className="w-3.5 h-3.5" />
        <span>Add Payment</span>
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-fees')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <Receipt className="w-3.5 h-3.5" />
        <span>Generate Invoice</span>
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-accounts-expenses')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <ArrowDownCircle className="w-3.5 h-3.5" />
        <span>Manage Expense</span>
      </button>
      <button
        type="button"
        onClick={() => (onOpenSendSms ? onOpenSendSms() : onRouteChange?.('inst-communication-sms'))}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>Send SMS</span>
      </button>
    </div>
  </div>
)

export const SettingsSuiteViews = ({
  mode = 'profile', // 'profile' | 'locations' | 'policies' | 'activity'
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment,
  onOpenSendSms
}) => {
  const { auditLogs = [] } = useAppData()
  const { toast } = useToast()
  const instId = currentInstitute?.id || 'inst-1'
  const instName = currentInstitute?.name || 'EduDigize Demo'

  const profileKey = `sms_campus_profile_settings_${instId}`
  const locationsKey = `sms_campus_location_settings_${instId}`
  const policiesKey = `sms_campus_policies_settings_${instId}`
  const activityKey = `sms_campus_activity_logs_${instId}`

  // ==========================
  // PROFILE STATE (Picks 1-2)
  // ==========================
  const [profile, setProfile] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(profileKey) || 'null')
      if (saved) return saved
    } catch {}
    return {
      name: instName,
      motto: '',
      acronym: instName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 3)
        .toUpperCase(),
      session: '2025-2026',
      phone: currentInstitute?.phone || '03077238407',
      email: currentInstitute?.email || 'mirza@edudigitize.io',
      address: currentInstitute?.address || '',
      thisTermEnds: '2026-01-01',
      nextTermBegins: '2026-07-01',
      logoDataUrl: '',
      country: 'Pakistan',
      currency: 'Pakistani Rupee (PKR)',
      timezone: 'Asia/Karachi',
      academicStartMonth: 'April'
    }
  })

  // ==========================
  // LOCATIONS STATE (Pick 3)
  // ==========================
  const [locations, setLocations] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(locationsKey) || 'null')
      if (saved) return saved
    } catch {}
    return {
      nationalities: [{ id: 'nat-1', name: 'Pakistani' }],
      states: [
        { id: 'st-1', name: 'Punjab', nationality: 'Pakistani' },
        { id: 'st-2', name: 'Sindh', nationality: 'Pakistani' },
        { id: 'st-3', name: 'Khyber Pakhtunkhwa', nationality: 'Pakistani' },
        { id: 'st-4', name: 'Balochistan', nationality: 'Pakistani' },
        { id: 'st-5', name: 'Islamabad Capital Territory', nationality: 'Pakistani' },
        { id: 'st-6', name: 'Gilgit-Baltistan', nationality: 'Pakistani' },
        { id: 'st-7', name: 'Azad Kashmir', nationality: 'Pakistani' }
      ],
      cities: [
        { id: 'ct-1', name: 'Lahore', state: 'Punjab' },
        { id: 'ct-2', name: 'Karachi', state: 'Sindh' },
        { id: 'ct-3', name: 'Islamabad', state: 'Islamabad Capital Territory' },
        { id: 'ct-4', name: 'Rawalpindi', state: 'Punjab' },
        { id: 'ct-5', name: 'Faisalabad', state: 'Punjab' },
        { id: 'ct-6', name: 'Multan', state: 'Punjab' }
      ]
    }
  })
  const [locTab, setLocTab] = useState('nationalities') // 'nationalities' | 'states' | 'cities'
  const [locInput, setLocInput] = useState('')
  const [locParent, setLocParent] = useState('')
  const [selectedLocIds, setSelectedLocIds] = useState([])
  const [editingLocId, setEditingLocId] = useState(null)
  const [editingLocName, setEditingLocName] = useState('')

  // ==========================
  // POLICIES STATE (Pick 4)
  // ==========================
  const [policies, setPolicies] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(policiesKey) || 'null')
      if (Array.isArray(saved) && saved.length > 0) return saved
    } catch {}
    return DEFAULT_POLICIES
  })
  const [editingPolicy, setEditingPolicy] = useState(null)

  // ==========================
  // ACTIVITY LOG STATE (Picks 5-7)
  // ==========================
  const [localActivities, setLocalActivities] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(activityKey) || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })
  const [actFilters, setActFilters] = useState({
    type: 'all',
    event: 'all',
    from: '',
    to: '',
    search: ''
  })
  const [appliedActFilters, setAppliedActFilters] = useState({
    type: 'all',
    event: 'all',
    from: '',
    to: '',
    search: ''
  })
  const [actPage, setActPage] = useState(1)
  const ACT_PAGE_SIZE = 20

  const appendActivity = (eventTitle, category, description, badge = '') => {
    const entry = {
      id: `ACT-${Date.now()}`,
      at: new Date().toISOString(),
      event: eventTitle,
      type: category,
      description,
      badge,
      actor: 'Admin'
    }
    const next = [entry, ...localActivities].slice(0, 250)
    setLocalActivities(next)
    try {
      localStorage.setItem(activityKey, JSON.stringify(next))
    } catch {}
  }

  useEffect(() => {
    try {
      const l = JSON.parse(localStorage.getItem(locationsKey) || 'null')
      if (l) setLocations(l)
    } catch {}
    try {
      const p = JSON.parse(localStorage.getItem(policiesKey) || 'null')
      if (Array.isArray(p) && p.length > 0) setPolicies(p)
    } catch {}
    try {
      const a = JSON.parse(localStorage.getItem(activityKey) || '[]')
      setLocalActivities(Array.isArray(a) ? a : [])
    } catch {}
  }, [instId, locationsKey, policiesKey, activityKey])

  // ==========================
  // RENDER: LOCATIONS (Pick 3)
  // ==========================
  if (mode === 'locations') {
    const currentList =
      locTab === 'nationalities'
        ? locations.nationalities
        : locTab === 'states'
          ? locations.states
          : locations.cities

    const saveLocations = (next) => {
      setLocations(next)
      try {
        localStorage.setItem(locationsKey, JSON.stringify(next))
      } catch {}
    }

    const handleAddLocation = (e) => {
      e.preventDefault()
      const clean = locInput.trim()
      if (!clean) {
        toast.error('Name is required.')
        return
      }
      if (locTab === 'nationalities') {
        saveLocations({
          ...locations,
          nationalities: [...locations.nationalities, { id: `nat-${Date.now()}`, name: clean }]
        })
        appendActivity('Location Nationality Added', 'Settings', `Nationality added: ${clean}`)
      } else if (locTab === 'states') {
        saveLocations({
          ...locations,
          states: [
            ...locations.states,
            {
              id: `st-${Date.now()}`,
              name: clean,
              nationality: locParent || locations.nationalities[0]?.name || 'Pakistani'
            }
          ]
        })
        appendActivity('Location State Added', 'Settings', `State added: ${clean}`)
      } else {
        saveLocations({
          ...locations,
          cities: [
            ...locations.cities,
            {
              id: `ct-${Date.now()}`,
              name: clean,
              state: locParent || locations.states[0]?.name || ''
            }
          ]
        })
        appendActivity('Location City Added', 'Settings', `City added: ${clean}`)
      }
      setLocInput('')
      toast.success(`Added "${clean}".`)
    }

    const handleDeleteSelected = () => {
      if (selectedLocIds.length === 0) return
      saveLocations({
        ...locations,
        [locTab]: currentList.filter((item) => !selectedLocIds.includes(item.id))
      })
      setSelectedLocIds([])
      toast.success('Deleted selected entries.')
    }

    return (
      <div className="space-y-4">
        <QuickHeader
          title="Location Settings"
          onBack={() => onRouteChange?.('inst-settings')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
          onOpenSendSms={onOpenSendSms}
        />

        {/* Banner Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <MapPin className="w-4 h-4 text-slate-600" />
            <span>Location settings</span>
          </div>
          <p className="text-xs text-slate-500">
            Manage nationalities, states, and cities used on student and staff registration forms.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
              {locations.nationalities.length} nationalities
            </span>
            <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] font-semibold">
              {locations.states.length} states
            </span>
            <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[11px] font-semibold">
              {locations.cities.length} cities
            </span>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: 'nationalities', label: 'Nationalities' },
            { id: 'states', label: 'States' },
            { id: 'cities', label: 'Cities' }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setLocTab(t.id)
                setSelectedLocIds([])
                setEditingLocId(null)
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                locTab === t.id
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Split Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <form
            onSubmit={handleAddLocation}
            className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 h-fit text-xs"
          >
            <div className="text-[11px] font-bold uppercase text-slate-600 tracking-wide">
              + ADD{' '}
              {locTab === 'nationalities'
                ? 'NATIONALITY'
                : locTab === 'states'
                  ? 'STATE'
                  : 'CITY'}
            </div>

            {locTab === 'states' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nationality</label>
                <select
                  value={locParent}
                  onChange={(e) => setLocParent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {locations.nationalities.map((n) => (
                    <option key={n.id} value={n.name}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {locTab === 'cities' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">State / Province</label>
                <select
                  value={locParent}
                  onChange={(e) => setLocParent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {locations.states.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={locInput}
                onChange={(e) => setLocInput(e.target.value)}
                placeholder={
                  locTab === 'nationalities'
                    ? 'e.g. Pakistani'
                    : locTab === 'states'
                      ? 'e.g. Punjab'
                      : 'e.g. Lahore'
                }
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                Add{' '}
                {locTab === 'nationalities'
                  ? 'nationality'
                  : locTab === 'states'
                    ? 'state'
                    : 'city'}
              </span>
            </button>
          </form>

          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-slate-800">All {locTab}</span>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      currentList.length > 0 && selectedLocIds.length === currentList.length
                    }
                    onChange={(e) =>
                      setSelectedLocIds(
                        e.target.checked ? currentList.map((i) => i.id) : []
                      )
                    }
                  />
                  <span>Select all</span>
                </label>
                <button
                  type="button"
                  disabled={selectedLocIds.length === 0}
                  onClick={handleDeleteSelected}
                  className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-40 font-semibold cursor-pointer"
                >
                  Delete selected ({selectedLocIds.length})
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {currentList.map((item) => (
                <div
                  key={item.id}
                  className="px-5 py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/70"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedLocIds.includes(item.id)}
                      onChange={(e) =>
                        setSelectedLocIds((prev) =>
                          e.target.checked
                            ? [...prev, item.id]
                            : prev.filter((id) => id !== item.id)
                        )
                      }
                    />
                    {editingLocId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingLocName}
                          onChange={(e) => setEditingLocName(e.target.value)}
                          className="px-2.5 py-1 rounded border border-slate-300 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingLocName.trim()) return
                            saveLocations({
                              ...locations,
                              [locTab]: currentList.map((x) =>
                                x.id === item.id ? { ...x, name: editingLocName.trim() } : x
                              )
                            })
                            setEditingLocId(null)
                            toast.success('Updated location.')
                          }}
                          className="px-2.5 py-1 rounded bg-sky-600 text-white font-semibold cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold text-slate-900">{item.name}</span>
                        {(item.nationality || item.state) && (
                          <span className="ml-2 text-[11px] text-slate-400">
                            ({item.state || item.nationality})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLocId(item.id)
                        setEditingLocName(item.name)
                      }}
                      className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        saveLocations({
                          ...locations,
                          [locTab]: currentList.filter((x) => x.id !== item.id)
                        })
                        toast.success(`Deleted "${item.name}".`)
                      }}
                      className="p-1.5 rounded border border-slate-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==========================
  // RENDER: POLICIES & GUIDELINES (Pick 4)
  // ==========================
  if (mode === 'policies') {
    const savePolicies = (next) => {
      setPolicies(next)
      try {
        localStorage.setItem(policiesKey, JSON.stringify(next))
      } catch {}
    }

    const handleDownloadPolicyPdf = (pol) => {
      downloadSimplePdf({
        title: `${instName} — ${pol.title}`,
        subtitle: `Status: ${pol.active ? 'Active' : 'Inactive'}`,
        columns: ['Policy Document'],
        rows: pol.content.split('\n').map((line) => [line]),
        filename: `${pol.id}-guidelines.pdf`
      })
      toast.success(`Exported ${pol.title} PDF.`)
    }

    return (
      <div className="space-y-4">
        <QuickHeader
          title="Policies & Guidelines"
          onBack={() => onRouteChange?.('inst-settings')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
          onOpenSendSms={onOpenSendSms}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3 bg-sky-500 text-white flex items-center gap-2 text-sm font-semibold">
            <FileText className="w-4 h-4" />
            <span>Institute Policies &amp; Guidelines</span>
          </div>

          <div className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {policies.map((pol) => {
                const Icon =
                  pol.id === 'teacher' ? UserCheck : pol.id === 'student' ? Users : Users
                const btnBg =
                  pol.accent === 'emerald'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : pol.accent === 'cyan'
                      ? 'bg-cyan-600 hover:bg-cyan-700'
                      : 'bg-sky-500 hover:bg-sky-600'
                const borderAccent =
                  pol.accent === 'emerald'
                    ? 'border-emerald-300'
                    : pol.accent === 'cyan'
                      ? 'border-cyan-300'
                      : 'border-sky-300'
                const iconColor =
                  pol.accent === 'emerald'
                    ? 'text-emerald-600'
                    : pol.accent === 'cyan'
                      ? 'text-cyan-600'
                      : 'text-sky-600'

                return (
                  <div
                    key={pol.id}
                    className={`rounded-xl border ${borderAccent} p-4 flex flex-col justify-between gap-4`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-3">
                        <Icon className={`w-6 h-6 mt-0.5 shrink-0 ${iconColor}`} />
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{pol.title}</h3>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              pol.active
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {pol.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{pol.description}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingPolicy({ ...pol })}
                        className={`flex-1 py-1.5 rounded-lg text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer ${btnBg}`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadPolicyPdf(pol)}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                        title="Print"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadPolicyPdf(pol)}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                        title="Download PDF"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-slate-900 inline-flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-700" />
                <span>About Policies &amp; Guidelines</span>
              </div>
              <p className="text-[11px] text-slate-600">
                These policies can be edited, printed, and shared with teachers, students, and
                parents. They can be attached to appointment letters, admission forms, and welcome
                cards.
              </p>
            </div>
          </div>
        </div>

        {/* Edit Policy Modal */}
        {editingPolicy && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Edit {editingPolicy.title}</h3>
                <button
                  type="button"
                  onClick={() => setEditingPolicy(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Summary</label>
                  <input
                    type="text"
                    value={editingPolicy.description}
                    onChange={(e) =>
                      setEditingPolicy((p) => ({ ...p, description: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Policy Content
                  </label>
                  <textarea
                    rows={6}
                    value={editingPolicy.content}
                    onChange={(e) => setEditingPolicy((p) => ({ ...p, content: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingPolicy.active)}
                    onChange={(e) =>
                      setEditingPolicy((p) => ({ ...p, active: e.target.checked }))
                    }
                  />
                  <span className="font-semibold text-slate-700">Active</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPolicy(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    savePolicies(
                      policies.map((x) => (x.id === editingPolicy.id ? editingPolicy : x))
                    )
                    appendActivity(
                      'Policy Updated',
                      'Settings',
                      `${editingPolicy.title} updated`
                    )
                    toast.success(`${editingPolicy.title} saved.`)
                    setEditingPolicy(null)
                  }}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 text-white font-semibold cursor-pointer"
                >
                  Save Policy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ==========================
  // RENDER: ACTIVITY LOG (Picks 5-7)
  // ==========================
  if (mode === 'activity') {
    const combinedLogs = useMemo(() => {
      const fromContext = (auditLogs || [])
        .filter((a) => !a.instituteId || a.instituteId === instId)
        .map((a) => ({
          id: a.id,
          at: a.timestamp || a.at || new Date().toISOString(),
          event: a.action || a.event || 'System Activity',
          type: a.module || a.type || 'Settings',
          description: a.details || a.description || a.action || '',
          badge: a.badge || '',
          actor: a.actor || a.user || 'Admin'
        }))
      return [...localActivities, ...fromContext].sort(
        (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
      )
    }, [localActivities, auditLogs, instId])

    const allTypes = [...new Set(combinedLogs.map((l) => l.type).filter(Boolean))]
    const allEvents = [...new Set(combinedLogs.map((l) => l.event).filter(Boolean))]

    const filteredLogs = combinedLogs.filter((l) => {
      if (appliedActFilters.type !== 'all' && l.type !== appliedActFilters.type) return false
      if (appliedActFilters.event !== 'all' && l.event !== appliedActFilters.event) return false
      const day = String(l.at || '').slice(0, 10)
      if (appliedActFilters.from && day < appliedActFilters.from) return false
      if (appliedActFilters.to && day > appliedActFilters.to) return false
      if (appliedActFilters.search.trim()) {
        const q = appliedActFilters.search.trim().toLowerCase()
        if (!`${l.event} ${l.type} ${l.description} ${l.actor}`.toLowerCase().includes(q)) {
          return false
        }
      }
      return true
    })

    const totalActPages = Math.max(1, Math.ceil(filteredLogs.length / ACT_PAGE_SIZE))
    const safeActPage = Math.min(actPage, totalActPages)
    const pagedLogs = filteredLogs.slice(
      (safeActPage - 1) * ACT_PAGE_SIZE,
      safeActPage * ACT_PAGE_SIZE
    )

    return (
      <div className="space-y-4">
        <QuickHeader
          title="Activity Log"
          onBack={() => onRouteChange?.('inst-settings')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
          onOpenSendSms={onOpenSendSms}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <History className="w-4 h-4 text-slate-600" />
                <span>System Activity</span>
              </div>
              <p className="text-xs text-slate-500">
                All system activities (payments, billing, settings, etc.)
              </p>
            </div>
            <span className="text-[11px] text-slate-500">
              Showing {pagedLogs.length} of {filteredLogs.length} entries
            </span>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Type</label>
                <select
                  value={actFilters.type}
                  onChange={(e) => setActFilters((p) => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  <option value="all">All Types</option>
                  {allTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Event</label>
                <select
                  value={actFilters.event}
                  onChange={(e) => setActFilters((p) => ({ ...p, event: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  <option value="all">All Events</option>
                  {allEvents.map((ev) => (
                    <option key={ev} value={ev}>
                      {ev}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">From</label>
                <input
                  type="date"
                  value={actFilters.from}
                  onChange={(e) => setActFilters((p) => ({ ...p, from: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">To</label>
                <input
                  type="date"
                  value={actFilters.to}
                  onChange={(e) => setActFilters((p) => ({ ...p, to: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div className="lg:col-span-4">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Search</label>
                <input
                  type="text"
                  value={actFilters.search}
                  onChange={(e) => setActFilters((p) => ({ ...p, search: e.target.value }))}
                  placeholder="Description, actor or event..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAppliedActFilters({ ...actFilters })
                    setActPage(1)
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Apply Filters</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const empty = { type: 'all', event: 'all', from: '', to: '', search: '' }
                    setActFilters(empty)
                    setAppliedActFilters(empty)
                    setActPage(1)
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                  Collected
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold">
                  Waiver
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold">
                  Reversed
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-y border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-600">
                    <th className="py-2.5 px-3 w-36">Date &amp; Time</th>
                    <th className="py-2.5 px-3 w-56">Type / Event</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right w-32">Actor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {pagedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-400">
                        No system activity logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    pagedLogs.map((l) => {
                      const dt = new Date(l.at)
                      const dateStr = Number.isNaN(dt.getTime())
                        ? String(l.at).slice(0, 10)
                        : dt.toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })
                      const timeStr = Number.isNaN(dt.getTime())
                        ? ''
                        : dt.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })
                      return (
                        <tr key={l.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-800">{dateStr}</div>
                            <div className="text-[10px] text-slate-400">{timeStr}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900">{l.event}</div>
                            <span className="mt-1 inline-block px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600 text-[10px] font-medium">
                              {l.type}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-700">{l.description}</td>
                          <td className="py-3 px-3 text-right text-slate-600">{l.actor}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalActPages > 1 && (
              <div className="flex items-center gap-1 pt-2">
                <button
                  type="button"
                  disabled={safeActPage <= 1}
                  onClick={() => setActPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalActPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setActPage(pg)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer ${
                      pg === safeActPage
                        ? 'bg-sky-500 text-white'
                        : 'border border-slate-200 text-slate-600'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safeActPage >= totalActPages}
                  onClick={() => setActPage((p) => Math.min(totalActPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ==========================
  // RENDER: INSTITUTE PROFILE (Picks 1-2)
  // ==========================
  const handleSaveProfile = (e) => {
    e.preventDefault()
    if (!profile.name.trim()) {
      toast.error('Name of institute is required.')
      return
    }
    try {
      localStorage.setItem(profileKey, JSON.stringify(profile))
    } catch {}
    appendActivity('Institute Profile Updated', 'Settings', `Profile & session saved (${profile.session})`)
    toast.success('Institute profile & session settings saved.')
  }

  return (
    <div className="space-y-4">
      <QuickHeader
        title="Institute Profile & Session"
        onBack={() => onRouteChange?.('inst-dashboard')}
        onRouteChange={onRouteChange}
        onOpenQuickPayment={onOpenQuickPayment}
        onOpenSendSms={onOpenSendSms}
      />

      <form onSubmit={handleSaveProfile} className="space-y-4">
        <div className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
            Unsaved until you save
          </span>
          <span>
            Changes on this page are <strong>not applied automatically</strong>. When you are finished
            editing every section, scroll down and click <strong>Save settings</strong>.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 text-xs">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-slate-500 tracking-wide">
                <Building2 className="w-4 h-4" />
                <span>INSTITUTE PROFILE</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Name of institute <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institute motto</label>
                <input
                  type="text"
                  value={profile.motto}
                  onChange={(e) => setProfile((p) => ({ ...p, motto: e.target.value }))}
                  placeholder="e.g. Excellence in Education"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Short tagline shown on letters, certificates, and printouts (optional)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Institute acronym
                  </label>
                  <input
                    type="text"
                    value={profile.acronym}
                    onChange={(e) => setProfile((p) => ({ ...p, acronym: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Current session <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={profile.session}
                    onChange={(e) => setProfile((p) => ({ ...p, session: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {SESSIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Institute email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Institute address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Full postal address"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 text-xs">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-slate-500 tracking-wide">
                <Globe className="w-4 h-4" />
                <span>REGIONAL &amp; CURRENCY</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Country of institute <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={profile.country}
                    onChange={(e) => {
                      const c = COUNTRIES.find((x) => x.name === e.target.value)
                      setProfile((p) => ({
                        ...p,
                        country: e.target.value,
                        currency: c?.currency || p.currency,
                        timezone: c?.timezone || p.timezone
                      }))
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Currency <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={profile.currency}
                    onChange={(e) => setProfile((p) => ({ ...p, currency: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.currency} value={c.currency}>
                        {c.currency}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Timezone <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={profile.timezone}
                    onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.timezone} value={c.timezone}>
                        {c.timezone}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Academic year starts in
                  </label>
                  <select
                    value={profile.academicStartMonth}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, academicStartMonth: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 text-xs">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-slate-500 tracking-wide">
                <Calendar className="w-4 h-4" />
                <span>ACADEMIC TERMS</span>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">This term ends</label>
                <input
                  type="date"
                  value={profile.thisTermEnds}
                  onChange={(e) => setProfile((p) => ({ ...p, thisTermEnds: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Next term begins</label>
                <input
                  type="date"
                  value={profile.nextTermBegins}
                  onChange={(e) => setProfile((p) => ({ ...p, nextTermBegins: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 text-xs">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-slate-500 tracking-wide">
                <ImageIcon className="w-4 h-4" />
                <span>INSTITUTE LOGO</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border border-slate-200 bg-sky-50 flex items-center justify-center overflow-hidden shrink-0">
                  {profile.logoDataUrl ? (
                    <img
                      src={profile.logoDataUrl}
                      alt="Institute logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-extrabold text-sky-700 text-sm">
                      {profile.acronym || 'ED'}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-500">
                    Upload a square or landscape logo (PNG, JPG, GIF, or WebP, max 5 MB). It
                    appears on reports, invoices, and the login screen.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = () =>
                        setProfile((p) => ({ ...p, logoDataUrl: String(reader.result || '') }))
                      reader.readAsDataURL(file)
                    }}
                    className="text-[11px] text-slate-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save settings</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default SettingsSuiteViews

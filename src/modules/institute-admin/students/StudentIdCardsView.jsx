import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Search,
  Printer,
  CheckSquare,
  Square,
  IdCard,
  User,
  Phone,
  Mail,
  Globe
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { getDistinctInstituteClassNames, isClassAllowedForTier } from '../../../utils/tierGating'
import { normalizeClassSections } from '../../../constants/academicLevels'

// Deterministic SVG QR-style matrix generator for crisp print & preview
const DeterministicQrSvg = ({ value = '', size = 84 }) => {
  const cells = 21
  const seedStr = String(value || 'EIMS-ID')
  let hash = 2166136261
  for (let i = 0; i < seedStr.length; i += 1) {
    hash ^= seedStr.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  const isFinder = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7)

  const isFinderDark = (r, c, lr, lc) => {
    if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true
    if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true
    return false
  }

  const rects = []
  for (let r = 0; r < cells; r += 1) {
    for (let c = 0; c < cells; c += 1) {
      let dark = false
      if (isFinder(r, c)) {
        const lr = r < 7 ? r : r - (cells - 7)
        const lc = c < 7 ? c : c - (cells - 7)
        dark = isFinderDark(r, c, lr, lc)
      } else {
        const bitHash = (hash ^ (r * 31 + c * 17) ^ ((r + 1) * (c + 3))) >>> 0
        dark = bitHash % 2 === 0
      }
      if (dark) {
        rects.push(<rect key={`${r}_${c}`} x={c} y={r} width={1} height={1} fill="#0f172a" />)
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${cells} ${cells}`}
      className="bg-white p-1 rounded border border-slate-200"
      shapeRendering="crispEdges"
    >
      <rect x="0" y="0" width={cells} height={cells} fill="#ffffff" />
      {rects}
    </svg>
  )
}

export const StudentIdCardsView = ({
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment
}) => {
  const { students = [], classes = [] } = useAppData()
  const { toast } = useToast()

  const instStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          (!currentInstitute?.id || !s.instituteId || s.instituteId === currentInstitute.id) &&
          isClassAllowedForTier(s.className, currentInstitute)
      ),
    [students, currentInstitute]
  )

  const availableClasses = useMemo(
    () => getDistinctInstituteClassNames(classes, instStudents, currentInstitute),
    [classes, instStudents, currentInstitute]
  )

  // Filters
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('ALL')
  const [searchInput, setSearchInput] = useState('')
  const [appliedFilters, setAppliedFilters] = useState({
    className: '',
    section: 'ALL',
    search: ''
  })

  // Auto-select first class on mount if none selected
  useEffect(() => {
    if (!selectedClass && availableClasses.length > 0) {
      setSelectedClass(availableClasses[0])
      setAppliedFilters((prev) => ({ ...prev, className: availableClasses[0] }))
    }
  }, [availableClasses, selectedClass])

  const classSections = useMemo(() => {
    if (!selectedClass || selectedClass === 'ALL') return []
    const clsObj = classes.find(
      (c) =>
        (!currentInstitute?.id || !c.instituteId || c.instituteId === currentInstitute.id) &&
        (c.name === selectedClass || c.className === selectedClass)
    )
    const fromCls = clsObj ? normalizeClassSections(clsObj.sections || clsObj.section) : []
    const fromStu = instStudents
      .filter((s) => s.className === selectedClass && s.section)
      .map((s) => String(s.section).trim())
    return Array.from(new Set([...fromCls, ...fromStu])).filter(Boolean)
  }, [selectedClass, classes, instStudents, currentInstitute])

  // Print Options
  const [logoWatermark, setLogoWatermark] = useState(true)
  const [showQrBack, setShowQrBack] = useState(true)
  const [academicYear, setAcademicYear] = useState('2025-2026')
  const [cardLayout, setCardLayout] = useState('horizontal') // 'horizontal' | 'vertical'
  const [customBackText, setCustomBackText] = useState('')

  // Selection state
  const [selectedIds, setSelectedIds] = useState([])

  const filteredStudents = useMemo(() => {
    return instStudents.filter((s) => {
      if (appliedFilters.className && appliedFilters.className !== 'ALL' && s.className !== appliedFilters.className) {
        return false
      }
      if (appliedFilters.section && appliedFilters.section !== 'ALL' && String(s.section || '') !== appliedFilters.section) {
        return false
      }
      if (appliedFilters.search.trim()) {
        const q = appliedFilters.search.trim().toLowerCase()
        const match =
          (s.name || '').toLowerCase().includes(q) ||
          (s.admissionNo || '').toLowerCase().includes(q) ||
          (s.rollNumber || '').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [instStudents, appliedFilters])

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    setSelectedIds(filteredStudents.map((s) => s.id))
  }

  const handleDeselectAll = () => {
    setSelectedIds([])
  }

  const instNameUpper = String(currentInstitute?.name || 'EDUDIGIZE DEMO').toUpperCase()
  const instInitials = instNameUpper
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('') || 'ED'
  const instPhone = currentInstitute?.phone || '+92-300-0000000'
  const instEmail = currentInstitute?.email || 'info@institute.edu.pk'
  const instWebsite = currentInstitute?.website || 'https://portal.institute.edu.pk/'

  const handlePrintSelected = () => {
    if (selectedIds.length === 0) {
      toast.warning('Select at least one student ID card to print')
      return
    }
    const cardsToPrint = filteredStudents.filter((s) => selectedIds.includes(s.id))
    const win = window.open('', '_blank', 'width=1000,height=800')
    if (!win) {
      toast.warning('Please allow pop-ups to print ID cards')
      return
    }

    const isVert = cardLayout === 'vertical'
    const cardW = isVert ? '210px' : '340px'
    const cardH = isVert ? '330px' : '212px'

    const cardsHtml = cardsToPrint
      .map((s) => {
        const sidText = [s.rollNumber, s.admissionNo].filter(Boolean).join(' / ') || s.id?.slice(0, 8)
        const parentName = s.guardianName || s.fatherName || ''
        return `
          <div class="pair">
            <div class="card" style="width:${cardW};height:${cardH};">
              ${logoWatermark ? `<div class="wm">${instInitials}</div>` : ''}
              <div class="top-bar">
                <div class="brand">
                  <div class="crest">${instInitials}</div>
                  <div>
                    <div class="inst-name">${instNameUpper}</div>
                    <div class="motto">Excellence in Education</div>
                  </div>
                </div>
                <div class="yr-col">
                  <span class="yr-pill">${academicYear}</span>
                  <div class="role-lbl">STUDENT</div>
                </div>
              </div>
              <div class="body">
                <div class="photo-box">${s.photoUrl ? `<img src="${s.photoUrl}" />` : '👤'}</div>
                <div class="info">
                  <div class="stu-name">${String(s.name || '').toUpperCase()}</div>
                  <div class="parent-name">${parentName}</div>
                  <div class="kv"><span>Student ID:</span> <b>${sidText}</b></div>
                  <div class="kv"><span>Class:</span> <b>${s.className || '—'}</b></div>
                  <div class="kv"><span>Date of Birth:</span> <b>${s.dob || s.dateOfBirth || '—'}</b></div>
                  <div class="kv"><span>Blood Group:</span> <b>${s.bloodGroup || '—'}</b></div>
                </div>
              </div>
              <div class="foot">Character • Discipline • Excellence</div>
            </div>

            <div class="card back" style="width:${cardW};height:${cardH};">
              ${logoWatermark ? `<div class="wm">${instInitials}</div>` : ''}
              <div class="back-head">
                <div class="inst-name">${instNameUpper}</div>
                <div class="motto">Excellence in Education</div>
              </div>
              <div class="back-mid">
                ${showQrBack ? `<div class="qr-box">ID: ${sidText}</div>` : ''}
                ${customBackText ? `<div class="custom-txt">${customBackText}</div>` : ''}
              </div>
              <div class="back-contact">${instPhone} &nbsp;•&nbsp; ${instEmail}</div>
              <div class="foot">${instWebsite}</div>
            </div>
          </div>
        `
      })
      .join('')

    win.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Student ID Cards Print</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #fff; }
            .pair { display: flex; gap: 20px; margin-bottom: 24px; page-break-inside: avoid; justify-content: center; }
            .card { position: relative; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; background: #fff; }
            .wm { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 64px; font-weight: 900; color: rgba(37, 99, 235, 0.08); pointer-events: none; }
            .top-bar { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 12px 6px; position: relative; z-index: 1; }
            .brand { display: flex; align-items: center; gap: 8px; }
            .crest { width: 28px; height: 28px; border-radius: 50%; background: #0f3d75; color: #fff; font-size: 11px; font-weight: bold; display: flex; align-items: center; justify-content: center; }
            .inst-name { font-size: 11px; font-weight: 800; color: #0f2942; }
            .motto { font-size: 8px; color: #64748b; }
            .yr-col { text-align: right; }
            .yr-pill { background: #c59b27; color: #fff; font-size: 8px; font-weight: bold; padding: 2px 6px; border-radius: 8px; }
            .role-lbl { font-size: 8px; font-weight: 800; color: #c59b27; margin-top: 2px; }
            .body { display: flex; gap: 10px; padding: 4px 12px; position: relative; z-index: 1; align-items: center; }
            .photo-box { width: 54px; height: 62px; border: 2px solid #c59b27; border-radius: 6px; background: #0e7490; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; overflow: hidden; flex-shrink: 0; }
            .photo-box img { width: 100%; height: 100%; object-fit: cover; }
            .info { font-size: 9px; line-height: 1.45; }
            .stu-name { font-size: 11px; font-weight: 800; color: #0f2942; }
            .parent-name { font-size: 8px; color: #64748b; margin-bottom: 3px; }
            .kv span { color: #64748b; }
            .foot { background: #0b2545; color: #fff; font-size: 8px; font-weight: 600; text-align: center; padding: 6px; position: relative; z-index: 1; }
            .back-head { text-align: center; padding-top: 12px; position: relative; z-index: 1; }
            .back-mid { text-align: center; padding: 6px 12px; position: relative; z-index: 1; }
            .qr-box { display: inline-block; border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 10px; font-weight: bold; background: #fff; }
            .custom-txt { font-size: 8px; color: #475569; margin-top: 6px; white-space: pre-wrap; }
            .back-contact { text-align: center; font-size: 8px; color: #334155; padding-bottom: 4px; position: relative; z-index: 1; }
            @media print { body { padding: 8px; } }
          </style>
        </head>
        <body>
          ${cardsHtml}
          <script>window.onload = function(){ window.print(); }</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student ID Cards</h1>
          </div>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-students')}
            className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-admissions-enroll')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            New Enrollment
          </button>
          <button
            type="button"
            onClick={() => onOpenQuickPayment?.()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Add Payment
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-fees-invoices')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Receipt className="w-3.5 h-3.5" />
            Generate Invoice
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-finance-expenses')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors"
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            Manage Expense
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-comm-sms')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Send SMS
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center gap-2 text-sm font-bold text-slate-800">
          <IdCard className="w-4 h-4 text-slate-600" />
          Student ID Cards
        </div>

        <div className="p-5 space-y-4">
          {/* Filter Bar */}
          <div className="border border-slate-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-[1fr_1fr_1.4fr_auto] gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Class <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value)
                  setSelectedSection('ALL')
                }}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Classes</option>
                {availableClasses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Sections</option>
                {classSections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Search</label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Name, ADM No, Roll No"
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setAppliedFilters({
                  className: selectedClass,
                  section: selectedSection,
                  search: searchInput
                })
                setSelectedIds([])
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              Filter
            </button>
          </div>

          {/* Print Options Box */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              PRINT OPTIONS <span className="font-normal lowercase">· this print only</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto_auto] gap-3 items-center">
              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={logoWatermark}
                  onChange={(e) => setLogoWatermark(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="text-xs">
                  <div className="font-semibold text-slate-800">Logo watermark</div>
                  <div className="text-[11px] text-slate-400">Faded logo on background</div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showQrBack}
                  onChange={(e) => setShowQrBack(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="text-xs">
                  <div className="font-semibold text-slate-800">QR code</div>
                  <div className="text-[11px] text-slate-400">Show on card back</div>
                </div>
              </label>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Academic year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-28 px-2.5 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Card layout</label>
                <div className="inline-flex rounded-md border border-slate-200 overflow-hidden text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setCardLayout('horizontal')}
                    className={`px-3 py-1.5 transition-colors ${
                      cardLayout === 'horizontal'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Horizontal
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardLayout('vertical')}
                    className={`px-3 py-1.5 transition-colors ${
                      cardLayout === 'vertical'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Vertical
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Custom text on card back <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={customBackText}
                onChange={(e) => setCustomBackText(e.target.value)}
                placeholder="Printed exactly as typed on the back of each card"
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Bulk Select & Print Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Select All
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-500 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                Deselect All
              </button>
              <span className="text-xs text-slate-500 ml-1">{selectedIds.length} selected</span>
            </div>

            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handlePrintSelected}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print ID Cards
            </button>
          </div>

          {/* Card Pairs List */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-6">
            {filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No students match the selected Class / Section / Search filter.
              </div>
            ) : (
              filteredStudents.map((st) => {
                const isSelected = selectedIds.includes(st.id)
                const sidDisplay =
                  [st.rollNumber, st.admissionNo].filter(Boolean).join(' / ') || st.id?.slice(0, 8)
                const parentName = st.guardianName || st.fatherName || '—'
                const dobText = st.dob || st.dateOfBirth || '—'
                const bloodText = st.bloodGroup || '—'
                const isVert = cardLayout === 'vertical'

                return (
                  <div
                    key={st.id}
                    className="flex flex-col xl:flex-row items-center justify-center gap-5 pb-4 border-b border-slate-200/70 last:border-b-0 last:pb-0"
                  >
                    {/* Selection Checkbox */}
                    <div className="xl:mr-6">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(st.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    {/* FRONT CARD */}
                    <div className="relative pt-3">
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 z-20 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow">
                        FRONT
                      </span>
                      <div
                        className={`relative rounded-xl bg-white border border-slate-200 shadow-md overflow-hidden flex flex-col justify-between ${
                          isVert ? 'w-[225px] min-h-[340px]' : 'w-[360px] h-[220px]'
                        }`}
                      >
                        {/* Corner Gold/Navy Accents */}
                        <div className="absolute top-0 left-0 w-10 h-10 bg-gradient-to-br from-[#0b2545] via-[#0b2545] to-transparent pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 bg-gradient-to-tr from-[#c59b27] to-transparent pointer-events-none opacity-80" />

                        {/* Faded Watermark */}
                        {logoWatermark && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                            <div className="w-36 h-36 rounded-full bg-blue-100/45 flex items-center justify-center text-3xl font-black text-blue-900/10 tracking-wider">
                              {instInitials}
                            </div>
                          </div>
                        )}

                        {/* Top Header */}
                        <div className="relative z-10 px-4 pt-3 flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 pl-4">
                            <div className="w-7 h-7 rounded-full bg-[#0f3d75] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              {instInitials}
                            </div>
                            <div className="leading-tight">
                              <div className="text-[11px] font-extrabold text-[#0b2545] tracking-tight">
                                {instNameUpper}
                              </div>
                              <div className="text-[8px] text-slate-500">Excellence in Education</div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-[#c59b27] text-white text-[8px] font-bold">
                              {academicYear}
                            </span>
                            <div className="text-[8px] font-extrabold text-[#c59b27] mt-0.5">STUDENT</div>
                          </div>
                        </div>

                        {/* Middle Student Body */}
                        <div
                          className={`relative z-10 px-4 py-1 flex items-center gap-3 ${
                            isVert ? 'flex-col text-center' : ''
                          }`}
                        >
                          <div className="w-16 h-20 rounded-md border-2 border-[#c59b27] bg-teal-700 text-white flex items-center justify-center overflow-hidden shrink-0">
                            {st.photoUrl ? (
                              <img src={st.photoUrl} alt={st.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-9 h-9" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 text-[9.5px] leading-snug">
                            <div className="text-xs font-extrabold text-[#0b2545] truncate">
                              {String(st.name || '').toUpperCase()}
                            </div>
                            <div className="text-[9px] text-slate-500 truncate mb-1">{parentName}</div>
                            <div className="space-y-0.5 text-slate-700">
                              <div>
                                <span className="text-slate-400">Student ID :</span>{' '}
                                <span className="font-bold text-slate-800">{sidDisplay}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Class :</span>{' '}
                                <span className="font-bold text-slate-800">{st.className || '—'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Date of Birth :</span>{' '}
                                <span className="font-bold text-slate-800">{dobText}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Blood Group :</span>{' '}
                                <span className="font-bold text-slate-800">{bloodText}</span>
                              </div>
                            </div>
                          </div>

                          {!isVert && (
                            <div className="shrink-0 self-end">
                              <DeterministicQrSvg value={`${st.id}_${sidDisplay}`} size={44} />
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="relative z-10 bg-[#0b2545] text-white text-[9px] font-semibold text-center py-1.5 tracking-wide">
                          Character &nbsp;•&nbsp; Discipline &nbsp;•&nbsp; Excellence
                        </div>
                      </div>
                    </div>

                    {/* BACK CARD */}
                    <div className="relative pt-3">
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 z-20 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow">
                        BACK
                      </span>
                      <div
                        className={`relative rounded-xl bg-white border border-slate-200 shadow-md overflow-hidden flex flex-col justify-between ${
                          isVert ? 'w-[225px] min-h-[340px]' : 'w-[360px] h-[220px]'
                        }`}
                      >
                        <div className="absolute top-0 left-0 w-10 h-10 bg-gradient-to-br from-[#0b2545] via-[#c59b27]/70 to-transparent pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-tl from-[#c59b27] to-transparent pointer-events-none opacity-80" />

                        {logoWatermark && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                            <div className="w-36 h-36 rounded-full bg-blue-100/45 flex items-center justify-center text-3xl font-black text-blue-900/10 tracking-wider">
                              {instInitials}
                            </div>
                          </div>
                        )}

                        <div className="relative z-10 text-center pt-3 px-4">
                          <div className="text-[11px] font-extrabold text-[#0b2545]">{instNameUpper}</div>
                          <div className="text-[8px] text-slate-500">Excellence in Education</div>
                        </div>

                        <div className="relative z-10 flex flex-col items-center justify-center px-4 py-1 gap-1.5">
                          {showQrBack && (
                            <DeterministicQrSvg value={`VERIFY:${st.id}:${sidDisplay}`} size={86} />
                          )}
                          {customBackText.trim() && (
                            <div className="text-[8.5px] text-slate-600 text-center whitespace-pre-wrap max-w-[280px] leading-tight">
                              {customBackText}
                            </div>
                          )}
                        </div>

                        <div className="relative z-10 px-4 pb-1 flex items-center justify-between text-[8.5px] text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-[#0b2545]" />
                            {instPhone}
                          </span>
                          <span className="inline-flex items-center gap-1 truncate max-w-[160px]">
                            <Mail className="w-2.5 h-2.5 text-[#0b2545]" />
                            {instEmail}
                          </span>
                        </div>

                        <div className="relative z-10 bg-[#0b2545] text-white text-[8.5px] font-medium text-center py-1.5 flex items-center justify-center gap-1">
                          <Globe className="w-2.5 h-2.5" />
                          {instWebsite}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentIdCardsView

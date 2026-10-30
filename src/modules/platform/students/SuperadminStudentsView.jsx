import React, { useState, useMemo } from 'react'
import { 
  GraduationCap, 
  Users, 
  ArrowLeftRight, 
  GitMerge, 
  Hash, 
  FileCheck, 
  Award, 
  ShieldAlert, 
  BarChart3, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Download, 
  Building2, 
  FileText, 
  ChevronRight,
  Eye,
  Check,
  X,
  Sparkles
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const SuperadminStudentsView = ({ activeTab = 'all', onTabChange = () => {} }) => {
  const { students = [], institutes = [] } = useAppData()
  const { toast } = useToast()
  const [inspectingStudent, setInspectingStudent] = useState(null)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [transferFormData, setTransferFormData] = useState({
    student: '',
    roll: '',
    from: 'Beaconhouse Central High',
    to: 'The City School Senior Branch',
    reason: 'Family residential relocation to new municipal district'
  })

  const handleExportStudentsCSV = () => {
    try {
      const headers = ['ID', 'Name', 'Roll Number', 'Campus', 'Wing', 'Grade', 'Status', 'Contact']
      const rows = filteredStudents.map(s => [
        s.id || '',
        `"${(s.name || '').replace(/"/g, '""')}"`,
        s.rollNo || s.id || '',
        `"${(s.campus || 'Main Campus').replace(/"/g, '""')}"`,
        s.wing || 'School',
        s.grade || 'Standard',
        s.status || 'Active',
        s.contact || 'N/A'
      ])
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `Students_Roster_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast?.success?.(`Successfully exported ${filteredStudents.length} student records to CSV!`)
    } catch {
      toast?.error?.('Failed to generate CSV export.')
    }
  }

  const handleCreateTransferSubmit = (e) => {
    e.preventDefault()
    if (!transferFormData.student) return
    const newTr = {
      id: `TR-${Date.now().toString().slice(-4)}`,
      student: transferFormData.student,
      roll: transferFormData.roll || 'AUTO-GEN',
      from: transferFormData.from,
      to: transferFormData.to,
      requestedOn: new Date().toLocaleDateString(),
      status: 'Pending Superadmin Approval'
    }
    setTransfers(prev => [newTr, ...prev])
    setIsTransferModalOpen(false)
    toast?.success?.(`Inter-campus transfer registered for ${transferFormData.student}!`)
  }


  const [currentTab, setCurrentTab] = useState(activeTab)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCampus, setSelectedCampus] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')

  // Sample data fallback for cross-campus demonstration
  const [mockTransfers, setMockTransfers] = useState([
    { id: 'TR-101', studentName: 'Muhammad Hamza', rollNo: 'BHS-042', fromCampus: 'Beaconhouse Central High School', toCampus: 'City School Senior Branch', status: 'Pending Approval', date: '2026-10-25' },
    { id: 'TR-102', studentName: 'Ayesha Siddiqua', rollNo: 'LGS-118', fromCampus: 'Lahore Grammar Model Town', toCampus: 'Beaconhouse Central High School', status: 'Approved', date: '2026-10-21' },
    { id: 'TR-103', studentName: 'Zainab Fatima', rollNo: 'BHS-099', fromCampus: 'City School Senior Branch', toCampus: 'Roots Millennium Campus', status: 'In Review', date: '2026-10-18' }
  ])

  const [mockDuplicates, setMockDuplicates] = useState([
    { id: 'DUP-01', name: 'Bilal Ahmed', bForm: '35201-4458921-3', recordA: { roll: 'BHS-104', campus: 'Beaconhouse Central High', class: 'Grade 9-A' }, recordB: { roll: 'BHS-219', campus: 'Beaconhouse Central High', class: 'Grade 9-B' }, similarity: '98%' }
  ])

  const [idRules, setIdRules] = useState([
    { campusId: 'all', campusName: 'Global Default Directive', prefix: 'EDU-{YEAR}-', digitLength: 4, separator: '-', sample: 'EDU-2026-0042' },
    { campusId: 'inst-1', campusName: 'Beaconhouse Central High', prefix: 'BHS-{WING}-', digitLength: 4, separator: '-', sample: 'BHS-SR-0105' },
    { campusId: 'inst-2', campusName: 'City School Senior Branch', prefix: 'TCS-{YEAR}-', digitLength: 4, separator: '-', sample: 'TCS-2026-0089' }
  ])

  const [docVerifications, setDocVerifications] = useState([
    { id: 'DOC-501', studentName: 'Daniyal Tariq', campus: 'Beaconhouse Central High', docType: 'B-Form / NADRA CRC', status: 'Verified', date: '2026-10-27' },
    { id: 'DOC-502', studentName: 'Sara Khan', campus: 'City School Senior Branch', docType: 'Previous School Leaving Cert', status: 'Pending Review', date: '2026-10-28' },
    { id: 'DOC-503', studentName: 'Usman Ghani', campus: 'Lahore Grammar Model Town', docType: 'Father CNIC & Immunization', status: 'Under Review', date: '2026-10-26' }
  ])

  const [privacyRequests, setPrivacyRequests] = useState([
    { id: 'PR-901', requester: 'Parent: Dr. Asim Qureshi', student: 'Mustafa Qureshi', type: 'Data Export (Archive)', status: 'Fulfilled', date: '2026-10-20' },
    { id: 'PR-902', requester: 'Guardian: Tariq Mehmood', student: 'Saad Mehmood', type: 'Right to Be Forgotten (Purge)', status: 'Awaiting Superadmin Authorization', date: '2026-10-28' }
  ])

  const effectiveTab = currentTab || activeTab || 'all'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  // Combined cross-campus student records
  const allStudentRecords = useMemo(() => {
    if (students && students.length > 0) return students
    return [
      { id: 'std-1', name: 'Abdullah Khan', rollNo: 'BHS-2026-01', campus: 'Beaconhouse Central High', wing: 'Middle Wing', grade: 'Grade 8', status: 'Active', gender: 'Male', contact: '0300-1234567' },
      { id: 'std-2', name: 'Zoya Fatima', rollNo: 'BHS-2026-02', campus: 'Beaconhouse Central High', wing: 'High School', grade: 'Grade 10', status: 'Active', gender: 'Female', contact: '0301-9876543' },
      { id: 'std-3', name: 'Ahmed Ali Raza', rollNo: 'TCS-2026-14', campus: 'City School Senior Branch', wing: 'College Wing', grade: 'FSc Pre-Medical', status: 'Active', gender: 'Male', contact: '0321-4567890' },
      { id: 'std-4', name: 'Hania Imran', rollNo: 'LGS-2026-88', campus: 'Lahore Grammar Model Town', wing: 'Primary Wing', grade: 'Grade 4', status: 'Suspended', gender: 'Female', contact: '0333-7890123' },
      { id: 'std-5', name: 'Rayyan Siddiqui', rollNo: 'BHS-2026-77', campus: 'Beaconhouse Central High', wing: 'Elementary Wing', grade: 'Grade 2', status: 'Active', gender: 'Male', contact: '0345-6789012' }
    ]
  }, [students])

  const filteredStudents = useMemo(() => {
    return allStudentRecords.filter(s => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q || 
        (s.name || '').toLowerCase().includes(q) || 
        (s.rollNo || '').toLowerCase().includes(q) ||
        (s.campus || '').toLowerCase().includes(q)
      const matchesCampus = selectedCampus === 'ALL' || s.campus === selectedCampus
      const matchesStatus = selectedStatus === 'ALL' || (s.status || 'Active').toLowerCase() === selectedStatus.toLowerCase()
      return matchesSearch && matchesCampus && matchesStatus
    })
  }, [allStudentRecords, searchQuery, selectedCampus, selectedStatus])

  const tabsConfig = [
    { key: 'all', label: 'All Students (Cross-Campus)', icon: Users, badge: allStudentRecords.length },
    { key: 'transfers', label: 'Inter-Campus Transfers', icon: ArrowLeftRight, badge: mockTransfers.filter(t => t.status.includes('Pending') || t.status.includes('Review')).length },
    { key: 'duplicate', label: 'Duplicate & Merge Records', icon: GitMerge, badge: mockDuplicates.length },
    { key: 'id-rules', label: 'ID / Roll Number Rules', icon: Hash },
    { key: 'verification', label: 'Document Verification', icon: FileCheck, badge: docVerifications.filter(d => d.status !== 'Verified').length },
    { key: 'alumni', label: 'Alumni & Degree Verification', icon: Award },
    { key: 'privacy', label: 'Data & Privacy Requests', icon: ShieldAlert, badge: privacyRequests.filter(p => p.status.includes('Awaiting')).length },
    { key: 'reports', label: 'Student Reports', icon: BarChart3 }
  ]

  const handleApproveTransfer = (id) => {
    setMockTransfers(prev => prev.map(t => t.id === id ? { ...t, status: 'Approved' } : t))
    toast?.success?.(`Inter-campus transfer "${id}" has been authorized.`)
  }

  const handleMergeDuplicate = (dupId) => {
    setMockDuplicates(prev => prev.filter(d => d.id !== dupId))
    toast?.success?.(`Student duplicate record ${dupId} merged into canonical primary profile.`)
  }

  const handleVerifyDoc = (docId) => {
    setDocVerifications(prev => prev.map(d => d.id === docId ? { ...d, status: 'Verified' } : d))
    toast?.success?.(`Document ${docId} verified with official platform stamp.`)
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/10 mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-purple-300" />
              <span>Super Administrator • Central Student Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Students Central Command
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Global student directory, automated inter-campus transfer approvals, biometric ID generation rules, and data privacy governance.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl text-right">
              <span className="text-[11px] text-slate-300 block uppercase font-mono tracking-wider">Total Enrolled</span>
              <strong className="text-xl font-bold font-mono text-white">{allStudentRecords.length} Students</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Pills Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-2xs overflow-x-auto dark-scroll">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabsConfig.map((t) => {
            const Icon = t.icon
            const isActive = effectiveTab === t.key
            return (
              <button
                key={t.key}
                onClick={() => handleTabSwitch(t.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{t.label}</span>
                {t.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-purple-700 text-purple-100' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {t.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* TAB 1: ALL STUDENTS (CROSS-CAMPUS) */}
      {effectiveTab === 'all' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex-1 w-full md:w-auto flex items-center gap-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                placeholder="Search across all campuses by Student Name, Roll No, or Campus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Affiliated Campuses</option>
                {institutes.map(inst => (
                  <option key={inst.id} value={inst.name}>{inst.name}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>

              <button
                type="button"
                onClick={handleExportStudentsCSV}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Student Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Student & Roll No</th>
                    <th className="py-3.5 px-4">Affiliated Campus</th>
                    <th className="py-3.5 px-4">Wing & Grade</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No students match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{st.name}</div>
                          <span className="font-mono text-[11px] text-purple-700 font-semibold">{st.rollNo || st.id}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {st.campus || 'Main Campus'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">{st.grade || 'Standard'}</div>
                          <span className="text-[10px] text-slate-400">{st.wing || 'General Wing'}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            (st.status || 'Active') === 'Active' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {st.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          {st.contact || 'Registered in Campus'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setInspectingStudent(st)}
                            className="p-1.5 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="Inspect Student Record"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTER-CAMPUS TRANSFERS */}
      {effectiveTab === 'transfers' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <ArrowLeftRight className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <strong className="text-slate-900 block font-bold">Inter-Campus Relocation Governance:</strong>
                <span className="text-slate-600 text-[11px]">
                  All student transfers between school branches require Superadmin clearance to automatically migrate academic transcripts and fee balances.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-2xs transition-all cursor-pointer shrink-0"
            >
              + Initiate Transfer
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Transfer ID & Student</th>
                  <th className="py-3.5 px-4">Origin Campus</th>
                  <th className="py-3.5 px-4">Destination Campus</th>
                  <th className="py-3.5 px-4">Requested On</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Superadmin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockTransfers.map(tr => (
                  <tr key={tr.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{tr.studentName}</div>
                      <span className="font-mono text-[10px] text-slate-400">{tr.id} • {tr.rollNo}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{tr.fromCampus}</td>
                    <td className="py-3.5 px-4 font-medium text-purple-700">{tr.toCampus}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{tr.date}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        tr.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {tr.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {tr.status !== 'Approved' ? (
                        <button
                          type="button"
                          onClick={() => handleApproveTransfer(tr.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Authorize</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Authorized</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DUPLICATE & MERGE RECORDS */}
      {effectiveTab === 'duplicate' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong>Smart Identity Deduplication:</strong> Automated scanner cross-references National Identity B-Forms and mobile numbers to prevent dual registration across franchises.
              </div>
            </div>
            <button
              type="button"
              onClick={() => toast?.info?.('Scanned all campuses. 1 potential duplicate flag found.')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold cursor-pointer shrink-0"
            >
              Scan Campuses
            </button>
          </div>

          {mockDuplicates.map(d => (
            <div key={d.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <h4 className="font-bold text-slate-900 text-sm">Potential Duplicate Match: {d.name}</h4>
                  <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">B-Form: {d.bForm}</span>
                </div>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  {d.similarity} Match Confidence
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-xs space-y-1">
                  <strong className="text-purple-700 block">Record A (Active Roster)</strong>
                  <div>Roll: <span className="font-mono font-bold text-slate-800">{d.recordA.roll}</span></div>
                  <div>Campus: {d.recordA.campus}</div>
                  <div>Class: {d.recordA.class}</div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-xs space-y-1">
                  <strong className="text-indigo-700 block">Record B (Secondary Inflow)</strong>
                  <div>Roll: <span className="font-mono font-bold text-slate-800">{d.recordB.roll}</span></div>
                  <div>Campus: {d.recordB.campus}</div>
                  <div>Class: {d.recordB.class}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => toast?.info?.('Ignored false positive.')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Dismiss Flag
                </button>
                <button
                  type="button"
                  onClick={() => handleMergeDuplicate(d.id)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1"
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  <span>Merge into Primary Record</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: ID / ROLL NUMBER RULES */}
      {effectiveTab === 'id-rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Platform Roll Number Mask Directives</h3>
              <p className="text-xs text-slate-500">Define uniform student identifier numbering conventions across wings and institutes.</p>
            </div>
            <button
              type="button"
              onClick={() => toast?.success?.('Roll number pattern rule created.')}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Define New Pattern</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {idRules.map((rule, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{rule.campusName}</span>
                  <Hash className="w-4 h-4 text-purple-600" />
                </div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div>Prefix Mask: <strong className="font-mono text-purple-700">{rule.prefix}</strong></div>
                  <div>Digit Length: <strong className="font-mono text-slate-800">{rule.digitLength} Digits</strong></div>
                  <div>Separator: <strong className="font-mono text-slate-800">"{rule.separator}"</strong></div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Sample Output ID</span>
                  <strong className="font-mono text-sm text-purple-800 font-bold">{rule.sample}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DOCUMENT VERIFICATION */}
      {effectiveTab === 'verification' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Verification ID</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Campus</th>
                  <th className="py-3.5 px-4">Document Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docVerifications.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700">{doc.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{doc.studentName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{doc.campus}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{doc.docType}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {doc.status !== 'Verified' ? (
                        <button
                          type="button"
                          onClick={() => handleVerifyDoc(doc.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Verify</span>
                        </button>
                      ) : (
                        <span className="text-emerald-600 text-xs font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: ALUMNI & DEGREE VERIFICATION */}
      {effectiveTab === 'alumni' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Public & Employer Degree Credential Verification</h3>
            <p className="text-xs text-slate-500">Authorize authentic diploma certificates and academic transcripts with cryptographically signed verification QR links.</p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Student Registration No or Degree Serial (e.g. DEG-2024-9981)..."
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={() => toast?.success?.('Degree verified: Student completed Secondary School Certificate (SSC) with A+ Grade.')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Verify Credential
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: DATA & PRIVACY REQUESTS */}
      {effectiveTab === 'privacy' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Request ID</th>
                  <th className="py-3.5 px-4">Requester</th>
                  <th className="py-3.5 px-4">Student Account</th>
                  <th className="py-3.5 px-4">Request Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {privacyRequests.map(pr => (
                  <tr key={pr.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700">{pr.id}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{pr.requester}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{pr.student}</td>
                    <td className="py-3.5 px-4">{pr.type}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        pr.status === 'Fulfilled' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {pr.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => toast?.success?.(`Processed privacy request ${pr.id}`)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Process
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: STUDENT REPORTS */}
      {effectiveTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Cross-Campus Retention</span>
            <div className="text-2xl font-bold font-mono text-purple-700">97.4%</div>
            <p className="text-[11px] text-slate-400">Term-over-term student persistence across affiliated branches.</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Gender Ratio</span>
            <div className="text-2xl font-bold font-mono text-indigo-700">52% M / 48% F</div>
            <p className="text-[11px] text-slate-400">Balanced demographic distribution across all academic wings.</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Active Bursaries</span>
            <div className="text-2xl font-bold font-mono text-emerald-700">142 Students</div>
            <p className="text-[11px] text-slate-400">Merit scholarship and fee concession recipients.</p>
          </div>
        </div>
      )}
    
      {/* Student 360 Inspection Modal */}
      {inspectingStudent && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingStudent(null)}
          title={`Student Profile: ${inspectingStudent.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{inspectingStudent.name}</h4>
                <p className="text-purple-700 font-mono text-xs font-bold mt-0.5">Roll No: {inspectingStudent.rollNo || inspectingStudent.id}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {inspectingStudent.status || 'Active Enrolled'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Affiliated Campus</span>
                <span className="font-semibold text-slate-900 text-xs">{inspectingStudent.campus || 'Main Campus'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Academic Wing &amp; Grade</span>
                <span className="font-semibold text-slate-900 text-xs">{inspectingStudent.wing || 'School'} &bull; {inspectingStudent.grade || 'Grade 10'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Emergency Contact</span>
                <span className="font-semibold text-slate-900 text-xs font-mono">{inspectingStudent.contact || '0300-XXXXXXX'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Biometric Attendance</span>
                <span className="font-bold text-emerald-700 text-xs">94.8% Present Rate</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 block font-bold uppercase mb-1">Fee Status &amp; Clearance</span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700">Monthly Tuition Status:</span>
                <span className="font-bold text-emerald-700">Paid in Full (Challan #BHS-9941)</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => toast?.info?.('Generating printable Student ID card badge...')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer"
              >
                Print Student ID Card
              </button>
              <button
                onClick={() => setInspectingStudent(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Transfer Initiation Modal */}
      {isTransferModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsTransferModalOpen(false)}
          title="Initiate Inter-Campus Student Transfer"
        >
          <form onSubmit={handleCreateTransferSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Student Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Daniyal Aslam"
                value={transferFormData.student}
                onChange={e => setTransferFormData({ ...transferFormData, student: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Roll / Admission Number</label>
              <input
                type="text"
                placeholder="e.g. BHS-4910"
                value={transferFormData.roll}
                onChange={e => setTransferFormData({ ...transferFormData, roll: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Origin Campus</label>
                <select
                  value={transferFormData.from}
                  onChange={e => setTransferFormData({ ...transferFormData, from: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option>Beaconhouse Central High</option>
                  <option>The City School Senior Branch</option>
                  <option>Lahore Grammar Model Town</option>
                  <option>Army Public School &amp; College</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Destination Campus</label>
                <select
                  value={transferFormData.to}
                  onChange={e => setTransferFormData({ ...transferFormData, to: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option>The City School Senior Branch</option>
                  <option>Beaconhouse Central High</option>
                  <option>Lahore Grammar Model Town</option>
                  <option>Army Public School &amp; College</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason for Relocation</label>
              <textarea
                rows={2}
                value={transferFormData.reason}
                onChange={e => setTransferFormData({ ...transferFormData, reason: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer"
              >
                Submit Transfer Request
              </button>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  )
}

export default SuperadminStudentsView

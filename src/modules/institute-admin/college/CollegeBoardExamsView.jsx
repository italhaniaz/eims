import React, { useState } from 'react'
import { 
  Award, 
  Search, 
  Filter, 
  FileCheck, 
  Download, 
  Printer, 
  Clock, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  FileText,
  School,
  GraduationCap
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const CollegeBoardExamsView = ({ currentInstitute }) => {
  const { students = [] } = useAppData()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('batches') // 'batches' | 'slips' | 'results'
  const [searchQuery, setSearchQuery] = useState('')
  const [boardFilter, setBoardFilter] = useState('ALL')
  const [groupFilter, setGroupFilter] = useState('ALL')
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

  // Demo Board Batches
  const [batches, setBatches] = useState([
    {
      id: 'BAT-2026-001',
      batchTitle: 'HSSC Annual 2026 - Part II (Pre-Medical & Pre-Engineering)',
      boardName: 'BISE Lahore',
      academicYear: '2025-2026',
      totalCandidates: 142,
      submissionDate: '2026-10-15',
      feeChallanNo: 'BISE-LHR-89210',
      feeStatus: 'Verified',
      status: 'Submitted'
    },
    {
      id: 'BAT-2026-002',
      batchTitle: 'HSSC Annual 2026 - Part I (ICS & I.Com Groups)',
      boardName: 'BISE Lahore',
      academicYear: '2025-2026',
      totalCandidates: 98,
      submissionDate: '2026-10-22',
      feeChallanNo: 'BISE-LHR-91044',
      feeStatus: 'Verified',
      status: 'Under Review'
    },
    {
      id: 'BAT-2026-003',
      batchTitle: 'Federal Board (FBISE) Islamabad - HSSC Composite',
      boardName: 'FBISE Islamabad',
      academicYear: '2025-2026',
      totalCandidates: 34,
      submissionDate: '2026-10-28',
      feeChallanNo: 'FBISE-ISB-43219',
      feeStatus: 'Pending Clearance',
      status: 'Draft'
    }
  ])

  // Demo Roll Number Slips
  const [rollNumberSlips, setRollNumberSlips] = useState([
    {
      id: 'SLIP-01',
      rollNo: '710429',
      studentName: 'Zainab Fatima',
      collegeRoll: 'COL-24-101',
      discipline: 'F.Sc Pre-Medical (Part II)',
      board: 'BISE Lahore',
      centerName: 'Govt. Model High School Examination Complex, Hall A',
      practicalCenter: 'Govt. College for Women, Lab 3',
      dispatchStatus: 'Dispatched',
      examStartDate: '2026-05-10'
    },
    {
      id: 'SLIP-02',
      rollNo: '710430',
      studentName: 'Muhammad Hamza',
      collegeRoll: 'COL-24-108',
      discipline: 'F.Sc Pre-Engineering (Part II)',
      board: 'BISE Lahore',
      centerName: 'Govt. Islamia College Civil Lines, Examination Hall B',
      practicalCenter: 'Govt. Islamia College Physics & Chem Labs',
      dispatchStatus: 'Dispatched',
      examStartDate: '2026-05-10'
    },
    {
      id: 'SLIP-03',
      rollNo: '789120',
      studentName: 'Ali Raza',
      collegeRoll: 'COL-25-045',
      discipline: 'ICS - Computer Science (Part I)',
      board: 'BISE Lahore',
      centerName: 'Govt. Pilot Secondary School, Center 4',
      practicalCenter: 'Govt. Pilot CS Lab A',
      dispatchStatus: 'Ready for Collection',
      examStartDate: '2026-05-25'
    }
  ])

  // Demo Gazette Results
  const [gazetteResults, setGazetteResults] = useState([
    {
      id: 'RES-01',
      rollNo: '620194',
      studentName: 'Ayesha Siddiqui',
      collegeRoll: 'COL-23-014',
      discipline: 'F.Sc Pre-Medical',
      board: 'BISE Lahore',
      totalMarks: 1100,
      obtainedMarks: 1048,
      percentage: '95.3%',
      grade: 'A-1 (Outstanding)',
      status: 'Passed (College Topper)',
      remarks: 'Awarded Full Academic Shield'
    },
    {
      id: 'RES-02',
      rollNo: '620210',
      studentName: 'Ahmed Hassan',
      collegeRoll: 'COL-23-042',
      discipline: 'F.Sc Pre-Engineering',
      board: 'BISE Lahore',
      totalMarks: 1100,
      obtainedMarks: 1012,
      percentage: '92.0%',
      grade: 'A-1',
      status: 'Passed',
      remarks: 'Selected in UET Merit'
    },
    {
      id: 'RES-03',
      rollNo: '650341',
      studentName: 'Danish Tariq',
      collegeRoll: 'COL-23-088',
      discipline: 'ICS - Physics Group',
      board: 'BISE Lahore',
      totalMarks: 1100,
      obtainedMarks: 945,
      percentage: '85.9%',
      grade: 'A',
      status: 'Passed',
      remarks: 'FAST-NUCES Direct Qualified'
    }
  ])

  // New Registration Batch Form State
  const [formData, setFormData] = useState({
    batchTitle: '',
    boardName: 'BISE Lahore',
    discipline: 'F.Sc Pre-Medical',
    totalCandidates: '',
    feeChallanNo: ''
  })

  const handleCreateBatch = (e) => {
    e.preventDefault()
    if (!formData.batchTitle) {
      toast({ title: 'Validation Error', message: 'Batch title is required', type: 'error' })
      return
    }

    const newBatch = {
      id: `BAT-2026-00${batches.length + 1}`,
      batchTitle: formData.batchTitle,
      boardName: formData.boardName,
      academicYear: '2025-2026',
      totalCandidates: parseInt(formData.totalCandidates) || 1,
      submissionDate: new Date().toISOString().split('T')[0],
      feeChallanNo: formData.feeChallanNo || `BISE-CH-${Math.floor(10000 + Math.random() * 90000)}`,
      feeStatus: 'Verified',
      status: 'Submitted'
    }

    setBatches([newBatch, ...batches])
    setIsRegisterModalOpen(false)
    setFormData({ batchTitle: '', boardName: 'BISE Lahore', discipline: 'F.Sc Pre-Medical', totalCandidates: '', feeChallanNo: '' })
    toast({ title: 'Batch Submitted', message: 'Intermediate board registration batch dispatched successfully', type: 'success' })
  }

  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,'
    if (activeTab === 'batches') {
      csvContent += 'Batch ID,Title,Board,Candidates,Challan,Status\n'
      batches.forEach(b => {
        csvContent += `"${b.id}","${b.batchTitle}","${b.boardName}",${b.totalCandidates},"${b.feeChallanNo}","${b.status}"\n`
      })
    } else if (activeTab === 'slips') {
      csvContent += 'Roll No,Student,College Roll,Discipline,Board,Center,Status\n'
      rollNumberSlips.forEach(s => {
        csvContent += `"${s.rollNo}","${s.studentName}","${s.collegeRoll}","${s.discipline}","${s.board}","${s.centerName}","${s.dispatchStatus}"\n`
      })
    } else {
      csvContent += 'Board Roll No,Student,College Roll,Discipline,Marks,Grade,Status\n'
      gazetteResults.forEach(r => {
        csvContent += `"${r.rollNo}","${r.studentName}","${r.collegeRoll}","${r.discipline}","${r.obtainedMarks}/${r.totalMarks}","${r.grade}","${r.status}"\n`
      })
    }
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `college_board_exams_${activeTab}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: 'Export Generated', message: 'Board examination dataset exported to CSV', type: 'success' })
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide uppercase text-indigo-200 mb-2">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Higher Secondary Intermediate Examination Directorate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Board Registration & Exams
            </h1>
            <p className="text-sm text-indigo-100/90 mt-1 max-w-2xl">
              BISE & FBISE intermediate registration dossiers, roll number slips dispatch, examination centers, and gazette results governance for {currentInstitute?.name || 'College Campus'}.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs tracking-wide transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wide transition-all cursor-pointer shadow-lg hover:shadow-purple-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>New Board Batch</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered</div>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">274 Candidates</div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Part-I & Part-II Combined
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Affiliated Boards</div>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">BISE & FBISE</div>
            <div className="text-[11px] font-semibold text-indigo-600 mt-1 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Lahore & Federal Boards
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <School className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Roll No Slips</div>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">100% Generated</div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready for examination centers
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">College Pass Ratio</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">98.4%</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">
              Last Board Annual Gazette
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'batches', label: 'Registration Batches (Dossiers)' },
              { id: 'slips', label: 'Roll Number Slips & Centers' },
              { id: 'results', label: 'Gazette & Board Results' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search roll no, name, batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
            />
          </div>
        </div>

        {/* Tab 1: Registration Batches */}
        {activeTab === 'batches' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Batch ID & Title</th>
                  <th className="py-3 px-4">Affiliated Board</th>
                  <th className="py-3 px-4">Candidates</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4">Fee Challan</th>
                  <th className="py-3 px-4">Batch Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {batches.map(batch => (
                  <tr key={batch.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold">
                      <div className="text-slate-900 font-bold">{batch.batchTitle}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{batch.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700">
                        {batch.boardName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {batch.totalCandidates} Students
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{batch.submissionDate}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-[11px] font-semibold text-slate-800">{batch.feeChallanNo}</div>
                      <div className="text-[10px] text-emerald-600 font-bold">Paid & Verified</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        batch.status === 'Submitted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        batch.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toast({ title: 'Batch Verification', message: `Dossier ${batch.id} confirmed with board database`, type: 'info' })}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="View Submission Dossier"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Roll Number Slips */}
        {activeTab === 'slips' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Board Roll No</th>
                  <th className="py-3 px-4">Student Name & College ID</th>
                  <th className="py-3 px-4">Discipline & Group</th>
                  <th className="py-3 px-4">Theory Examination Center</th>
                  <th className="py-3 px-4">Practical Lab Center</th>
                  <th className="py-3 px-4">Dispatch Status</th>
                  <th className="py-3 px-4 text-right">Print Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {rollNumberSlips.map(slip => (
                  <tr key={slip.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700 text-sm">
                      {slip.rollNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{slip.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{slip.collegeRoll}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{slip.discipline}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={slip.centerName}>
                      {slip.centerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">{slip.practicalCenter}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {slip.dispatchStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toast({ title: 'Roll Number Slip', message: `BISE Admit Card printed for ${slip.studentName}`, type: 'success' })}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Gazette & Board Results */}
        {activeTab === 'results' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Student & College Roll</th>
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-4">Obtained / Total Marks</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Grade Awarded</th>
                  <th className="py-3 px-4">Board Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {gazetteResults.map(res => (
                  <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{res.rollNo}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{res.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{res.collegeRoll}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{res.discipline}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {res.obtainedMarks} <span className="text-slate-400 font-normal">/ {res.totalMarks}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-purple-700">{res.percentage}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[11px] bg-purple-50 text-purple-700 border border-purple-200">
                        {res.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-emerald-700">{res.status}</div>
                      <div className="text-[10px] text-slate-400">{res.remarks}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Registration Batch Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Create Intermediate Board Registration Batch"
      >
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Batch Title & Session</label>
            <input
              type="text"
              placeholder="e.g. HSSC Annual 2026 - Part I (Pre-Medical & Pre-Eng)"
              value={formData.batchTitle}
              onChange={(e) => setFormData({ ...formData, batchTitle: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Affiliated Board</label>
              <select
                value={formData.boardName}
                onChange={(e) => setFormData({ ...formData, boardName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-600 bg-white"
              >
                <option value="BISE Lahore">BISE Lahore</option>
                <option value="BISE Rawalpindi">BISE Rawalpindi</option>
                <option value="BISE Faisalabad">BISE Faisalabad</option>
                <option value="FBISE Islamabad">FBISE Islamabad</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Enrolled Candidates</label>
              <input
                type="number"
                placeholder="e.g. 85"
                value={formData.totalCandidates}
                onChange={(e) => setFormData({ ...formData, totalCandidates: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bank Fee Challan Number</label>
            <input
              type="text"
              placeholder="e.g. HBL-BISE-2026-9012"
              value={formData.feeChallanNo}
              onChange={(e) => setFormData({ ...formData, feeChallanNo: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer shadow-md"
            >
              Submit to Board
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default CollegeBoardExamsView

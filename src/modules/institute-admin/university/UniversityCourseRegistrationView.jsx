import React, { useState } from 'react'
import { 
  FileCheck, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Clock, 
  GraduationCap, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  BookOpen, 
  UserCheck, 
  X, 
  Check, 
  Layers,
  ArrowRight
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const UniversityCourseRegistrationView = ({ currentInstitute }) => {
  const { students = [] } = useAppData()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('requests') // 'requests' | 'courses' | 'cohorts'
  const [searchQuery, setSearchQuery] = useState('')
  const [programFilter, setProgramFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)

  // Demo Registration Requests
  const [registrationRequests, setRegistrationRequests] = useState([
    {
      id: 'REG-2026-101',
      studentName: 'Muhammad Hamza',
      regNo: 'BSCS-F23-018',
      program: 'BS Computer Science',
      semester: 'Semester 6',
      totalCredits: 18,
      courses: [
        { code: 'CS-301', title: 'Design & Analysis of Algorithms', cr: 3, section: 'A' },
        { code: 'CS-305', title: 'Software Engineering Methodologies', cr: 3, section: 'B' },
        { code: 'CS-308', title: 'Artificial Intelligence & Neural Nets', cr: 4, section: 'A' },
        { code: 'CS-312', title: 'Database Systems & Warehousing', cr: 4, section: 'A' },
        { code: 'HU-201', title: 'Technical & Business Writing', cr: 3, section: 'C' },
        { code: 'CS-399', title: 'Junior Project Laboratory', cr: 1, section: 'A' }
      ],
      advisorStatus: 'Approved',
      advisorName: 'Dr. Nadia Hashmi',
      status: 'Approved',
      submissionDate: '2026-10-24'
    },
    {
      id: 'REG-2026-102',
      studentName: 'Zainab Fatima',
      regNo: 'BSSE-F23-042',
      program: 'BS Software Engineering',
      semester: 'Semester 6',
      totalCredits: 17,
      courses: [
        { code: 'SE-302', title: 'Software Architecture & Design', cr: 3, section: 'A' },
        { code: 'SE-307', title: 'Web Application Frameworks', cr: 4, section: 'B' },
        { code: 'CS-301', title: 'Design & Analysis of Algorithms', cr: 3, section: 'A' },
        { code: 'MS-204', title: 'Probability & Statistics for Computing', cr: 3, section: 'C' },
        { code: 'SE-320', title: 'Cloud DevOps Pipelines', cr: 4, section: 'A' }
      ],
      advisorStatus: 'Pending Review',
      advisorName: 'Prof. Tariq Jamil',
      status: 'Pending',
      submissionDate: '2026-10-28'
    },
    {
      id: 'REG-2026-103',
      studentName: 'Daniyal Qureshi',
      regNo: 'BBA-F24-009',
      program: 'Bachelor of Business Admin (BBA)',
      semester: 'Semester 4',
      totalCredits: 15,
      courses: [
        { code: 'FIN-201', title: 'Corporate Finance & Valuation', cr: 3, section: 'A' },
        { code: 'MKT-202', title: 'Consumer Behavior & Brand Marketing', cr: 3, section: 'A' },
        { code: 'MGT-205', title: 'Operations & Supply Chain', cr: 3, section: 'B' },
        { code: 'ECO-203', title: 'Macroeconomic Analysis', cr: 3, section: 'A' },
        { code: 'IT-105', title: 'Business Analytics with Python', cr: 3, section: 'C' }
      ],
      advisorStatus: 'Approved',
      advisorName: 'Dr. Shahzad Rafiq',
      status: 'Approved',
      submissionDate: '2026-10-22'
    },
    {
      id: 'REG-2026-104',
      studentName: 'Ammar Sheikh',
      regNo: 'BSAI-F25-014',
      program: 'BS Artificial Intelligence',
      semester: 'Semester 2',
      totalCredits: 21,
      courses: [
        { code: 'AI-101', title: 'Fundamentals of Artificial Intelligence', cr: 3, section: 'A' },
        { code: 'CS-102', title: 'Object Oriented Programming', cr: 4, section: 'A' },
        { code: 'MT-102', title: 'Multivariable Calculus & Linear Algebra', cr: 4, section: 'B' },
        { code: 'PHY-101', title: 'Applied Physics & Semiconductors', cr: 4, section: 'A' },
        { code: 'HU-102', title: 'Pakistan Studies & Islamic Thought', cr: 3, section: 'C' },
        { code: 'AI-103', title: 'Python for Data Sciences Lab', cr: 3, section: 'A' }
      ],
      advisorStatus: 'Overload Flagged',
      advisorName: 'Dr. Nadia Hashmi',
      status: 'Dean Approval Required',
      submissionDate: '2026-10-29'
    }
  ])

  // Course Quotas & Capacities
  const [courseQuotas, setCourseQuotas] = useState([
    { code: 'CS-301', title: 'Design & Analysis of Algorithms', cr: 3, enrolled: 84, capacity: 90, instructor: 'Dr. Nadia Hashmi', venue: 'Lecture Hall 1' },
    { code: 'SE-302', title: 'Software Architecture & Design', cr: 3, enrolled: 68, capacity: 75, instructor: 'Prof. Tariq Jamil', venue: 'Seminar Hall 2' },
    { code: 'CS-308', title: 'Artificial Intelligence & Neural Nets', cr: 4, enrolled: 88, capacity: 90, instructor: 'Dr. Nadia Hashmi', venue: 'AI Lab Complex' },
    { code: 'FIN-201', title: 'Corporate Finance & Valuation', cr: 3, enrolled: 52, capacity: 60, instructor: 'Dr. Shahzad Rafiq', venue: 'Business Wing R-102' },
    { code: 'SE-320', title: 'Cloud DevOps Pipelines', cr: 4, enrolled: 59, capacity: 60, instructor: 'Engr. Salman Farooq', venue: 'Cloud Compute Lab' }
  ])

  // New Enrollment Form State
  const [formData, setFormData] = useState({
    studentName: '',
    regNo: '',
    program: 'BS Computer Science',
    semester: 'Semester 4',
    totalCredits: 18,
    advisorName: 'Dr. Nadia Hashmi'
  })

  // Filtered requests
  const filteredRequests = registrationRequests.filter(req => {
    const matchesSearch = 
      req.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.program.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProgram = programFilter === 'ALL' || req.program.includes(programFilter)
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter
    return matchesSearch && matchesProgram && matchesStatus
  })

  const handleApprove = (id) => {
    setRegistrationRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { ...req, status: 'Approved', advisorStatus: 'Approved' }
      }
      return req
    }))
    toast.success('Course registration approved. Student study plan locked and synced with attendance ledger.')
  }

  const handleCreateEnrollment = (e) => {
    e.preventDefault()
    if (!formData.studentName || !formData.regNo) {
      toast.error('Please enter student name and CMS registration number.')
      return
    }

    const newReq = {
      id: `REG-2026-${Math.floor(100 + Math.random() * 900)}`,
      studentName: formData.studentName,
      regNo: formData.regNo,
      program: formData.program,
      semester: formData.semester,
      totalCredits: Number(formData.totalCredits),
      courses: [
        { code: 'CS-301', title: 'Design & Analysis of Algorithms', cr: 3, section: 'A' },
        { code: 'CS-308', title: 'Artificial Intelligence & Neural Nets', cr: 4, section: 'A' }
      ],
      advisorStatus: 'Approved',
      advisorName: formData.advisorName,
      status: 'Approved',
      submissionDate: new Date().toISOString().split('T')[0]
    }

    setRegistrationRequests([newReq, ...registrationRequests])
    setIsEnrollModalOpen(false)
    setFormData({
      studentName: '',
      regNo: '',
      program: 'BS Computer Science',
      semester: 'Semester 4',
      totalCredits: 18,
      advisorName: 'Dr. Nadia Hashmi'
    })
    toast.success('Undergraduate course enrollment created successfully.')
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-200 border border-purple-400/30">
              HEC Semester Credit System
            </span>
            <span className="text-xs text-purple-200/80">• Fall 2026 Enrollment Window</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Course Registration & Enrollment</h1>
          <p className="text-sm text-purple-200/90 max-w-2xl">
            Undergraduate course adds/drops, advisor approvals, pre-requisite enforcement, and credit hour caps (15–21 Cr. Hrs).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsEnrollModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Course Enrollment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Enrollment</span>
            <FileCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">462 Students</div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 94.8% Registered for Fall 2026
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Advisor Review</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">8 Requests</div>
          <div className="text-xs text-amber-600 font-medium">Pending Dean / Advisor Clearance</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Credit Overload</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">3 Students</div>
          <div className="text-xs text-rose-600 font-medium">&gt; 18 Credit Hours (CGPA ≥ 3.50 Req.)</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course Sections</span>
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">38 Sections</div>
          <div className="text-xs text-slate-500 font-medium">Average 88% seat capacity</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Student Registration Requests</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
            {registrationRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'courses'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Course Quotas & Capacities</span>
        </button>
      </div>

      {/* Tab 1: Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search student, CMS ID, or program..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Degree Programs</option>
                <option value="Computer Science">BS Computer Science</option>
                <option value="Software Engineering">BS Software Engineering</option>
                <option value="Artificial Intelligence">BS Artificial Intelligence</option>
                <option value="Business Admin">BBA</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Dean Approval Required">Dean Overload Flagged</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Student & CMS ID</th>
                    <th className="py-3.5 px-4">Degree Program</th>
                    <th className="py-3.5 px-4">Credit Hours</th>
                    <th className="py-3.5 px-4">Registered Courses</th>
                    <th className="py-3.5 px-4">Advisor Status</th>
                    <th className="py-3.5 px-4">Overall Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-purple-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{req.studentName}</div>
                        <div className="text-[11px] font-mono text-purple-700 font-semibold">{req.regNo}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>{req.program}</div>
                        <div className="text-[11px] text-slate-400">{req.semester}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-xs ${
                          req.totalCredits > 18 
                            ? 'bg-rose-100 text-rose-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {req.totalCredits} Cr. Hrs
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {req.courses.map(c => (
                            <span key={c.code} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-semibold" title={c.title}>
                              {c.code} ({c.cr})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-semibold">{req.advisorStatus}</div>
                        <div className="text-[11px] text-slate-400">{req.advisorName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          req.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {req.status === 'Approved' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {req.status !== 'Approved' ? (
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Locked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        No registration requests match the active filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Course Quotas */}
      {activeTab === 'courses' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Course Section Quotas & Hall Allotments</h3>
            <span className="text-xs text-slate-500 font-medium">Fall 2026 Semester</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Course Code & Title</th>
                  <th className="py-3.5 px-4">Credit Hours</th>
                  <th className="py-3.5 px-4">Instructor</th>
                  <th className="py-3.5 px-4">Venue</th>
                  <th className="py-3.5 px-4">Capacity Utilization</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {courseQuotas.map((cq) => {
                  const percentage = Math.round((cq.enrolled / cq.capacity) * 100)
                  return (
                    <tr key={cq.code} className="hover:bg-purple-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{cq.title}</div>
                        <div className="text-[11px] font-mono text-purple-700 font-semibold">{cq.code}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold">{cq.cr} Cr. Hrs</td>
                      <td className="py-3.5 px-4">{cq.instructor}</td>
                      <td className="py-3.5 px-4 text-slate-500">{cq.venue}</td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-600">
                            <span>{cq.enrolled} / {cq.capacity} Enrolled</span>
                            <span>{percentage}%</span>
                          </div>
                          <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${percentage > 90 ? 'bg-rose-500' : 'bg-purple-600'}`} 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          percentage >= 100 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {percentage >= 100 ? 'Section Full' : 'Seats Open'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Course Enrollment */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Register Undergraduate Course Plan"
      >
        <form onSubmit={handleCreateEnrollment} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Student Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Daniyal Qureshi"
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">CMS Registration No</label>
              <input
                type="text"
                required
                placeholder="e.g. BSCS-F23-099"
                value={formData.regNo}
                onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Total Credit Hours</label>
              <input
                type="number"
                min="12"
                max="24"
                value={formData.totalCredits}
                onChange={(e) => setFormData({ ...formData, totalCredits: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Degree Program</label>
            <select
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="BS Computer Science">BS Computer Science (4 Years)</option>
              <option value="BS Software Engineering">BS Software Engineering (4 Years)</option>
              <option value="BS Artificial Intelligence">BS Artificial Intelligence (4 Years)</option>
              <option value="Bachelor of Business Admin (BBA)">Bachelor of Business Administration (BBA)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Academic Advisor</label>
            <input
              type="text"
              value={formData.advisorName}
              onChange={(e) => setFormData({ ...formData, advisorName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEnrollModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              Confirm Course Registration
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default UniversityCourseRegistrationView

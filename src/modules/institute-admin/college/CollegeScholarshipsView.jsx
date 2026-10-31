import React, { useState } from 'react'
import { 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download, 
  Plus, 
  DollarSign, 
  GraduationCap, 
  FileText,
  Percent,
  Award
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const CollegeScholarshipsView = ({ currentInstitute }) => {
  const { students = [] } = useAppData()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('active') // 'active' | 'applications' | 'ledger'
  const [searchQuery, setSearchQuery] = useState('')
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)

  // Demo Scholarships Data
  const [scholarships, setScholarships] = useState([
    {
      id: 'SCH-2026-001',
      studentName: 'Amina Batool',
      rollNo: 'COL-24-002',
      discipline: 'F.Sc Pre-Medical (Part II)',
      matricPercentage: '96.2%',
      category: 'Matric Board Topper',
      waiverPercentage: '100% Full Waiver',
      tuitionWaived: 18000,
      approvedDate: '2025-09-01',
      status: 'Active'
    },
    {
      id: 'SCH-2026-002',
      studentName: 'Zubair Akram',
      rollNo: 'COL-24-031',
      discipline: 'F.Sc Pre-Engineering',
      matricPercentage: '91.5%',
      category: 'Academic Merit 90%+',
      waiverPercentage: '50% Half Fee',
      tuitionWaived: 9000,
      approvedDate: '2025-09-05',
      status: 'Active'
    },
    {
      id: 'SCH-2026-003',
      studentName: 'Farhan Zaidi',
      rollNo: 'COL-25-112',
      discipline: 'ICS - Computer Science (Part I)',
      matricPercentage: '88.0%',
      category: 'Kinship Concession',
      waiverPercentage: '25% Sibling Waiver',
      tuitionWaived: 4500,
      approvedDate: '2026-09-10',
      status: 'Active'
    },
    {
      id: 'SCH-2026-004',
      studentName: 'Hamid Raza',
      rollNo: 'COL-25-140',
      discipline: 'I.Com (Commerce)',
      matricPercentage: '84.5%',
      category: 'Sports Quota (Cricket National)',
      waiverPercentage: '75% Sports Grant',
      tuitionWaived: 11250,
      approvedDate: '2026-09-12',
      status: 'Active'
    }
  ])

  // Demo Pending Applications
  const [applications, setApplications] = useState([
    {
      id: 'APP-901',
      studentName: 'Bilal Shahid',
      rollNo: 'COL-25-188',
      discipline: 'F.Sc Pre-Medical (Part I)',
      matricPercentage: '93.8%',
      requestedCategory: 'Merit-Based Scholarship',
      guardianMonthlyIncome: 'PKR 45,000',
      submissionDate: '2026-10-24',
      status: 'Under Review'
    },
    {
      id: 'APP-902',
      studentName: 'Sanaullah Sheikh',
      rollNo: 'COL-25-204',
      discipline: 'ICS - Mathematics',
      matricPercentage: '89.4%',
      requestedCategory: 'Need-Based Financial Aid',
      guardianMonthlyIncome: 'PKR 35,000',
      submissionDate: '2026-10-28',
      status: 'Under Review'
    }
  ])

  const [formData, setFormData] = useState({
    studentName: '',
    rollNo: '',
    discipline: 'F.Sc Pre-Medical',
    matricPercentage: '',
    category: 'Academic Merit 90%+',
    waiverPercentage: '50% Half Fee',
    tuitionWaived: 9000
  })

  const handleApprove = (appId) => {
    const app = applications.find(a => a.id === appId)
    if (!app) return

    const newSch = {
      id: `SCH-2026-00${scholarships.length + 1}`,
      studentName: app.studentName,
      rollNo: app.rollNo,
      discipline: app.discipline,
      matricPercentage: app.matricPercentage,
      category: app.requestedCategory,
      waiverPercentage: '50% Half Fee',
      tuitionWaived: 9000,
      approvedDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    }

    setScholarships([newSch, ...scholarships])
    setApplications(applications.filter(a => a.id !== appId))
    toast({ title: 'Application Approved', message: `Scholarship granted to ${app.studentName}`, type: 'success' })
  }

  const handleReject = (appId) => {
    setApplications(applications.filter(a => a.id !== appId))
    toast({ title: 'Application Rejected', message: 'Scholarship request declined', type: 'info' })
  }

  const handleManualGrant = (e) => {
    e.preventDefault()
    if (!formData.studentName || !formData.rollNo) {
      toast({ title: 'Error', message: 'Student details required', type: 'error' })
      return
    }

    const newSch = {
      id: `SCH-2026-00${scholarships.length + 1}`,
      studentName: formData.studentName,
      rollNo: formData.rollNo,
      discipline: formData.discipline,
      matricPercentage: formData.matricPercentage || '90.0%',
      category: formData.category,
      waiverPercentage: formData.waiverPercentage,
      tuitionWaived: parseInt(formData.tuitionWaived) || 9000,
      approvedDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    }

    setScholarships([newSch, ...scholarships])
    setIsApplyModalOpen(false)
    setFormData({ studentName: '', rollNo: '', discipline: 'F.Sc Pre-Medical', matricPercentage: '', category: 'Academic Merit 90%+', waiverPercentage: '50% Half Fee', tuitionWaived: 9000 })
    toast({ title: 'Scholarship Awarded', message: `Waiver active for ${newSch.studentName}`, type: 'success' })
  }

  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,ID,Student,Roll No,Discipline,Category,Waiver,Monthly Waived (PKR),Status\n'
    scholarships.forEach(s => {
      csvContent += `"${s.id}","${s.studentName}","${s.rollNo}","${s.discipline}","${s.category}","${s.waiverPercentage}",${s.tuitionWaived},"${s.status}"\n`
    })
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'college_scholarships_roster.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: 'CSV Exported', message: 'Scholarship beneficiaries exported', type: 'success' })
  }

  const totalMonthlyWaived = scholarships.reduce((sum, s) => sum + s.tuitionWaived, 0)

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-indigo-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide uppercase text-emerald-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Financial Aid & Merit Recognitions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Scholarships & Fee Concessions
            </h1>
            <p className="text-sm text-emerald-100/90 mt-1 max-w-2xl">
              Merit waivers for board toppers, sports quota admissions, kinship concessions, and need-based financial aid for {currentInstitute?.name || 'College Campus'}.
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
              onClick={() => setIsApplyModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs tracking-wide transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>Grant Scholarship</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Beneficiaries</div>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">{scholarships.length} Students</div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Enrolled in current session
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Waivers</div>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">PKR {totalMonthlyWaived.toLocaleString()}</div>
            <div className="text-[11px] font-semibold text-indigo-600 mt-1">
              Subsidized by college trust
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Reviews</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{applications.length} Requests</div>
            <div className="text-[11px] font-semibold text-amber-700 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Need committee approval
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Merit Ratio</div>
            <div className="text-2xl font-extrabold text-purple-700 mt-1">90%+</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">
              Matric board criteria
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'active', label: `Active Scholarship Awards (${scholarships.length})` },
              { id: 'applications', label: `Pending Inquiries & Applications (${applications.length})` },
              { id: 'ledger', label: 'Waiver Audit Ledger' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search scholar name, roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>
        </div>

        {/* Tab 1: Active Awards */}
        {activeTab === 'active' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Award ID</th>
                  <th className="py-3 px-4">Student & College Roll</th>
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-4">Matric Score</th>
                  <th className="py-3 px-4">Scholarship Category</th>
                  <th className="py-3 px-4">Waiver Granted</th>
                  <th className="py-3 px-4">Monthly Concession</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {scholarships.map(sch => (
                  <tr key={sch.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{sch.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{sch.studentName}</div>
                      <div className="text-[11px] text-purple-600 font-mono font-semibold">{sch.rollNo}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{sch.discipline}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">{sch.matricPercentage}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[11px] bg-slate-100 text-slate-800">
                        {sch.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-indigo-700">{sch.waiverPercentage}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      PKR {sch.tuitionWaived.toLocaleString()} <span className="text-slate-400 font-normal">/ mo</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {sch.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Applications */}
        {activeTab === 'applications' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">App ID</th>
                  <th className="py-3 px-4">Applicant & Roll</th>
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-4">Matric Marks</th>
                  <th className="py-3 px-4">Category Requested</th>
                  <th className="py-3 px-4">Guardian Income</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400 font-medium">
                      No pending scholarship applications at this time.
                    </td>
                  </tr>
                ) : (
                  applications.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">{app.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{app.studentName}</div>
                        <div className="text-[11px] text-purple-600 font-mono">{app.rollNo}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{app.discipline}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">{app.matricPercentage}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{app.requestedCategory}</td>
                      <td className="py-3.5 px-4 text-slate-600">{app.guardianMonthlyIncome}</td>
                      <td className="py-3.5 px-4 text-slate-500">{app.submissionDate}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(app.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(app.id)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-[11px] inline-flex items-center cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Ledger */}
        {activeTab === 'ledger' && (
          <div className="p-4 bg-slate-50 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-bold">Total Annual College Scholarship Commitment:</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                PKR {(totalMonthlyWaived * 12).toLocaleString()} / year
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden flex">
              <div className="bg-emerald-500 h-2.5" style={{ width: '60%' }} title="Merit Toppers (60%)"></div>
              <div className="bg-indigo-500 h-2.5" style={{ width: '25%' }} title="Need-based (25%)"></div>
              <div className="bg-amber-500 h-2.5" style={{ width: '15%' }} title="Sports & Kinship (15%)"></div>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500 pt-1">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Board Merit (60%)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Financial Aid (25%)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Kinship & Sports (15%)</div>
            </div>
          </div>
        )}
      </div>

      {/* Grant Scholarship Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Grant College Scholarship / Fee Concession"
      >
        <form onSubmit={handleManualGrant} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name</label>
              <input
                type="text"
                placeholder="e.g. Daniyal Khan"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">College Roll Number</label>
              <input
                type="text"
                placeholder="e.g. COL-25-199"
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Discipline</label>
              <select
                value={formData.discipline}
                onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 bg-white"
              >
                <option value="F.Sc Pre-Medical">F.Sc Pre-Medical</option>
                <option value="F.Sc Pre-Engineering">F.Sc Pre-Engineering</option>
                <option value="ICS - Computer Science">ICS - Computer Science</option>
                <option value="I.Com (Commerce)">I.Com (Commerce)</option>
                <option value="ADP - Business Admin">ADP - Business Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Matric Board Percentage</label>
              <input
                type="text"
                placeholder="e.g. 94.5%"
                value={formData.matricPercentage}
                onChange={(e) => setFormData({ ...formData, matricPercentage: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Scholarship Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 bg-white"
              >
                <option value="Matric Board Topper">Matric Board Topper (100% Free)</option>
                <option value="Academic Merit 90%+">Academic Merit 90%+ (50% Concession)</option>
                <option value="Sports Quota (Cricket/Athletics)">Sports Quota Grant</option>
                <option value="Kinship Concession">Kinship (Sibling Discount)</option>
                <option value="Need-Based Financial Aid">Need-Based Financial Aid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Tuition Waived (PKR)</label>
              <input
                type="number"
                placeholder="e.g. 9000"
                value={formData.tuitionWaived}
                onChange={(e) => setFormData({ ...formData, tuitionWaived: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow-md"
            >
              Confirm Award
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default CollegeScholarshipsView

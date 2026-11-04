import React, { useState, useEffect } from 'react'
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  FileWarning, 
  Users, 
  Download, 
  Plus, 
  Printer, 
  Clock, 
  BadgeAlert,
  UserCheck
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const CollegeDisciplineView = ({ currentInstitute }) => {
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('incidents') // 'incidents' | 'notices' | 'council'
  const [searchQuery, setSearchQuery] = useState('')
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false)


  // Demo Disciplinary Incidents
  const DEFAULT_INCIDENTS = [
    {
      id: 'DISC-2026-101',
      studentName: 'Usman Ghani',
      rollNo: 'COL-24-055',
      discipline: 'F.Sc Pre-Engineering (Part II)',
      incidentDate: '2026-10-26',
      category: 'Attendance Shortage (<75%)',
      severity: 'Moderate',
      proctorInCharge: 'Prof. Tariq Jamil',
      actionTaken: 'Warning Issued & Parent Summons',
      status: 'Active Follow-up'
    },
    {
      id: 'DISC-2026-102',
      studentName: 'Zeeshan Ali',
      rollNo: 'COL-25-012',
      discipline: 'ICS - Computer Science (Part I)',
      incidentDate: '2026-10-22',
      category: 'College Dress Code & Missing ID Card',
      severity: 'Minor',
      proctorInCharge: 'Dr. Nadia Hashmi',
      actionTaken: 'Fine Imposed (PKR 500) & Recorded',
      status: 'Resolved'
    },
    {
      id: 'DISC-2026-103',
      studentName: 'Haris Qureshi',
      rollNo: 'COL-24-119',
      discipline: 'I.Com (Commerce)',
      incidentDate: '2026-10-18',
      category: 'Classroom Disruption & Misconduct',
      severity: 'Major',
      proctorInCharge: 'Chief Proctor Col. (R) Arshad',
      actionTaken: '3-Day Suspension & Show-Cause Hearing',
      status: 'Committee Review'
    }
  ]

  // Demo Show-Cause Notices
  const DEFAULT_NOTICES = [
    {
      id: 'SCN-2026-08',
      studentName: 'Haris Qureshi',
      rollNo: 'COL-24-119',
      issuedDate: '2026-10-19',
      hearingDate: '2026-10-25',
      charges: 'Violation of College Student Code of Conduct Rule 4.2',
      committeeDecision: 'Written Apology & Strict Probation',
      status: 'Completed'
    },
    {
      id: 'SCN-2026-09',
      studentName: 'Sheraz Mehmood',
      rollNo: 'COL-25-090',
      issuedDate: '2026-10-28',
      hearingDate: '2026-11-04',
      charges: 'Chronic Truancy & Unauthorized Campus Leave',
      committeeDecision: 'Pending Hearing with Parents',
      status: 'Scheduled'
    }
  ]

  const instId = currentInstitute?.id || 'default'
  const disciplineStorageKey = `sms_discipline_data_${instId}`

  const [disciplineData, setDisciplineData] = useState(() => {
    try {
      const saved = localStorage.getItem(disciplineStorageKey)
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      incidents: DEFAULT_INCIDENTS,
      notices: DEFAULT_NOTICES
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(disciplineStorageKey, JSON.stringify(disciplineData))
    } catch {}
  }, [disciplineData, disciplineStorageKey])

  const incidents = disciplineData.incidents || DEFAULT_INCIDENTS
  const notices = disciplineData.notices || DEFAULT_NOTICES

  const setIncidents = (updater) => {
    setDisciplineData(prev => ({
      ...prev,
      incidents: typeof updater === 'function' ? updater(prev.incidents || DEFAULT_INCIDENTS) : updater
    }))
  }

  const setNotices = (updater) => {
    setDisciplineData(prev => ({
      ...prev,
      notices: typeof updater === 'function' ? updater(prev.notices || DEFAULT_NOTICES) : updater
    }))
  }


  // Demo Proctorial Board
  const proctors = [
    { name: 'Dr. Tariq Jamil', designation: 'Chief Proctor', department: 'Mathematics', duties: 'Morning Assembly & Campus Perimeter' },
    { name: 'Dr. Nadia Hashmi', designation: 'Deputy Proctor (Girls Wing)', department: 'Chemistry', duties: 'Cafeteria & Common Rooms' },
    { name: 'Syed Ali Raza', designation: 'Staff Proctor', department: 'Physics', duties: 'Laboratory Complex & Gate 2' },
    { name: 'Ahmad Bilal (Head Boy)', designation: 'Senior Student Proctor', department: 'F.Sc Pre-Med (Part II)', duties: 'Student Discipline Liaison' }
  ]

  const [formData, setFormData] = useState({
    studentName: '',
    rollNo: '',
    discipline: 'F.Sc Pre-Medical',
    category: 'College Dress Code & Missing ID Card',
    severity: 'Minor',
    proctorInCharge: 'Dr. Tariq Jamil',
    actionTaken: 'Formal Warning Issued'
  })

  const handleAddIncident = (e) => {
    e.preventDefault()
    if (!formData.studentName || !formData.rollNo) {
      toast({ title: 'Validation', message: 'Name and Roll No are required', type: 'error' })
      return
    }

    const newInc = {
      id: `DISC-2026-${Math.floor(100 + Math.random() * 900)}`,
      studentName: formData.studentName,
      rollNo: formData.rollNo,
      discipline: formData.discipline,
      incidentDate: new Date().toISOString().split('T')[0],
      category: formData.category,
      severity: formData.severity,
      proctorInCharge: formData.proctorInCharge,
      actionTaken: formData.actionTaken,
      status: 'Active Follow-up'
    }

    setIncidents([newInc, ...incidents])
    setIsIncidentModalOpen(false)
    setFormData({ studentName: '', rollNo: '', discipline: 'F.Sc Pre-Medical', category: 'College Dress Code & Missing ID Card', severity: 'Minor', proctorInCharge: 'Dr. Tariq Jamil', actionTaken: 'Formal Warning Issued' })
    toast({ title: 'Incident Logged', message: `Discipline report created for ${newInc.studentName}`, type: 'warning' })
  }

  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Incident ID,Student,Roll No,Discipline,Date,Category,Severity,Proctor,Action,Status\n'
    incidents.forEach(i => {
      csvContent += `"${i.id}","${i.studentName}","${i.rollNo}","${i.discipline}","${i.incidentDate}","${i.category}","${i.severity}","${i.proctorInCharge}","${i.actionTaken}","${i.status}"\n`
    })
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'college_disciplinary_records.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: 'Records Exported', message: 'Disciplinary records saved to CSV', type: 'success' })
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-rose-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide uppercase text-rose-300 mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Proctorial Board & Campus Conduct</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Student Affairs & Discipline
            </h1>
            <p className="text-sm text-slate-200 mt-1 max-w-2xl">
              Proctorial council oversight, student code of conduct enforcement, show-cause hearings, and attendance warning registries for {currentInstitute?.name || 'College Campus'}.
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
              onClick={() => setIsIncidentModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs tracking-wide transition-all cursor-pointer shadow-lg hover:shadow-rose-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>Log Incident</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Recorded</div>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">{incidents.length} Incidents</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">Current Academic Term</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <FileWarning className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Show-Cause Notices</div>
            <div className="text-2xl font-extrabold text-rose-600 mt-1">{notices.length} Issued</div>
            <div className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> 1 Hearing Scheduled
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <BadgeAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Proctorial Council</div>
            <div className="text-2xl font-extrabold text-indigo-700 mt-1">{proctors.length} Officers</div>
            <div className="text-[11px] font-semibold text-indigo-600 mt-1 flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Faculty & Senior Prefects
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Resolution Rate</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">94.8%</div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Zero Repeat Offenses
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'incidents', label: `Disciplinary Incident Log (${incidents.length})` },
              { id: 'notices', label: `Show-Cause Notices & Hearings (${notices.length})` },
              { id: 'council', label: 'Proctorial Board Council' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-rose-600 text-white shadow-xs'
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
              placeholder="Search student or roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 outline-none"
            />
          </div>
        </div>

        {/* Tab 1: Incident Log */}
        {activeTab === 'incidents' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Student & College Roll</th>
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-4">Incident Category</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Reporting Proctor</th>
                  <th className="py-3 px-4">Action Imposed</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {incidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{inc.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{inc.studentName}</div>
                      <div className="text-[11px] text-rose-600 font-mono font-semibold">{inc.rollNo}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{inc.discipline}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{inc.category}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inc.severity === 'Major' ? 'bg-rose-100 text-rose-800' :
                        inc.severity === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">{inc.proctorInCharge}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{inc.actionTaken}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {inc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Show-Cause Notices */}
        {activeTab === 'notices' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Notice ID</th>
                  <th className="py-3 px-4">Student Name & Roll</th>
                  <th className="py-3 px-4">Issued Date</th>
                  <th className="py-3 px-4">Hearing Date</th>
                  <th className="py-3 px-4">Particulars of Charges</th>
                  <th className="py-3 px-4">Proctorial Decision</th>
                  <th className="py-3 px-4 text-right">Print Notice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {notices.map(n => (
                  <tr key={n.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-600">{n.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{n.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{n.rollNo}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{n.issuedDate}</td>
                    <td className="py-3.5 px-4 font-bold text-rose-700">{n.hearingDate}</td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs">{n.charges}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{n.committeeDecision}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toast({ title: 'Notice Printed', message: `Official show-cause summons printed for ${n.studentName}`, type: 'info' })}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
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

        {/* Tab 3: Proctorial Board */}
        {activeTab === 'council' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proctors.map((proc, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{proc.name}</div>
                  <div className="text-xs font-semibold text-purple-600">{proc.designation} • {proc.department}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Area of Jurisdiction: {proc.duties}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Incident Modal */}
      <Modal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        title="Log Student Disciplinary Infraction"
      >
        <form onSubmit={handleAddIncident} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name</label>
              <input
                type="text"
                placeholder="e.g. Asad Mehmood"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-rose-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">College Roll No</label>
              <input
                type="text"
                placeholder="e.g. COL-25-081"
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-rose-600"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Infraction Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-rose-600 bg-white"
              >
                <option value="College Dress Code & Missing ID Card">College Dress Code / Missing ID</option>
                <option value="Attendance Shortage (<75%)">Chronic Attendance Shortage</option>
                <option value="Classroom Disruption & Misconduct">Classroom Disruption</option>
                <option value="Bunking Lectures / Campus Gate Violation">Bunking / Truancy</option>
                <option value="Examination Malpractice">Examination Irregularity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Severity Level</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-rose-600 bg-white"
              >
                <option value="Minor">Minor (First Infraction)</option>
                <option value="Moderate">Moderate (Parental Notification)</option>
                <option value="Major">Major (Show-Cause Committee)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Action Imposed / Sanction</label>
            <input
              type="text"
              placeholder="e.g. Formal Warning & Guardian Written Undertaking"
              value={formData.actionTaken}
              onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-rose-600"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsIncidentModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shadow-md"
            >
              Confirm Log
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default CollegeDisciplineView

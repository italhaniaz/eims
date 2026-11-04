import React, { useState, useEffect } from 'react'
import { 
  Briefcase, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Clock, 
  GraduationCap, 
  CheckCircle2, 
  Building2, 
  Plus, 
  Users, 
  Award, 
  Calendar, 
  ExternalLink,
  MapPin,
  TrendingUp,
  Mail
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const UniversityCareerAlumniView = ({ currentInstitute }) => {
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('drives') // 'drives' | 'internships' | 'alumni'
  const [searchQuery, setSearchQuery] = useState('')
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false)


  // Demo Recruitment Drives
  const DEFAULT_RECRUITMENT_DRIVES = [
    {
      id: 'DRV-2026-01',
      company: 'Systems Limited',
      role: 'Associate Software Engineers & Cloud Analysts',
      eligibility: 'BSCS & BSSE (Min CGPA 3.00)',
      driveDate: '2026-11-14',
      venue: 'Main Auditorium & CS Labs 1-4',
      openings: 25,
      appliedCount: 84,
      status: 'Registration Open',
      deadline: '2026-11-10'
    },
    {
      id: 'DRV-2026-02',
      company: 'Netsol Technologies',
      role: 'Full Stack Developers (React / .NET Core)',
      eligibility: 'BSCS, BSSE (Graduating Batch 2026)',
      driveDate: '2026-11-21',
      venue: 'Software Engineering Wing',
      openings: 18,
      appliedCount: 62,
      status: 'Confirmed',
      deadline: '2026-11-18'
    },
    {
      id: 'DRV-2026-03',
      company: 'Jazz (Telecom & FinTech)',
      role: 'Data Science & BI Trainee Officers',
      eligibility: 'BS AI, BSCS, BBA Data Analytics',
      driveDate: '2026-12-05',
      venue: 'Business Incubation Center',
      openings: 12,
      appliedCount: 91,
      status: 'Upcoming',
      deadline: '2026-11-30'
    }
  ]

  // Demo Internships
  const DEFAULT_INTERNSHIPS = [
    {
      id: 'INT-2026-001',
      studentName: 'Muhammad Hamza',
      regNo: 'BSCS-F23-018',
      company: 'Arbisoft Lahore',
      role: 'Python Backend Intern',
      duration: '8 Weeks (Summer 2026)',
      evaluationScore: 'A (Outstanding)',
      hecMandatoryCleared: true
    },
    {
      id: 'INT-2026-002',
      studentName: 'Zainab Fatima',
      regNo: 'BSSE-F23-042',
      company: 'Afiniti Pakistan',
      role: 'QA & Automation Intern',
      duration: '8 Weeks (Summer 2026)',
      evaluationScore: 'A- (Excellent)',
      hecMandatoryCleared: true
    },
    {
      id: 'INT-2026-003',
      studentName: 'Daniyal Qureshi',
      regNo: 'BBA-F24-009',
      company: 'Engro Fertilizers',
      role: 'Supply Chain Operations Trainee',
      duration: '6 Weeks (Summer 2026)',
      evaluationScore: 'A (Outstanding)',
      hecMandatoryCleared: true
    }
  ]

  // Demo Alumni Directory
  const DEFAULT_ALUMNI = [
    {
      id: 'ALM-2024-01',
      name: 'Farhan Zaidi',
      degree: 'BS Computer Science (Class of 2024)',
      currentCompany: 'Amazon Web Services (AWS)',
      position: 'Cloud Support Engineer',
      location: 'Dubai, UAE',
      isMentor: true
    },
    {
      id: 'ALM-2023-02',
      name: 'Ayesha Siddiqua',
      degree: 'BS Software Engineering (Class of 2023)',
      currentCompany: 'Careem / Uber',
      position: 'Senior Frontend Engineer',
      location: 'Lahore, Pakistan',
      isMentor: true
    },
    {
      id: 'ALM-2022-03',
      name: 'Bilal Hassan',
      degree: 'Bachelor of Business Admin (Class of 2022)',
      currentCompany: 'Habib Bank Limited (HBL)',
      position: 'Manager Corporate Strategy',
      location: 'Karachi, Pakistan',
      isMentor: false
    }
  ]

  const instId = currentInstitute?.id || 'default'
  const careerStorageKey = `sms_career_alumni_${instId}`

  const [careerData, setCareerData] = useState(() => {
    try {
      const saved = localStorage.getItem(careerStorageKey)
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      recruitmentDrives: DEFAULT_RECRUITMENT_DRIVES,
      internships: DEFAULT_INTERNSHIPS,
      alumni: DEFAULT_ALUMNI
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(careerStorageKey, JSON.stringify(careerData))
    } catch {}
  }, [careerData, careerStorageKey])

  const recruitmentDrives = careerData.recruitmentDrives || DEFAULT_RECRUITMENT_DRIVES
  const internships = careerData.internships || DEFAULT_INTERNSHIPS
  const alumni = careerData.alumni || DEFAULT_ALUMNI

  const setRecruitmentDrives = (updater) => {
    setCareerData(prev => ({
      ...prev,
      recruitmentDrives: typeof updater === 'function' ? updater(prev.recruitmentDrives || DEFAULT_RECRUITMENT_DRIVES) : updater
    }))
  }

  const setInternships = (updater) => {
    setCareerData(prev => ({
      ...prev,
      internships: typeof updater === 'function' ? updater(prev.internships || DEFAULT_INTERNSHIPS) : updater
    }))
  }

  const setAlumni = (updater) => {
    setCareerData(prev => ({
      ...prev,
      alumni: typeof updater === 'function' ? updater(prev.alumni || DEFAULT_ALUMNI) : updater
    }))
  }


  const [formData, setFormData] = useState({
    company: '',
    role: '',
    eligibility: 'BSCS & BSSE (Min CGPA 3.00)',
    driveDate: '2026-11-25',
    openings: 15,
    venue: 'Executive Seminar Hall'
  })

  const handleAddDrive = (e) => {
    e.preventDefault()
    if (!formData.company || !formData.role) {
      toast.error('Please enter company name and job role.')
      return
    }

    const newDrive = {
      id: `DRV-2026-${Math.floor(10 + Math.random() * 90)}`,
      company: formData.company,
      role: formData.role,
      eligibility: formData.eligibility,
      driveDate: formData.driveDate,
      venue: formData.venue,
      openings: Number(formData.openings),
      appliedCount: 0,
      status: 'Registration Open',
      deadline: formData.driveDate
    }

    setRecruitmentDrives([newDrive, ...recruitmentDrives])
    setIsDriveModalOpen(false)
    setFormData({
      company: '',
      role: '',
      eligibility: 'BSCS & BSSE (Min CGPA 3.00)',
      driveDate: '2026-11-25',
      openings: 15,
      venue: 'Executive Seminar Hall'
    })
    toast.success('On-campus corporate recruitment drive scheduled.')
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-200 border border-purple-400/30">
              Corporate Liaison & Placement Bureau
            </span>
            <span className="text-xs text-purple-200/80">• Graduating Class 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Career, Placement & Alumni</h1>
          <p className="text-sm text-purple-200/90 max-w-2xl">
            Corporate recruitment drives, mandatory HEC internships, graduate employment index, and global alumni network.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsDriveModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Campus Drive</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placement Rate</span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">92.4%</div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Within 3 months of graduation
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Campus Openings</span>
            <Briefcase className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">55 Jobs</div>
          <div className="text-xs text-slate-500 font-medium">3 On-Campus Drives scheduled</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Internships Cleared</span>
            <Award className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">100%</div>
          <div className="text-xs text-emerald-600 font-medium">HEC mandatory requirement fulfilled</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alumni Mentors</span>
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">142 Mentors</div>
          <div className="text-xs text-slate-500 font-medium">Active in tech, finance & research</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('drives')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'drives'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Recruitment Drives</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
            {recruitmentDrives.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('internships')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'internships'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Internship Records</span>
        </button>

        <button
          onClick={() => setActiveTab('alumni')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'alumni'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Alumni Directory</span>
        </button>
      </div>

      {/* Tab 1: Drives */}
      {activeTab === 'drives' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recruitmentDrives.map((drv) => (
            <div key={drv.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 font-mono">{drv.id}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                    {drv.status}
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">{drv.company}</h4>
                <p className="text-xs text-purple-700 font-bold">{drv.role}</p>
                <div className="text-xs text-slate-500 space-y-1 pt-1">
                  <div><span className="font-semibold text-slate-700">Eligibility:</span> {drv.eligibility}</div>
                  <div><span className="font-semibold text-slate-700">Date:</span> {drv.driveDate}</div>
                  <div><span className="font-semibold text-slate-700">Venue:</span> {drv.venue}</div>
                  <div><span className="font-semibold text-slate-700">Vacancies:</span> {drv.openings} Openings</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">{drv.appliedCount} Applied</span>
                <button
                  onClick={() => toast.success(`Viewing candidate applicants for ${drv.company}`)}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  View Applicants
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Internships */}
      {activeTab === 'internships' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Student & CMS ID</th>
                  <th className="py-3.5 px-4">Organization / Employer</th>
                  <th className="py-3.5 px-4">Role & Duration</th>
                  <th className="py-3.5 px-4">Industry Evaluation</th>
                  <th className="py-3.5 px-4 text-right">HEC Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {internships.map((intn) => (
                  <tr key={intn.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{intn.studentName}</div>
                      <div className="text-[11px] font-mono text-purple-700 font-semibold">{intn.regNo}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{intn.company}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-700">{intn.role}</div>
                      <div className="text-[11px] text-slate-400">{intn.duration}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-purple-700">{intn.evaluationScore}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        Cleared
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Alumni Directory */}
      {activeTab === 'alumni' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alumni.map((alm) => (
            <div key={alm.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-purple-700 font-bold">{alm.id}</span>
                {alm.isMentor && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Active Mentor
                  </span>
                )}
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">{alm.name}</h4>
              <p className="text-xs text-slate-400 font-medium">{alm.degree}</p>
              <div className="text-xs text-slate-700 space-y-1 pt-1">
                <div className="font-bold text-slate-900">{alm.position}</div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{alm.currentCompany}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{alm.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Schedule Drive */}
      <Modal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        title="Schedule On-Campus Recruitment Drive"
      >
        <form onSubmit={handleAddDrive} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Company Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Systems Limited / Arbisoft"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Job Title / Designation</label>
            <input
              type="text"
              required
              placeholder="e.g. Associate Software Engineer"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Drive Date</label>
              <input
                type="date"
                value={formData.driveDate}
                onChange={(e) => setFormData({ ...formData, driveDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Openings Count</label>
              <input
                type="number"
                min="1"
                value={formData.openings}
                onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Eligibility Criteria</label>
            <input
              type="text"
              value={formData.eligibility}
              onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDriveModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              Publish Campus Recruitment Drive
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default UniversityCareerAlumniView

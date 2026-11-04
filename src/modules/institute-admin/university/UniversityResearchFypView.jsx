import React, { useState, useEffect } from 'react'
import { 
  FlaskConical, 
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
  Award, 
  FileText, 
  UserCheck, 
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const UniversityResearchFypView = ({ currentInstitute }) => {
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('fyp') // 'fyp' | 'thesis' | 'publications'
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)


  // Demo FYP Projects
  const DEFAULT_FYP_PROJECTS = [
    {
      id: 'FYP-2026-001',
      title: 'Autonomous Drone Navigation Using Visual SLAM & Deep Reinforcement Learning',
      department: 'Computer Science',
      teamLead: 'Muhammad Hamza (BSCS-F23-018)',
      members: ['Hamza Tariq', 'Bilal Ahmed', 'Khadija Imran'],
      supervisor: 'Dr. Nadia Hashmi (Associate Prof)',
      midDefenseMarks: 88,
      turnitinSimilarity: '7%',
      status: 'Approved for Final Defense',
      defenseDate: '2026-11-20'
    },
    {
      id: 'FYP-2026-002',
      title: 'Decentralized Micro-Grid Energy Trading via Ethereum Smart Contracts',
      department: 'Software Engineering',
      teamLead: 'Zainab Fatima (BSSE-F23-042)',
      members: ['Zainab Fatima', 'Ammar Sheikh'],
      supervisor: 'Prof. Tariq Jamil (Dean of Computing)',
      midDefenseMarks: 92,
      turnitinSimilarity: '11%',
      status: 'Ready for External Evaluation',
      defenseDate: '2026-11-22'
    },
    {
      id: 'FYP-2026-003',
      title: 'Predictive Medical Diagnostics Platform for Diabetic Retinopathy via Vision Transformers',
      department: 'Artificial Intelligence',
      teamLead: 'Daniyal Qureshi (BSAI-F23-009)',
      members: ['Daniyal Qureshi', 'Maryam Nawaz', 'Usman Ali'],
      supervisor: 'Dr. Shahzad Rafiq (Chairperson)',
      midDefenseMarks: 79,
      turnitinSimilarity: '14%',
      status: 'Revision Recommended',
      defenseDate: '2026-11-28'
    }
  ]

  // Demo MS / PhD Theses
  const DEFAULT_THESES = [
    {
      id: 'THS-MS-041',
      candidateName: 'Engr. Salman Farooq',
      degree: 'MS Computer Science (HEC Approved)',
      title: 'Quantum-Resilient Lattice Cryptography for High-Throughput Edge IoT Gateways',
      advisor: 'Prof. Dr. Tariq Jamil',
      externalExaminer: 'Dr. Zulfiqar Ali (NUST Islamabad)',
      turnitinIndex: '6%',
      defenseStatus: 'Defense Scheduled (Dec 2, 2026)',
      synopsisApproved: true
    },
    {
      id: 'THS-MS-042',
      candidateName: 'Saba Rehman',
      degree: 'MS Software Engineering',
      title: 'Empirical Benchmark of Automated Code Repair via Fine-Tuned Large Language Models',
      advisor: 'Dr. Nadia Hashmi',
      externalExaminer: 'Prof. Khalid Mahmood (FAST-NUCES)',
      turnitinIndex: '9%',
      defenseStatus: 'Synopsis Approved',
      synopsisApproved: true
    }
  ]

  // Demo Research Publications
  const DEFAULT_PUBLICATIONS = [
    {
      id: 'PUB-2026-01',
      title: 'Real-Time Edge Perception Algorithms for Low-Altitude Autonomous Aerial Vehicles',
      authors: 'Dr. Nadia Hashmi, M. Hamza',
      journal: 'IEEE Transactions on Intelligent Transportation Systems',
      category: 'W-Category (HEC Recognized)',
      impactFactor: '8.5',
      year: '2026',
      doi: '10.1109/TITS.2026.3190422'
    },
    {
      id: 'PUB-2026-02',
      title: 'Scalable Micro-Service Orchestration on Multi-Cloud Architectures',
      authors: 'Prof. Tariq Jamil, Engr. Salman Farooq',
      journal: 'Elsevier Journal of Systems & Software',
      category: 'X-Category (HEC Recognized)',
      impactFactor: '4.2',
      year: '2026',
      doi: '10.1016/j.jss.2026.111890'
    }
  ]

  const instId = currentInstitute?.id || 'default'
  const fypStorageKey = `sms_university_fyp_${instId}`

  const [fypData, setFypData] = useState(() => {
    try {
      const saved = localStorage.getItem(fypStorageKey)
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      fypProjects: DEFAULT_FYP_PROJECTS,
      theses: DEFAULT_THESES,
      publications: DEFAULT_PUBLICATIONS
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(fypStorageKey, JSON.stringify(fypData))
    } catch {}
  }, [fypData, fypStorageKey])

  const fypProjects = fypData.fypProjects || DEFAULT_FYP_PROJECTS
  const theses = fypData.theses || DEFAULT_THESES
  const publications = fypData.publications || DEFAULT_PUBLICATIONS

  const setFypProjects = (updater) => {
    setFypData(prev => ({
      ...prev,
      fypProjects: typeof updater === 'function' ? updater(prev.fypProjects || DEFAULT_FYP_PROJECTS) : updater
    }))
  }

  const setTheses = (updater) => {
    setFypData(prev => ({
      ...prev,
      theses: typeof updater === 'function' ? updater(prev.theses || DEFAULT_THESES) : updater
    }))
  }

  const setPublications = (updater) => {
    setFypData(prev => ({
      ...prev,
      publications: typeof updater === 'function' ? updater(prev.publications || DEFAULT_PUBLICATIONS) : updater
    }))
  }


  const [formData, setFormData] = useState({
    title: '',
    department: 'Computer Science',
    teamLead: '',
    supervisor: 'Dr. Nadia Hashmi (Associate Prof)',
    defenseDate: '2026-11-25'
  })

  const handleAddProject = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.teamLead) {
      toast.error('Please fill in title and team lead name.')
      return
    }

    const newProj = {
      id: `FYP-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: formData.title,
      department: formData.department,
      teamLead: formData.teamLead,
      members: [formData.teamLead],
      supervisor: formData.supervisor,
      midDefenseMarks: 85,
      turnitinSimilarity: '8%',
      status: 'Approved for Final Defense',
      defenseDate: formData.defenseDate
    }

    setFypProjects([newProj, ...fypProjects])
    setIsAddModalOpen(false)
    setFormData({
      title: '',
      department: 'Computer Science',
      teamLead: '',
      supervisor: 'Dr. Nadia Hashmi (Associate Prof)',
      defenseDate: '2026-11-25'
    })
    toast.success('Undergraduate FYP project allocated and registered successfully.')
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-200 border border-purple-400/30">
              ORIC & Higher Education Research
            </span>
            <span className="text-xs text-purple-200/80">• Academic Year 2025–2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Research, FYP & Thesis (MS / PhD)</h1>
          <p className="text-sm text-purple-200/90 max-w-2xl">
            Undergraduate final year projects (FYP), MS/PhD thesis defenses, supervisor allocations, and Turnitin plagiarism compliance (&lt; 19%).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project / Thesis</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active FYP Teams</span>
            <FlaskConical className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">42 Projects</div>
          <div className="text-xs text-purple-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Supervisor Allocated
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">MS/PhD Defenses</span>
            <GraduationCap className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">8 Theses</div>
          <div className="text-xs text-slate-500 font-medium">External Examiners Appointed</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Turnitin Compliance</span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">100% Pass</div>
          <div className="text-xs text-emerald-600 font-medium">All submissions &lt; 19% similarity</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">HEC Publications</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">14 Papers</div>
          <div className="text-xs text-slate-500 font-medium">W & X Category Indexed</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('fyp')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'fyp'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Undergraduate FYP Projects</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
            {fypProjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('thesis')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'thesis'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>MS / PhD Theses & Defense</span>
        </button>

        <button
          onClick={() => setActiveTab('publications')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'publications'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>ORIC & HEC Publications</span>
        </button>
      </div>

      {/* Tab 1: FYP Projects */}
      {activeTab === 'fyp' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Project ID & Title</th>
                  <th className="py-3.5 px-4">Department & Members</th>
                  <th className="py-3.5 px-4">Supervisor</th>
                  <th className="py-3.5 px-4">Mid Score</th>
                  <th className="py-3.5 px-4">Turnitin</th>
                  <th className="py-3.5 px-4">Defense Date</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {fypProjects.map((fyp) => (
                  <tr key={fyp.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-2">{fyp.title}</div>
                      <div className="text-[11px] font-mono text-purple-700 font-semibold">{fyp.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{fyp.department}</div>
                      <div className="text-[11px] text-slate-400">{fyp.teamLead}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {fyp.supervisor}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-purple-700">
                      {fyp.midDefenseMarks} / 100
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 font-mono">
                        {fyp.turnitinSimilarity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {fyp.defenseDate}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        {fyp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Theses */}
      {activeTab === 'thesis' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Thesis ID & Title</th>
                  <th className="py-3.5 px-4">Candidate & Degree</th>
                  <th className="py-3.5 px-4">Thesis Advisor</th>
                  <th className="py-3.5 px-4">External Examiner</th>
                  <th className="py-3.5 px-4">Plagiarism</th>
                  <th className="py-3.5 px-4 text-right">Defense Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {theses.map((t) => (
                  <tr key={t.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-slate-900">{t.title}</div>
                      <div className="text-[11px] font-mono text-purple-700 font-semibold">{t.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{t.candidateName}</div>
                      <div className="text-[11px] text-slate-400">{t.degree}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{t.advisor}</td>
                    <td className="py-3.5 px-4 text-slate-600">{t.externalExaminer}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 font-mono">
                        {t.turnitinIndex}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                        {t.defenseStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Publications */}
      {activeTab === 'publications' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {publications.map((pub) => (
            <div key={pub.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                  {pub.category}
                </span>
                <span className="text-xs font-bold text-slate-400">Impact Factor: {pub.impactFactor}</span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{pub.title}</h4>
              <div className="text-xs text-slate-600">
                <span className="font-bold">Authors:</span> {pub.authors}
              </div>
              <div className="text-xs text-slate-500">
                <span className="font-bold">Journal:</span> {pub.journal} ({pub.year})
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400">DOI: {pub.doi}</span>
                <span className="text-purple-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                  HEC Verified <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add FYP Project */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Final Year Project (FYP)"
      >
        <form onSubmit={handleAddProject} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Project Title</label>
            <textarea
              required
              rows="2"
              placeholder="e.g. Next-Gen Federated Learning Framework for Distributed Smart Grids"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Academic Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Team Lead & CMS ID</label>
              <input
                type="text"
                required
                placeholder="e.g. Bilal Ahmed (BSCS-F23-088)"
                value={formData.teamLead}
                onChange={(e) => setFormData({ ...formData, teamLead: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Supervisor / Advisor</label>
            <input
              type="text"
              value={formData.supervisor}
              onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Tentative Final Defense Date</label>
            <input
              type="date"
              value={formData.defenseDate}
              onChange={(e) => setFormData({ ...formData, defenseDate: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              Allocate Supervisor & Register
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default UniversityResearchFypView

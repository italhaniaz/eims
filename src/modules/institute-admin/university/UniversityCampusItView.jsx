import React, { useState, useEffect } from 'react'
import { 
  Laptop, 
  Server, 
  Wifi, 
  ShieldCheck, 
  Activity, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Mail, 
  Terminal, 
  RefreshCw,
  Cpu,
  Layers
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const UniversityCampusItView = ({ currentInstitute }) => {
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('infrastructure') // 'infrastructure' | 'accounts' | 'tickets'
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [isPinging, setIsPinging] = useState(false)


  // Demo IT Infrastructure
  const DEFAULT_NODES = [
    {
      id: 'NODE-PERN-01',
      name: 'HEC PERN Optical Gateway (1 Gbps)',
      category: 'Campus Backbone',
      ip: '10.0.0.1',
      status: 'Online',
      load: '42%',
      latency: '3ms'
    },
    {
      id: 'NODE-AI-GPU-01',
      name: 'NVIDIA A100 Compute Cluster (AI Lab)',
      category: 'Research HPC',
      ip: '10.0.12.50',
      status: 'Online',
      load: '78%',
      latency: '1ms'
    },
    {
      id: 'NODE-LMS-SRV',
      name: 'Moodle LMS & Cloud Storage Node',
      category: 'Academic Core',
      ip: '10.0.4.10',
      status: 'Online',
      load: '35%',
      latency: '2ms'
    },
    {
      id: 'NODE-WIFI-AUD',
      name: 'Aruba AP-550 (Main Auditorium)',
      category: 'Wireless Access',
      ip: '10.0.20.104',
      status: 'Optimal',
      load: '61%',
      latency: '8ms'
    }
  ]

  // Demo Accounts
  const DEFAULT_DIGITAL_ACCOUNTS = [
    {
      id: 'ACC-01',
      name: 'Dr. Nadia Hashmi',
      email: 'nadia.hashmi@ias.edu.pk',
      role: 'Associate Professor',
      services: ['Office 365 Enterprise', 'Turnitin Plagiarism', 'IEEE Xplore Access'],
      status: 'Active'
    },
    {
      id: 'ACC-02',
      name: 'Muhammad Hamza',
      email: 'hamza.f23018@ias.edu.pk',
      role: 'Undergraduate BSCS',
      services: ['Campus WiFi SSID IAS-SECURE', 'Google Workspace Edu', 'Coursera Campus'],
      status: 'Active'
    },
    {
      id: 'ACC-03',
      name: 'Daniyal Qureshi',
      email: 'daniyal.f24009@ias.edu.pk',
      role: 'Undergraduate BBA',
      services: ['Campus WiFi SSID IAS-SECURE', 'Bloomberg Terminal Access', 'Google Workspace Edu'],
      status: 'Active'
    }
  ]

  // Demo Tickets
  const DEFAULT_TICKETS = [
    {
      id: 'TKT-2026-104',
      subject: 'Lab 3 Projector HDMI Signal Intermittent Drop',
      reportedBy: 'Engr. Salman Farooq',
      venue: 'Computer Lab 3, 2nd Floor',
      priority: 'High',
      status: 'In Progress',
      date: '2026-10-31'
    },
    {
      id: 'TKT-2026-103',
      subject: 'Faculty Office WiFi Mesh Roaming Drop',
      reportedBy: 'Prof. Tariq Jamil',
      venue: 'Faculty Block A, Room 204',
      priority: 'Medium',
      status: 'Resolved',
      date: '2026-10-30'
    }
  ]

  const instId = currentInstitute?.id || 'default'
  const itStorageKey = `sms_university_it_${instId}`

  const [itData, setItData] = useState(() => {
    try {
      const saved = localStorage.getItem(itStorageKey)
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      nodes: DEFAULT_NODES,
      digitalAccounts: DEFAULT_DIGITAL_ACCOUNTS,
      tickets: DEFAULT_TICKETS
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(itStorageKey, JSON.stringify(itData))
    } catch {}
  }, [itData, itStorageKey])

  const nodes = itData.nodes || DEFAULT_NODES
  const digitalAccounts = itData.digitalAccounts || DEFAULT_DIGITAL_ACCOUNTS
  const tickets = itData.tickets || DEFAULT_TICKETS

  const setNodes = (updater) => {
    setItData(prev => ({
      ...prev,
      nodes: typeof updater === 'function' ? updater(prev.nodes || DEFAULT_NODES) : updater
    }))
  }

  const setDigitalAccounts = (updater) => {
    setItData(prev => ({
      ...prev,
      digitalAccounts: typeof updater === 'function' ? updater(prev.digitalAccounts || DEFAULT_DIGITAL_ACCOUNTS) : updater
    }))
  }

  const setTickets = (updater) => {
    setItData(prev => ({
      ...prev,
      tickets: typeof updater === 'function' ? updater(prev.tickets || DEFAULT_TICKETS) : updater
    }))
  }


  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Undergraduate Student',
    service: 'Campus WiFi & Google Workspace'
  })

  const handleCreateAccount = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      toast.error('Please fill in user name and campus email.')
      return
    }

    const newAcc = {
      id: `ACC-0${digitalAccounts.length + 1}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      services: [formData.service, 'Campus WiFi SSID IAS-SECURE'],
      status: 'Active'
    }

    setDigitalAccounts([newAcc, ...digitalAccounts])
    setIsAccountModalOpen(false)
    setFormData({
      name: '',
      email: '',
      role: 'Undergraduate Student',
      service: 'Campus WiFi & Google Workspace'
    })
    toast.success('University institutional digital account provisioned.')
  }

  const handlePingAll = () => {
    setIsPinging(true)
    setTimeout(() => {
      setIsPinging(false)
      toast.success('All campus core nodes, PERN gateway, and HPC clusters responded with 0% packet loss.')
    }, 800)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-200 border border-purple-400/30">
              Campus IT & High Performance Computing
            </span>
            <span className="text-xs text-purple-200/80">• PERN Optical Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">IT Infrastructure & Networking</h1>
          <p className="text-sm text-purple-200/90 max-w-2xl">
            Campus optical connectivity, HPC server clusters, institutional email provisioning, and technical support desk.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handlePingAll}
            disabled={isPinging}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isPinging ? 'animate-spin' : ''}`} />
            <span>Test Core Nodes</span>
          </button>
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Provision Account</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">PERN Optical Link</span>
            <Wifi className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">1.0 Gbps</div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 99.98% Uptime this semester
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">HPC Compute Load</span>
            <Cpu className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">78% Load</div>
          <div className="text-xs text-slate-500 font-medium">AI & Deep Learning training active</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Digital Logins</span>
            <Mail className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">540 Accounts</div>
          <div className="text-xs text-purple-700 font-medium">@ias.edu.pk credentials active</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Tickets</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">1 Ticket</div>
          <div className="text-xs text-slate-500 font-medium">Avg resolution time: 42 mins</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('infrastructure')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'infrastructure'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Core Infrastructure & HPC</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
            {nodes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'accounts'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Digital Identity Provisioning</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'tickets'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>IT Helpdesk Tickets</span>
        </button>
      </div>

      {/* Tab 1: Nodes */}
      {activeTab === 'infrastructure' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nodes.map((node) => (
            <div key={node.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 font-mono">
                  {node.ip}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  {node.status}
                </span>
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">{node.name}</h4>
                <p className="text-xs text-purple-700 font-bold">{node.category}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div><span className="font-semibold text-slate-700">Compute Load:</span> {node.load}</div>
                <div><span className="font-semibold text-slate-700">Latency:</span> {node.latency}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Accounts */}
      {activeTab === 'accounts' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">User Name & Role</th>
                  <th className="py-3.5 px-4">Campus Email Address</th>
                  <th className="py-3.5 px-4">Provisioned Licenses</th>
                  <th className="py-3.5 px-4 text-right">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {digitalAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{acc.name}</div>
                      <div className="text-[11px] text-slate-400">{acc.role}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                      {acc.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {acc.services.map((s, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        {acc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Tickets */}
      {activeTab === 'tickets' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Ticket & Incident Subject</th>
                  <th className="py-3.5 px-4">Reported By & Venue</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Reported Date</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {tickets.map((tkt) => (
                  <tr key={tkt.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{tkt.subject}</div>
                      <div className="text-[11px] font-mono text-purple-700 font-semibold">{tkt.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{tkt.reportedBy}</div>
                      <div className="text-[11px] text-slate-400">{tkt.venue}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                        tkt.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {tkt.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{tkt.date}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        tkt.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {tkt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Provision Account */}
      <Modal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        title="Provision University Institutional Account"
      >
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">User Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Shahzad Rafiq"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Requested Institutional Email</label>
            <input
              type="email"
              required
              placeholder="e.g. s.rafiq@ias.edu.pk"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">User Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="Undergraduate Student">Undergraduate Student</option>
              <option value="Professor / Faculty">Professor / Faculty</option>
              <option value="Dean / Campus Director">Dean / Campus Director</option>
              <option value="Research Scholar (MS/PhD)">Research Scholar (MS/PhD)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Initial License Tier</label>
            <select
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="Campus WiFi & Google Workspace">Campus WiFi & Google Workspace</option>
              <option value="Office 365 Enterprise & Turnitin">Office 365 Enterprise & Turnitin</option>
              <option value="HPC Compute Node Access">HPC Compute Node Access</option>
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAccountModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              Generate Credentials & Provision
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default UniversityCampusItView

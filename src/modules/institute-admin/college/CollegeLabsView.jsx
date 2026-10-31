import React, { useState } from 'react'
import { 
  FlaskConical, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Plus, 
  Cpu, 
  Boxes,
  Users,
  FileText
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const CollegeLabsView = ({ currentInstitute }) => {
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('labs') // 'labs' | 'schedules' | 'equipment'
  const [searchQuery, setSearchQuery] = useState('')
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  // Demo Labs
  const [labs, setLabs] = useState([
    {
      id: 'LAB-PHY-01',
      name: 'Advanced Physics Practical Lab',
      discipline: 'F.Sc Pre-Engineering & Pre-Medical',
      location: 'Science Block, Ground Floor',
      capacity: '40 Workstations',
      inCharge: 'Prof. Syed Ali Raza (M.Sc Physics)',
      status: 'Fully Operational',
      safetyAuditDate: '2026-10-15'
    },
    {
      id: 'LAB-CHM-01',
      name: 'Organic & Inorganic Chemistry Lab',
      discipline: 'F.Sc Pre-Medical & Pre-Engineering',
      location: 'Science Block, 1st Floor',
      capacity: '36 Workstations',
      inCharge: 'Dr. Nadia Hashmi (Ph.D Chemistry)',
      status: 'Fully Operational',
      safetyAuditDate: '2026-10-18'
    },
    {
      id: 'LAB-BIO-01',
      name: 'Cell Biology & Dissection Lab',
      discipline: 'F.Sc Pre-Medical',
      location: 'Science Block, 1st Floor',
      capacity: '30 Workstations',
      inCharge: 'Mrs. Saima Noor (M.Phil Botany)',
      status: 'Fully Operational',
      safetyAuditDate: '2026-10-20'
    },
    {
      id: 'LAB-CS-01',
      name: 'Turing Computer Science Laboratory',
      discipline: 'ICS & Intermediate CS Groups',
      location: 'IT Tower, 2nd Floor',
      capacity: '50 Core-i7 Systems (Gigabit LAN)',
      inCharge: 'Engr. Kamran Akram',
      status: 'Fully Operational',
      safetyAuditDate: '2026-10-25'
    }
  ])

  // Demo Practical Schedules
  const [practicalSchedules, setPracticalSchedules] = useState([
    {
      id: 'PRAC-801',
      labName: 'Advanced Physics Practical Lab',
      batch: 'F.Sc Part II - Batch P-1',
      experiment: 'Determination of Resistance of Galvanometer by Half Deflection',
      timeSlot: 'Monday 09:00 AM - 11:00 AM',
      supervisor: 'Prof. Syed Ali Raza',
      studentsCount: 38
    },
    {
      id: 'PRAC-802',
      labName: 'Organic & Inorganic Chemistry Lab',
      batch: 'F.Sc Part II - Batch C-1',
      experiment: 'Salt Analysis (Identification of Acid & Basic Radicals)',
      timeSlot: 'Tuesday 11:30 AM - 01:30 PM',
      supervisor: 'Dr. Nadia Hashmi',
      studentsCount: 35
    },
    {
      id: 'PRAC-803',
      labName: 'Turing Computer Science Laboratory',
      batch: 'ICS Part I - Batch CS-A',
      experiment: 'C++ Array & String Pointer Implementations',
      timeSlot: 'Wednesday 10:00 AM - 12:00 PM',
      supervisor: 'Engr. Kamran Akram',
      studentsCount: 48
    }
  ])

  // Demo Equipment Stock
  const [equipment, setEquipment] = useState([
    { id: 'EQ-01', name: 'Digital Cathode Ray Oscilloscopes (CRO)', lab: 'Physics Lab', qty: 12, condition: 'Excellent' },
    { id: 'EQ-02', name: 'Compound Optical Microscopes (1000x)', lab: 'Biology Lab', qty: 30, condition: 'Calibrated' },
    { id: 'EQ-03', name: 'Analytical Electronic Balance (0.001g)', lab: 'Chemistry Lab', qty: 6, condition: 'Verified' },
    { id: 'EQ-04', name: 'Dell OptiPlex Core i7 Workstations', lab: 'CS Lab', qty: 50, condition: 'Active' }
  ])

  const [formData, setFormData] = useState({
    labName: 'Advanced Physics Practical Lab',
    batch: '',
    experiment: '',
    timeSlot: 'Monday 09:00 AM - 11:00 AM',
    supervisor: 'Prof. Syed Ali Raza',
    studentsCount: '35'
  })

  const handleSchedule = (e) => {
    e.preventDefault()
    if (!formData.batch || !formData.experiment) {
      toast({ title: 'Validation', message: 'Batch and Experiment details are required', type: 'error' })
      return
    }

    const newPrac = {
      id: `PRAC-${Math.floor(800 + Math.random() * 200)}`,
      labName: formData.labName,
      batch: formData.batch,
      experiment: formData.experiment,
      timeSlot: formData.timeSlot,
      supervisor: formData.supervisor,
      studentsCount: parseInt(formData.studentsCount) || 30
    }

    setPracticalSchedules([newPrac, ...practicalSchedules])
    setIsScheduleModalOpen(false)
    setFormData({ labName: 'Advanced Physics Practical Lab', batch: '', experiment: '', timeSlot: 'Monday 09:00 AM - 11:00 AM', supervisor: 'Prof. Syed Ali Raza', studentsCount: '35' })
    toast({ title: 'Practical Scheduled', message: `Batch ${newPrac.batch} allocated to lab`, type: 'success' })
  }

  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,ID,Lab,Batch,Experiment,Time Slot,Supervisor,Students\n'
    practicalSchedules.forEach(p => {
      csvContent += `"${p.id}","${p.labName}","${p.batch}","${p.experiment}","${p.timeSlot}","${p.supervisor}",${p.studentsCount}\n`
    })
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'college_laboratory_schedules.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: 'Export Generated', message: 'Laboratory schedules exported to CSV', type: 'success' })
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-cyan-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide uppercase text-teal-200 mb-2">
              <FlaskConical className="w-3.5 h-3.5 text-cyan-300" />
              <span>Higher Secondary Practical & Computing Labs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Science & Computer Laboratories
            </h1>
            <p className="text-sm text-teal-100/90 mt-1 max-w-2xl">
              Physics, Chemistry, Biology, and Computer practical labs, apparatus calibrations, batch allocations, and board practical readiness for {currentInstitute?.name || 'College Campus'}.
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
              onClick={() => setIsScheduleModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs tracking-wide transition-all cursor-pointer shadow-lg hover:shadow-teal-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Practical</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Functional Labs</div>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">{labs.length} Facilities</div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Physics, Chem, Bio & CS
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <FlaskConical className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Practical Batches</div>
            <div className="text-2xl font-extrabold text-indigo-700 mt-1">{practicalSchedules.length} Active</div>
            <div className="text-[11px] font-semibold text-indigo-600 mt-1">Weekly Rotation Matrix</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Workstations</div>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">156 Stations</div>
            <div className="text-[11px] font-semibold text-teal-600 mt-1">
              Board Inspection Certified
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Apparatus Inventory</div>
            <div className="text-2xl font-extrabold text-purple-700 mt-1">100% Calibrated</div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Lab Consumables Stocked
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Boxes className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'labs', label: `College Laboratories (${labs.length})` },
              { id: 'schedules', label: `Practical Batches & Schedules (${practicalSchedules.length})` },
              { id: 'equipment', label: `Apparatus & Instruments (${equipment.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-teal-600 text-white shadow-xs'
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
              placeholder="Search lab, batch, experiment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
            />
          </div>
        </div>

        {/* Tab 1: Labs */}
        {activeTab === 'labs' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Lab Identifier</th>
                  <th className="py-3 px-4">Laboratory Name</th>
                  <th className="py-3 px-4">Discipline Groups</th>
                  <th className="py-3 px-4">Campus Location</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Faculty In-Charge</th>
                  <th className="py-3 px-4 text-right">Operational Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {labs.map(lab => (
                  <tr key={lab.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-700 text-xs">{lab.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{lab.name}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{lab.discipline}</td>
                    <td className="py-3.5 px-4 text-slate-600">{lab.location}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{lab.capacity}</td>
                    <td className="py-3.5 px-4 text-purple-700 font-medium">{lab.inCharge}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {lab.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Practical Batches */}
        {activeTab === 'schedules' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Batch ID</th>
                  <th className="py-3 px-4">Class Group</th>
                  <th className="py-3 px-4">Assigned Laboratory</th>
                  <th className="py-3 px-4">Experiment Title</th>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Supervising Lecturer</th>
                  <th className="py-3 px-4 text-right">Candidates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {practicalSchedules.map(prac => (
                  <tr key={prac.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">{prac.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{prac.batch}</td>
                    <td className="py-3.5 px-4 font-semibold text-teal-700">{prac.labName}</td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs">{prac.experiment}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">{prac.timeSlot}</td>
                    <td className="py-3.5 px-4 text-slate-800">{prac.supervisor}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">{prac.studentsCount} Students</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Equipment */}
        {activeTab === 'equipment' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Asset ID</th>
                  <th className="py-3 px-4">Apparatus / Equipment Name</th>
                  <th className="py-3 px-4">Assigned Laboratory</th>
                  <th className="py-3 px-4">Quantity in Stock</th>
                  <th className="py-3 px-4 text-right">Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {equipment.map(eq => (
                  <tr key={eq.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{eq.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{eq.name}</td>
                    <td className="py-3.5 px-4 text-teal-700 font-medium">{eq.lab}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{eq.qty} Units</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {eq.condition}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Practical Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Practical Laboratory Batch"
      >
        <form onSubmit={handleSchedule} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Laboratory Facility</label>
            <select
              value={formData.labName}
              onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600 bg-white"
            >
              <option value="Advanced Physics Practical Lab">Advanced Physics Practical Lab</option>
              <option value="Organic & Inorganic Chemistry Lab">Organic & Inorganic Chemistry Lab</option>
              <option value="Cell Biology & Dissection Lab">Cell Biology & Dissection Lab</option>
              <option value="Turing Computer Science Laboratory">Turing Computer Science Laboratory</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Class Batch / Section</label>
              <input
                type="text"
                placeholder="e.g. F.Sc Part I - Batch P-2"
                value={formData.batch}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Students Count</label>
              <input
                type="number"
                placeholder="e.g. 35"
                value={formData.studentsCount}
                onChange={(e) => setFormData({ ...formData, studentsCount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Practical Experiment Title</label>
            <input
              type="text"
              placeholder="e.g. Verification of Ohm's Law using Voltmeter & Ammeter"
              value={formData.experiment}
              onChange={(e) => setFormData({ ...formData, experiment: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
              <input
                type="text"
                placeholder="e.g. Thursday 09:00 AM - 11:00 AM"
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Supervising Lecturer</label>
              <input
                type="text"
                placeholder="e.g. Prof. Syed Ali Raza"
                value={formData.supervisor}
                onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer shadow-md"
            >
              Confirm Practical Slot
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default CollegeLabsView

import React, { useState } from 'react'
import { 
  Building, 
  Search, 
  Filter, 
  Bed, 
  Users, 
  DoorClosed, 
  Download, 
  Plus, 
  Key, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileCheck
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const CollegeHostelView = ({ currentInstitute }) => {
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('rooms') // 'rooms' | 'residents' | 'passes'
  const [searchQuery, setSearchQuery] = useState('')
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false)

  // Demo Rooms
  const [rooms, setRooms] = useState([
    {
      id: 'RM-101',
      wing: 'Iqbal Hall (Boys Wing A)',
      roomNo: '101',
      type: 'Triple Bed (AC)',
      totalBeds: 3,
      occupiedBeds: 3,
      monthlyFee: 14000,
      warden: 'Prof. Tariq Jamil',
      status: 'Full'
    },
    {
      id: 'RM-102',
      wing: 'Iqbal Hall (Boys Wing A)',
      roomNo: '102',
      type: 'Triple Bed (AC)',
      totalBeds: 3,
      occupiedBeds: 2,
      monthlyFee: 14000,
      warden: 'Prof. Tariq Jamil',
      status: '1 Bed Available'
    },
    {
      id: 'RM-201',
      wing: 'Fatima Hall (Girls Wing)',
      roomNo: '201',
      type: 'Double Bed (AC)',
      totalBeds: 2,
      occupiedBeds: 2,
      monthlyFee: 16000,
      warden: 'Dr. Nadia Hashmi',
      status: 'Full'
    },
    {
      id: 'RM-202',
      wing: 'Fatima Hall (Girls Wing)',
      roomNo: '202',
      type: 'Double Bed (Non-AC)',
      totalBeds: 2,
      occupiedBeds: 1,
      monthlyFee: 11000,
      warden: 'Dr. Nadia Hashmi',
      status: '1 Bed Available'
    }
  ])

  // Demo Residents
  const [residents, setResidents] = useState([
    {
      id: 'RES-01',
      studentName: 'Zainab Fatima',
      rollNo: 'COL-24-101',
      discipline: 'F.Sc Pre-Medical',
      roomNo: '201 (Bed A)',
      wing: 'Fatima Hall',
      hometown: 'Sialkot',
      guardianPhone: '0300-4455667',
      checkInDate: '2025-09-01',
      messFeeStatus: 'Paid'
    },
    {
      id: 'RES-02',
      studentName: 'Muhammad Hamza',
      rollNo: 'COL-24-108',
      discipline: 'F.Sc Pre-Engineering',
      roomNo: '101 (Bed B)',
      wing: 'Iqbal Hall',
      hometown: 'Gujranwala',
      guardianPhone: '0321-8899112',
      checkInDate: '2025-09-01',
      messFeeStatus: 'Paid'
    },
    {
      id: 'RES-03',
      studentName: 'Ali Raza',
      rollNo: 'COL-25-045',
      discipline: 'ICS (Part I)',
      roomNo: '102 (Bed A)',
      wing: 'Iqbal Hall',
      hometown: 'Faisalabad',
      guardianPhone: '0333-7766554',
      checkInDate: '2026-09-05',
      messFeeStatus: 'Pending'
    }
  ])

  // Demo Gate Passes
  const [gatePasses, setGatePasses] = useState([
    {
      id: 'GP-8901',
      studentName: 'Ali Raza',
      rollNo: 'COL-25-045',
      roomNo: '102',
      destination: 'Hometown Weekend Visit (Faisalabad)',
      outTime: '2026-10-31 16:00',
      expectedReturn: '2026-11-02 18:00',
      parentApproved: 'Yes (SMS Verified)',
      wardenSigned: 'Prof. Tariq Jamil',
      status: 'Active Pass'
    }
  ])

  const [formData, setFormData] = useState({
    studentName: '',
    rollNo: '',
    discipline: 'F.Sc Pre-Medical',
    hometown: '',
    roomNo: '102',
    wing: 'Iqbal Hall',
    guardianPhone: ''
  })

  const handleAllocate = (e) => {
    e.preventDefault()
    if (!formData.studentName || !formData.rollNo) {
      toast({ title: 'Validation', message: 'Student name and roll number are required', type: 'error' })
      return
    }

    const newRes = {
      id: `RES-0${residents.length + 1}`,
      studentName: formData.studentName,
      rollNo: formData.rollNo,
      discipline: formData.discipline,
      roomNo: formData.roomNo,
      wing: formData.wing,
      hometown: formData.hometown || 'Outstation',
      guardianPhone: formData.guardianPhone || '0300-0000000',
      checkInDate: new Date().toISOString().split('T')[0],
      messFeeStatus: 'Paid'
    }

    setResidents([newRes, ...residents])
    setIsAllocateModalOpen(false)
    setFormData({ studentName: '', rollNo: '', discipline: 'F.Sc Pre-Medical', hometown: '', roomNo: '102', wing: 'Iqbal Hall', guardianPhone: '' })
    toast({ title: 'Room Allocated', message: `Hostel bed assigned to ${newRes.studentName}`, type: 'success' })
  }

  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,ID,Student,Roll No,Discipline,Room,Wing,Hometown,Guardian Phone,Mess Fee\n'
    residents.forEach(r => {
      csvContent += `"${r.id}","${r.studentName}","${r.rollNo}","${r.discipline}","${r.roomNo}","${r.wing}","${r.hometown}","${r.guardianPhone}","${r.messFeeStatus}"\n`
    })
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'college_hostel_residents.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: 'Export Generated', message: 'Hostel residents roster exported to CSV', type: 'success' })
  }

  const totalCapacity = rooms.reduce((sum, r) => sum + r.totalBeds, 0)
  const totalOccupied = rooms.reduce((sum, r) => sum + r.occupiedBeds, 0)

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide uppercase text-blue-200 mb-2">
              <Building className="w-3.5 h-3.5 text-blue-300" />
              <span>Campus Boarding & Residential Life</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Hostel & Boarding Services
            </h1>
            <p className="text-sm text-blue-100/90 mt-1 max-w-2xl">
              Hostel wings, bed allocations, warden management, resident student directory, and gate pass clearances for {currentInstitute?.name || 'College Campus'}.
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
              onClick={() => setIsAllocateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide transition-all cursor-pointer shadow-lg hover:shadow-blue-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>Allocate Bed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Capacity</div>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">{totalCapacity} Beds</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">{rooms.length} Furnished Rooms</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Bed className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Occupancy Ratio</div>
            <div className="text-2xl font-extrabold text-indigo-700 mt-1">
              {Math.round((totalOccupied / totalCapacity) * 100)}%
            </div>
            <div className="text-[11px] font-semibold text-indigo-600 mt-1">
              {totalOccupied} of {totalCapacity} Occupied
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Beds</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {totalCapacity - totalOccupied} Beds Free
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready for immediate check-in
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DoorClosed className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Gate Passes</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{gatePasses.length} Out</div>
            <div className="text-[11px] font-semibold text-amber-600 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Weekend Hometown Clearance
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Key className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'rooms', label: `Rooms & Wings (${rooms.length})` },
              { id: 'residents', label: `Resident Students (${residents.length})` },
              { id: 'passes', label: `Gate Passes & Day-Out (${gatePasses.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
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
              placeholder="Search resident, room, hometown..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
            />
          </div>
        </div>

        {/* Tab 1: Rooms */}
        {activeTab === 'rooms' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Room No</th>
                  <th className="py-3 px-4">Hostel Wing</th>
                  <th className="py-3 px-4">Category & AC</th>
                  <th className="py-3 px-4">Bed Capacity</th>
                  <th className="py-3 px-4">Monthly Mess & Rent</th>
                  <th className="py-3 px-4">Warden In-Charge</th>
                  <th className="py-3 px-4 text-right">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {rooms.map(rm => (
                  <tr key={rm.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 text-sm">{rm.roomNo}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{rm.wing}</td>
                    <td className="py-3.5 px-4 text-slate-700">{rm.type}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {rm.occupiedBeds} / {rm.totalBeds} Beds
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      PKR {rm.monthlyFee.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{rm.warden}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rm.status === 'Full' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {rm.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Residents */}
        {activeTab === 'residents' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Resident ID</th>
                  <th className="py-3 px-4">Student & College Roll</th>
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-4">Allocated Room</th>
                  <th className="py-3 px-4">Hometown City</th>
                  <th className="py-3 px-4">Guardian Phone</th>
                  <th className="py-3 px-4">Mess Fee</th>
                  <th className="py-3 px-4 text-right">Check-in Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {residents.map(res => (
                  <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{res.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{res.studentName}</div>
                      <div className="text-[11px] text-blue-600 font-mono font-semibold">{res.rollNo}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{res.discipline}</td>
                    <td className="py-3.5 px-4 font-bold text-indigo-700">{res.roomNo}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">{res.hometown}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{res.guardianPhone}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        res.messFeeStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {res.messFeeStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">{res.checkInDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Gate Passes */}
        {activeTab === 'passes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Pass ID</th>
                  <th className="py-3 px-4">Student & Room</th>
                  <th className="py-3 px-4">Destination & Reason</th>
                  <th className="py-3 px-4">Departure Time</th>
                  <th className="py-3 px-4">Expected Return</th>
                  <th className="py-3 px-4">Parent Consent</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {gatePasses.map(gp => (
                  <tr key={gp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-600">{gp.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{gp.studentName}</div>
                      <div className="text-[11px] text-slate-500">Room {gp.roomNo}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{gp.destination}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{gp.outTime}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{gp.expectedReturn}</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-semibold">{gp.parentApproved}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {gp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Allocate Room Modal */}
      <Modal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        title="Allocate Hostel Bed to Student"
      >
        <form onSubmit={handleAllocate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name</label>
              <input
                type="text"
                placeholder="e.g. Shahzaib Khan"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">College Roll No</label>
              <input
                type="text"
                placeholder="e.g. COL-25-104"
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hostel Room</label>
              <select
                value={formData.roomNo}
                onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 bg-white"
              >
                <option value="102">Room 102 (Iqbal Hall - 1 Bed Free)</option>
                <option value="202">Room 202 (Fatima Hall - 1 Bed Free)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hometown City</label>
              <input
                type="text"
                placeholder="e.g. Gujrat / Multan"
                value={formData.hometown}
                onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Guardian Mobile</label>
            <input
              type="text"
              placeholder="e.g. 0300-1234567"
              value={formData.guardianPhone}
              onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAllocateModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer shadow-md"
            >
              Confirm Allotment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default CollegeHostelView

import React, { useState } from 'react'
import { GraduationCap, Plus, Search, Edit2, Trash2, Mail, Phone, IdCard, Printer, User, School, QrCode, Filter, X } from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { detectProgramLevel, normalizeClassSections } from '../../../constants/academicLevels'
import Modal from '../../../components/common/Modal'

export const StudentsView = ({ currentInstitute }) => {
  const { 
    students, 
    classes = [],
    addItem, 
    updateItem, 
    deleteItem,
    activeProgramLevel,
    setActiveProgramLevel,
    programLevels = []
  } = useAppData()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [selectedIdCard, setSelectedIdCard] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    className: '10th Grade',
    section: 'A',
    email: '',
    phone: '',
    bloodGroup: 'B+',
    emergencyContact: '+92 321 0000000',
    feeStatus: 'Paid',
    attendanceRate: '95%'
  })

  const openAddModal = () => {
    setEditingStudent(null)
    setFormData({
      name: '',
      rollNumber: `STD-${Math.floor(1000 + Math.random() * 9000)}`,
      className: '10th Grade',
      section: 'A',
      email: '',
      phone: '',
      bloodGroup: 'B+',
      emergencyContact: '',
      feeStatus: 'Paid',
      attendanceRate: '95%'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (s) => {
    setEditingStudent(s)
    setFormData({
      name: s.name,
      rollNumber: s.rollNumber,
      className: s.className,
      section: s.section || 'A',
      email: s.email || '',
      phone: s.phone || '',
      bloodGroup: s.bloodGroup || 'O+',
      emergencyContact: s.emergencyContact || s.phone || '',
      feeStatus: s.feeStatus || 'Paid',
      attendanceRate: s.attendanceRate || '95%'
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.rollNumber) return

    const payload = {
      ...formData,
      instituteId: currentInstitute?.id || 'inst-1'
    }

    if (editingStudent) {
      await updateItem('students', editingStudent.id, payload)
    } else {
      await addItem('students', payload)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete student record?')) {
      await deleteItem('students', id)
    }
  }

  const activeLevelObj = programLevels.find(l => l.id === activeProgramLevel)

  const filtered = students.filter(s => {
    const matchesCampus = 
      !s.instituteId || 
      !currentInstitute?.id || 
      s.instituteId === currentInstitute.id || 
      ((s.instituteId === 'inst-1' || s.instituteId === 'inst-default') &&
       (currentInstitute.id === 'inst-1' || currentInstitute.id === 'inst-default')) ||
      (institutes || []).length <= 1

    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.className.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesCampus || !matchesSearch) return false

    if (activeProgramLevel && activeProgramLevel !== 'all') {
      const studentLevel = detectProgramLevel(s.className)
      return studentLevel === activeProgramLevel || studentLevel === 'all'
    }
    return true
  })

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Admissions & Roster</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Enroll new students, generate student ID cards, and inspect academic profiles</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Student Admission</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name, roll number, or grade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            {activeProgramLevel && activeProgramLevel !== 'all' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold shrink-0">
                <span>Tier: {activeLevelObj?.shortTitle}</span>
                <button
                  onClick={() => setActiveProgramLevel('all')}
                  className="text-blue-500 hover:text-blue-800 ml-1 font-bold"
                  title="Clear tier filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Total: {filtered.length} students</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[650px]">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Roll Number</th>
                <th className="px-6 py-4">Class & Section</th>
                <th className="px-6 py-4">Guardian Contact</th>
                <th className="px-6 py-4">Fee Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4 font-bold text-slate-800">{s.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{s.rollNumber}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{s.className} ({s.section})</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                          {detectProgramLevel(s.className)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{s.phone || s.emergencyContact || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        s.feeStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {s.feeStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedIdCard(s)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                          title="Generate Student ID Card"
                        >
                          <IdCard className="w-3.5 h-3.5" />
                          <span>ID Card</span>
                        </button>
                        <button onClick={() => openEditModal(s)} className="p-1.5 text-slate-400 hover:text-emerald-600 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">0 Students Enrolled</p>
                    <p className="text-xs text-slate-400 mt-1">Click the "New Student Admission" button to enroll new students into this campus.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admission Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student Details' : 'New Student Admission'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Student Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              placeholder="e.g. Daniyal Tariq"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Roll Number</label>
              <input
                type="text"
                required
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Grade / Class & Program Tier</label>
              <input
                type="text"
                required
                list="classSuggestions"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
                placeholder="e.g. 10th Grade, 5th Grade, F.Sc..."
              />
              <datalist id="classSuggestions">
                {classes.filter(c => 
                  !c.instituteId || 
                  !currentInstitute?.id || 
                  c.instituteId === currentInstitute.id || 
                  ((c.instituteId === 'inst-1' || c.instituteId === 'inst-default') &&
                   (currentInstitute.id === 'inst-1' || currentInstitute.id === 'inst-default')) ||
                  (institutes || []).length <= 1
                ).map(c => (
                  <option key={c.id} value={c.name} />
                ))}
                <option value="1st Grade (Primary Section)" />
                <option value="5th Grade (Primary Section)" />
                <option value="8th Grade (Middle Section)" />
                <option value="9th Grade (Matric Science)" />
                <option value="10th Grade (Matric Science)" />
                <option value="O-Levels (Cambridge CAIE)" />
                <option value="11th Grade (F.Sc Pre-Medical)" />
                <option value="11th Grade (ICS Computer Science)" />
                <option value="12th Grade (F.Sc Pre-Engineering)" />
                <option value="A-Levels (Cambridge CAIE)" />
                <option value="ADP in Computer Science (ADP-CS)" />
                <option value="BS Computer Science (BSCS)" />
                <option value="BS Software Engineering (BSSE)" />
                <option value="BBA (Bachelor of Business Admin)" />
                <option value="MS / MPhil Program" />
              </datalist>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Section</label>
              <input
                type="text"
                list="sectionSuggestions"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
                placeholder="e.g. Super Section, Section A..."
              />
              <datalist id="sectionSuggestions">
                {(classes.find(c => c.name.toLowerCase().trim() === (formData.className || '').toLowerCase().trim())
                  ? normalizeClassSections(classes.find(c => c.name.toLowerCase().trim() === (formData.className || '').toLowerCase().trim())).map(s => s.name)
                  : ['Super Section', 'Section A', 'Section B', 'Section C', 'Star Section', 'Morning Batch', 'Evening Batch']
                ).map((secName, idx) => (
                  <option key={idx} value={secName} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Guardian Contact Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              placeholder="+92 300 1234567"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm text-white bg-emerald-600 rounded-lg font-semibold">Save Admission</button>
          </div>
        </form>
      </Modal>

      {/* Printable Student ID Card Modal */}
      {selectedIdCard && (
        <Modal
          isOpen={Boolean(selectedIdCard)}
          onClose={() => setSelectedIdCard(null)}
          title="Printable Student Identity Card"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            {/* Student ID Card Badge Preview */}
            <div className="w-full max-w-[340px] mx-auto bg-gradient-to-b from-[#111c30] to-[#1e345b] text-white rounded-2xl shadow-xl overflow-hidden border-2 border-emerald-500/50 print:border-black">
              {/* Card Header */}
              <div className="p-4 text-center border-b border-white/10 bg-emerald-700/30">
                <School className="w-7 h-7 mx-auto text-emerald-400 mb-1" />
                <h4 className="text-xs font-black uppercase tracking-wider leading-snug">
                  {currentInstitute?.name || 'CENTRAL HIGH SCHOOL'}
                </h4>
                <span className="text-[9px] uppercase tracking-widest text-emerald-300 font-bold">Student Identity Card</span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col items-center text-center">
                {/* Photo Frame */}
                <div className="w-20 h-24 rounded-xl bg-white/10 border-2 border-dashed border-emerald-400/60 flex flex-col items-center justify-center text-slate-300 mb-3 shadow-inner">
                  <User className="w-10 h-10 text-emerald-300/80" />
                  <span className="text-[8px] uppercase tracking-wider text-slate-400 mt-1">Photo</span>
                </div>

                <h3 className="text-base font-bold text-white tracking-wide">{selectedIdCard.name}</h3>
                <span className="text-xs text-emerald-300 font-mono font-bold mt-0.5">{selectedIdCard.rollNumber}</span>

                {/* Details Table */}
                <div className="w-full mt-3 pt-3 border-t border-white/10 space-y-1.5 text-xs text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Class & Section:</span>
                    <span className="font-semibold text-white">{selectedIdCard.className} ({selectedIdCard.section || 'A'})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Blood Group:</span>
                    <span className="font-semibold text-rose-300">{selectedIdCard.bloodGroup || 'B+'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Emergency Phone:</span>
                    <span className="font-semibold text-white">{selectedIdCard.phone || '+92 300 0000000'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Session:</span>
                    <span className="font-semibold text-white">2026 - 2027</span>
                  </div>
                </div>

                {/* Barcode representation */}
                <div className="w-full mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="font-mono text-[9px] text-slate-400 tracking-widest uppercase">
                    ||| | ||||| || |||||| |
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] uppercase block text-slate-400">Principal Signature</span>
                    <span className="text-[10px] font-serif italic text-emerald-300">Authorized</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedIdCard(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Student Card</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default StudentsView

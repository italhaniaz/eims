import React, { useState } from 'react'
import { Users, Plus, Search, Edit2, Trash2, Mail, Phone, BookOpen } from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import Modal from '../../../components/common/Modal'

export const TeachersView = ({ currentInstitute }) => {
  const { teachers, addItem, updateItem, deleteItem } = useAppData()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    empId: '',
    designation: 'Senior Teacher',
    department: 'Sciences',
    phone: '',
    email: '',
    status: 'Active'
  })

  const openAddModal = () => {
    setEditingTeacher(null)
    setFormData({
      name: '',
      empId: `EMP-${Math.floor(10 + Math.random() * 90)}`,
      designation: 'Senior Teacher',
      department: 'Sciences',
      phone: '',
      email: '',
      status: 'Active'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (t) => {
    setEditingTeacher(t)
    setFormData({
      name: t.name,
      empId: t.empId,
      designation: t.designation || 'Senior Teacher',
      department: t.department || 'Sciences',
      phone: t.phone || '',
      email: t.email || '',
      status: t.status || 'Active'
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.empId) return

    const payload = {
      ...formData,
      instituteId: currentInstitute?.id || 'inst-1'
    }

    if (editingTeacher) {
      await updateItem('teachers', editingTeacher.id, payload)
    } else {
      await addItem('teachers', payload)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete faculty record?')) {
      await deleteItem('teachers', id)
    }
  }

  const filtered = teachers.filter(t =>
    (!t.instituteId || t.instituteId === currentInstitute?.id) &&
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.department.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Faculty & Teaching Staff</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Manage teaching staff, designations, and department assignments</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Teacher</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(t => (
          <div key={t.id} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">
                  {t.empId}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800 mt-3">{t.name}</h3>
              <p className="text-xs text-emerald-600 font-semibold">{t.designation}</p>
              <p className="text-xs text-slate-500 mt-1">Dept: {t.department}</p>

              <div className="mt-4 pt-3 border-t border-slate-50 space-y-1 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.phone || '+92 300 0000000'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{t.email || 'faculty@sms.edu'}</span>
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button onClick={() => openEditModal(t)} className="p-1.5 text-slate-400 hover:text-emerald-600">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(t.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? 'Edit Teacher Details' : 'Add New Teacher'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Teacher Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              placeholder="e.g. Prof. Tariq Mehmood"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Employee ID</label>
              <input
                type="text"
                required
                value={formData.empId}
                onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Designation</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm text-white bg-emerald-600 rounded-lg">Save Faculty</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default TeachersView

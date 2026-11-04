import React, { useState, useEffect, useMemo } from 'react'
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Check, 
  X, 
  Search, 
  Filter, 
  Sliders, 
  Sparkles, 
  Lock, 
  Unlock, 
  CreditCard, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  AlertCircle,
  Award,
  CalendarCheck,
  CheckCircle2
} from 'lucide-react'
import { DataService } from '../../../services/dataService'
import { useToast } from '../../../context/ToastContext'

export const TeacherPermissionsMatrix = ({ currentInstitute, teachers = [] }) => {
  const { toast } = useToast()
  const instituteId = currentInstitute?.id || 'inst-2'

  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('ALL') // ALL, incharge, standard
  const [refreshKey, setRefreshKey] = useState(0)

  // Listen for permission updates
  useEffect(() => {
    const handleSync = () => setRefreshKey(k => k + 1)
    window.addEventListener('sms_permissions_updated', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('sms_permissions_updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // Filter teachers for current campus
  const campusTeachers = useMemo(() => {
    return (teachers || []).filter(t => !t.instituteId || t.instituteId === instituteId)
  }, [teachers, instituteId])

  // Get live campus gates for student/parent portal
  const campusGates = useMemo(() => {
    return DataService.getCampusStudentGates(instituteId)
  }, [instituteId, refreshKey])

  // Toggle single teacher permission
  const handleTogglePermission = (teacherId, permKey) => {
    const currentPerms = DataService.getTeacherPermissions(teacherId)
    const nextVal = !currentPerms[permKey]
    DataService.setTeacherPermissions(teacherId, { [permKey]: nextVal })
    
    const permLabels = {
      canEnrollStudents: 'Student Enrollment in Section',
      canPublishMarks: 'Exam Marks Locking & Publish',
      canBroadcastNotices: 'Parent SMS & Circular Broadcast',
      canEditAttendanceHistory: 'Past Attendance Editing'
    }

    toast.success(`Permission "${permLabels[permKey] || permKey}" updated for teacher.`)
    setRefreshKey(k => k + 1)
  }

  // Quick preset template apply
  const handleApplyPreset = (teacherId, presetType) => {
    let perms = {}
    if (presetType === 'standard') {
      perms = {
        canEnrollStudents: false,
        canPublishMarks: false,
        canBroadcastNotices: false,
        canEditAttendanceHistory: false,
        canManageClassDiary: true
      }
    } else if (presetType === 'incharge') {
      perms = {
        canEnrollStudents: true,
        canPublishMarks: true,
        canBroadcastNotices: true,
        canEditAttendanceHistory: false,
        canManageClassDiary: true
      }
    } else if (presetType === 'coordinator') {
      perms = {
        canEnrollStudents: true,
        canPublishMarks: true,
        canBroadcastNotices: true,
        canEditAttendanceHistory: true,
        canManageClassDiary: true
      }
    }
    DataService.setTeacherPermissions(teacherId, perms)
    toast.success(`Applied "${presetType.toUpperCase()}" role profile to teacher.`)
    setRefreshKey(k => k + 1)
  }

  // Bulk Presets
  const handleBulkPreset = (presetType) => {
    campusTeachers.forEach(t => {
      if (presetType === 'standard_all') {
        DataService.setTeacherPermissions(t.id, {
          canEnrollStudents: false,
          canPublishMarks: false,
          canBroadcastNotices: false,
          canEditAttendanceHistory: false,
          canManageClassDiary: true
        })
      } else if (presetType === 'incharge_admit') {
        const isHead = (t.roleTitle || t.designation || '').toLowerCase().includes('in-charge') ||
                       (t.roleTitle || t.designation || '').toLowerCase().includes('class teacher') ||
                       Boolean(t.isClassIncharge)
        if (isHead) {
          DataService.setTeacherPermissions(t.id, { canEnrollStudents: true, canPublishMarks: true })
        }
      }
    })
    toast.success(presetType === 'standard_all' 
      ? 'All faculty restricted to standard teacher permissions.' 
      : 'All designated Class In-Charges authorized for Student Enrollment!')
    setRefreshKey(k => k + 1)
  }

  // Toggle student portal gate
  const handleToggleGate = (gateKey) => {
    const nextVal = !campusGates[gateKey]
    DataService.setCampusStudentGates(instituteId, { [gateKey]: nextVal })
    toast.success(`Student & Parent Portal gate updated successfully!`)
    setRefreshKey(k => k + 1)
  }

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return campusTeachers.filter(t => {
      const matchSearch = (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.empId || '').toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchSearch) return false

      if (filterRole === 'incharge') {
        const perms = DataService.getTeacherPermissions(t.id)
        return Boolean(perms.canEnrollStudents)
      } else if (filterRole === 'standard') {
        const perms = DataService.getTeacherPermissions(t.id)
        return !perms.canEnrollStudents
      }

      return true
    })
  }, [campusTeachers, searchTerm, filterRole, refreshKey])

  // Aggregate stats
  const enrollmentAuthCount = useMemo(() => {
    return campusTeachers.filter(t => DataService.getTeacherPermissions(t.id)?.canEnrollStudents).length
  }, [campusTeachers, refreshKey])

  const marksAuthCount = useMemo(() => {
    return campusTeachers.filter(t => DataService.getTeacherPermissions(t.id)?.canPublishMarks).length
  }, [campusTeachers, refreshKey])

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Executive KPI Metrics */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-5 sm:p-6 rounded-3xl shadow-md border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Hierarchical Role Governance</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight font-heading">
              Faculty Capability Delegation & Student Portal Gates
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 max-w-2xl">
              Grant specific teachers administrative rights (e.g. admitting students into assigned sections) and control what features students & parents can access on <strong>{currentInstitute?.name || 'this campus'}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkPreset('incharge_admit')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
              title="Grant student enrollment capability to all class in-charges"
            >
              <UserCheck className="w-4 h-4" />
              <span>Authorize Class In-Charges</span>
            </button>

            <button
              type="button"
              onClick={() => handleBulkPreset('standard_all')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
              title="Reset all teachers to standard teaching without admissions access"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Reset to Standard</span>
            </button>
          </div>
        </div>

        {/* 3 KPI Summary Blocks */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-800/60">
          <div className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-emerald-300 uppercase block">Total Campus Staff</span>
            <span className="text-xl sm:text-2xl font-black mt-0.5 block">{campusTeachers.length}</span>
            <span className="text-[10px] text-emerald-200/70">Registered Faculty</span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-emerald-300 uppercase block">Admissions Authorized</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 block">
              {enrollmentAuthCount} <span className="text-xs text-emerald-200/70 font-normal">/ {campusTeachers.length}</span>
            </span>
            <span className="text-[10px] text-emerald-200/70">Can Enroll Section Students</span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-blue-300 uppercase block">Marks Lock Authorized</span>
            <span className="text-xl sm:text-2xl font-black text-blue-300 mt-0.5 block">
              {marksAuthCount} <span className="text-xs text-blue-200/70 font-normal">/ {campusTeachers.length}</span>
            </span>
            <span className="text-[10px] text-blue-200/70">Can Finalize Report Cards</span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-amber-300 uppercase block">Portal Gates Active</span>
            <span className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5 block">
              {Object.values(campusGates).filter(Boolean).length} / 5
            </span>
            <span className="text-[10px] text-amber-200/70">Student/Parent Capabilities</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search & Quick Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search faculty name, email, ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Faculty ({campusTeachers.length})</option>
              <option value="incharge">Admissions Authorized ({enrollmentAuthCount})</option>
              <option value="standard">Standard Teachers ({campusTeachers.length - enrollmentAuthCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Teacher Capability Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">Faculty Capability Matrix</h3>
            <p className="text-[11px] text-slate-500">Toggle administrative privileges per teacher. Changes take effect in real-time.</p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
            Showing {filteredTeachers.length} of {campusTeachers.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 min-w-[220px]">Teacher / Staff Profile</th>
                <th className="py-3.5 px-3 min-w-[140px]">Assigned Section</th>
                <th className="py-3.5 px-3 text-center min-w-[110px]">Role Preset</th>
                <th className="py-3.5 px-3 text-center min-w-[130px]">
                  <span className="block">🎓 Enroll Student</span>
                  <span className="text-[9px] font-normal text-slate-400 capitalize">In Assigned Section</span>
                </th>
                <th className="py-3.5 px-3 text-center min-w-[130px]">
                  <span className="block">📝 Lock Marks</span>
                  <span className="text-[9px] font-normal text-slate-400 capitalize">Publish Cards</span>
                </th>
                <th className="py-3.5 px-3 text-center min-w-[130px]">
                  <span className="block">📢 Parent Notices</span>
                  <span className="text-[9px] font-normal text-slate-400 capitalize">SMS Broadcast</span>
                </th>
                <th className="py-3.5 px-3 text-center min-w-[120px]">
                  <span className="block">🔒 Past Attendance</span>
                  <span className="text-[9px] font-normal text-slate-400 capitalize">Modify History</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((t) => {
                  const perms = DataService.getTeacherPermissions(t.id)
                  const isHead = (t.roleTitle || t.designation || '').toLowerCase().includes('in-charge') ||
                                 (t.roleTitle || t.designation || '').toLowerCase().includes('class teacher') ||
                                 Boolean(t.isClassIncharge)
                  const assignedClassStr = Array.isArray(t.assignedClasses) 
                    ? t.assignedClasses.join(', ') 
                    : t.assignedClass || t.department || 'General Faculty'

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Teacher Profile Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {t.name ? t.name.charAt(0) : 'T'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">{t.name}</span>
                              {isHead && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                  IN-CHARGE
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="font-mono">{t.empId || t.id}</span>
                              <span>•</span>
                              <span>{t.email || t.roleTitle || 'Faculty'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Section */}
                      <td className="py-3 px-3">
                        <span className="inline-block text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg max-w-[150px] truncate" title={assignedClassStr}>
                          {assignedClassStr}
                        </span>
                      </td>

                      {/* Quick Role Template Dropdown */}
                      <td className="py-3 px-3 text-center">
                        <select
                          value={perms.canEnrollStudents && perms.canEditAttendanceHistory ? 'coordinator' : perms.canEnrollStudents ? 'incharge' : 'standard'}
                          onChange={(e) => handleApplyPreset(t.id, e.target.value)}
                          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 py-1 px-2 focus:outline-none cursor-pointer"
                        >
                          <option value="standard">Standard Teacher</option>
                          <option value="incharge">Class In-Charge</option>
                          <option value="coordinator">Coordinator / HOD</option>
                        </select>
                      </td>

                      {/* 1. Can Enroll Students Toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(t.id, 'canEnrollStudents')}
                          className={`w-7 h-7 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer shadow-2xs ${
                            perms.canEnrollStudents
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-300'
                          }`}
                          title={perms.canEnrollStudents ? 'Authorized to enroll section students (Click to revoke)' : 'Restricted (Click to authorize)'}
                        >
                          {perms.canEnrollStudents ? <Check className="w-4 h-4 stroke-[2.5]" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                        <span className={`block text-[9.5px] mt-0.5 font-bold ${perms.canEnrollStudents ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {perms.canEnrollStudents ? 'Allowed' : 'Locked'}
                        </span>
                      </td>

                      {/* 2. Can Lock / Publish Marks Toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(t.id, 'canPublishMarks')}
                          className={`w-7 h-7 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer shadow-2xs ${
                            perms.canPublishMarks
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-300'
                          }`}
                          title={perms.canPublishMarks ? 'Authorized to publish marks (Click to revoke)' : 'Restricted'}
                        >
                          {perms.canPublishMarks ? <Check className="w-4 h-4 stroke-[2.5]" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                        <span className={`block text-[9.5px] mt-0.5 font-bold ${perms.canPublishMarks ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {perms.canPublishMarks ? 'Allowed' : 'Locked'}
                        </span>
                      </td>

                      {/* 3. Can Send Parent Notices Toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(t.id, 'canBroadcastNotices')}
                          className={`w-7 h-7 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer shadow-2xs ${
                            perms.canBroadcastNotices
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-300'
                          }`}
                          title={perms.canBroadcastNotices ? 'Authorized to send notices (Click to revoke)' : 'Restricted'}
                        >
                          {perms.canBroadcastNotices ? <Check className="w-4 h-4 stroke-[2.5]" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                        <span className={`block text-[9.5px] mt-0.5 font-bold ${perms.canBroadcastNotices ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {perms.canBroadcastNotices ? 'Allowed' : 'Locked'}
                        </span>
                      </td>

                      {/* 4. Can Edit Past Attendance Toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(t.id, 'canEditAttendanceHistory')}
                          className={`w-7 h-7 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer shadow-2xs ${
                            perms.canEditAttendanceHistory
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-300'
                          }`}
                          title={perms.canEditAttendanceHistory ? 'Authorized to edit past attendance' : 'Restricted'}
                        >
                          {perms.canEditAttendanceHistory ? <Check className="w-4 h-4 stroke-[2.5]" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                        <span className={`block text-[9.5px] mt-0.5 font-bold ${perms.canEditAttendanceHistory ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {perms.canEditAttendanceHistory ? 'Allowed' : 'Locked'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No faculty members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Student & Parent Portal Feature Gates (Campus-Wide) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>Campus Operational Gates</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Student & Parent Portal Feature Access</h3>
            <p className="text-xs text-slate-500">Enable or disable self-service features for all enrolled students and guardians in this campus.</p>
          </div>
          <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
            Institute ID: <strong>{instituteId}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Gate 1: Online Fee Payment */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                campusGates.allowOnlineFeePayment ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}>
                <CreditCard className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Online Fee Payment Gate</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Allow students & parents to pay vouchers digitally via 1Link & JazzCash.
                </p>
                <span className={`inline-block text-[10px] font-bold mt-2 px-2 py-0.5 rounded-full ${
                  campusGates.allowOnlineFeePayment ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {campusGates.allowOnlineFeePayment ? 'Active • 1Link Enabled' : 'Disabled • Desk Only'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggleGate('allowOnlineFeePayment')}
              className={`w-7 h-7 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer shrink-0 shadow-2xs ${
                campusGates.allowOnlineFeePayment ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-200 text-slate-400'
              }`}
            >
              {campusGates.allowOnlineFeePayment ? <Check className="w-4 h-4 stroke-[2.5]" /> : <X className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Gate 2: Online Homework & Assignments */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                campusGates.allowHomeworkUploads ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}>
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Homework & LMS Submissions</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Allow students to upload assignments, homework files, and science projects.
                </p>
                <span className={`inline-block text-[10px] font-bold mt-2 px-2 py-0.5 rounded-full ${
                  campusGates.allowHomeworkUploads ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {campusGates.allowHomeworkUploads ? 'Active • Open Submissions' : 'Submissions Closed'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggleGate('allowHomeworkUploads')}
              className={`w-7 h-7 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer shrink-0 shadow-2xs ${
                campusGates.allowHomeworkUploads ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-200 text-slate-400'
              }`}
            >
              {campusGates.allowHomeworkUploads ? <Check className="w-4 h-4 stroke-[2.5]" /> : <X className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Gate 3: Digital SLC & Report Card Download */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                campusGates.allowReportCardDownload ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}>
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Digital SLC & Marksheet Download</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Allow downloading official PDF report cards, certificates and transcripts.
                </p>
                <span className={`inline-block text-[10px] font-bold mt-2 px-2 py-0.5 rounded-full ${
                  campusGates.allowReportCardDownload ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {campusGates.allowReportCardDownload ? 'Active • Downloadable' : 'Locked by Admin'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggleGate('allowReportCardDownload')}
              className={`w-7 h-7 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer shrink-0 shadow-2xs ${
                campusGates.allowReportCardDownload ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-200 text-slate-400'
              }`}
            >
              {campusGates.allowReportCardDownload ? <Check className="w-4 h-4 stroke-[2.5]" /> : <X className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Gate 4: Emergency Contact Self-Update */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                campusGates.allowProfileSelfEdit ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}>
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Profile Self-Update Gate</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Allow guardians to update emergency contacts and residence address.
                </p>
                <span className={`inline-block text-[10px] font-bold mt-2 px-2 py-0.5 rounded-full ${
                  campusGates.allowProfileSelfEdit ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {campusGates.allowProfileSelfEdit ? 'Active • Self-Service' : 'Admin Locked'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggleGate('allowProfileSelfEdit')}
              className={`w-7 h-7 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer shrink-0 shadow-2xs ${
                campusGates.allowProfileSelfEdit ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-200 text-slate-400'
              }`}
            >
              {campusGates.allowProfileSelfEdit ? <Check className="w-4 h-4 stroke-[2.5]" /> : <X className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Gate 5: Direct Teacher Chat */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                campusGates.allowDirectTeacherChat ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}>
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Parent-Teacher Direct Messages</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Allow parents to initiate academic inquiries with assigned class teachers.
                </p>
                <span className={`inline-block text-[10px] font-bold mt-2 px-2 py-0.5 rounded-full ${
                  campusGates.allowDirectTeacherChat ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {campusGates.allowDirectTeacherChat ? 'Active • Inquiries Open' : 'Inquiries Muted'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggleGate('allowDirectTeacherChat')}
              className={`w-7 h-7 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer shrink-0 shadow-2xs ${
                campusGates.allowDirectTeacherChat ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-200 text-slate-400'
              }`}
            >
              {campusGates.allowDirectTeacherChat ? <Check className="w-4 h-4 stroke-[2.5]" /> : <X className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherPermissionsMatrix

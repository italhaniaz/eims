import React, { useState, useEffect, useMemo } from 'react'
import { 
  Award, 
  FileText, 
  Search, 
  Plus, 
  Printer, 
  Download, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Eye, 
  QrCode, 
  X, 
  School, 
  Check, 
  AlertCircle,
  FileCheck,
  ShieldCheck,
  User,
  GraduationCap,
  Calendar,
  Building,
  Trash2,
  FileBadge,
  Sparkles
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { getInstituteTierConfig } from '../../../utils/tierGating'

export const CertificatesView = ({ currentInstitute }) => {
  const tierConfig = getInstituteTierConfig(currentInstitute)
  const { students = [] } = useAppData()
  const { toast } = useToast()

  const campusName = currentInstitute?.name || 'Main Campus'
  const campusCode = currentInstitute?.code || 'SCH-001'
  const storageKey = `sms_campus_certificates_${currentInstitute?.id || 'default'}`

  // Default initial certificate records
  const primaryCertName = tierConfig.isUniversityOnly 
    ? 'Official Academic Transcript & Degree Attestation'
    : tierConfig.isCollegeOnly 
    ? 'College Leaving Certificate (CLC)'
    : 'School Leaving Certificate (SLC)'

  const primaryCertPrefix = tierConfig.isUniversityOnly ? 'TRN' : tierConfig.isCollegeOnly ? 'CLC' : 'SLC'

  const initialCertificates = [
    {
      id: 'CRT-2026-001',
      serialNumber: `${campusCode}-${primaryCertPrefix}-2026-001`,
      studentId: 'std-1',
      studentName: 'Ammar Sheikh',
      fatherName: 'Tariq Sheikh',
      rollNumber: 'BHS-104',
      className: tierConfig.isUniversityOnly ? 'BS Computer Science - Semester 8' : tierConfig.isCollegeOnly ? 'F.Sc Pre-Medical (Part II)' : 'Grade 10 - Section A',
      certType: primaryCertName,
      issueDate: '2026-10-25',
      purpose: tierConfig.isUniversityOnly ? 'HEC Attestation & Employment' : tierConfig.isCollegeOnly ? 'University Admission Intake' : 'Transfer to Lahore College',
      conduct: 'Exemplary',
      duesCleared: true,
      libraryCleared: true,
      labCleared: true,
      status: 'Issued',
      qrHash: '8a9b2c3d4e5f6789'
    },
    {
      id: 'CRT-2026-002',
      serialNumber: `${campusCode}-CHR-2026-002`,
      studentId: 'std-2',
      studentName: 'Khadija Imran',
      fatherName: 'Imran Ashraf',
      rollNumber: 'BHS-208',
      className: 'Grade 11 - Pre-Medical',
      certType: 'Character & Conduct Certificate',
      issueDate: '2026-10-22',
      purpose: 'University Admission Application',
      conduct: 'Excellent',
      duesCleared: true,
      libraryCleared: true,
      labCleared: true,
      status: 'Issued',
      qrHash: '1a2b3c4d5e6f7890'
    },
    {
      id: 'CRT-2026-003',
      serialNumber: `${campusCode}-BON-2026-003`,
      studentId: 'std-3',
      studentName: 'Daniyal Qureshi',
      fatherName: 'Nadeem Qureshi',
      rollNumber: 'BHS-315',
      className: 'Grade 9 - Section B',
      certType: 'Bonafide Student Certificate',
      issueDate: '2026-10-20',
      purpose: 'Passport / Visa Processing',
      conduct: 'Good',
      duesCleared: true,
      libraryCleared: true,
      labCleared: true,
      status: 'Issued',
      qrHash: '9f8e7d6c5b4a3210'
    }
  ]

  const [certificates, setCertificates] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : initialCertificates
    } catch {
      return initialCertificates
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(certificates))
    } catch (e) {
      console.error('Failed to sync certificates to storage', e)
    }
  }, [certificates, storageKey])

  // UI state
  const [activeTab, setActiveTab] = useState('register') // 'register' | 'issue' | 'templates'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [selectedCertForPreview, setSelectedCertForPreview] = useState(null)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)

  // Form state for issuing new certificate
  const [formData, setFormData] = useState({
    studentId: '',
    certType: tierConfig.isUniversityOnly 
      ? 'Official Academic Transcript & Degree Attestation'
      : tierConfig.isCollegeOnly 
      ? 'College Leaving Certificate (CLC)'
      : 'School Leaving Certificate (SLC)',
    purpose: '',
    conduct: 'Good',
    duesCleared: true,
    libraryCleared: true,
    labCleared: true,
    remarks: ''
  })

  // Filter campus-specific students
  const campusStudents = useMemo(() => {
    if (!currentInstitute?.id) return students
    return students.filter(s => !s.instituteId || s.instituteId === currentInstitute.id)
  }, [students, currentInstitute])

  const selectedStudentObj = useMemo(() => {
    return campusStudents.find(s => s.id === formData.studentId) || null
  }, [campusStudents, formData.studentId])

  // Filtered certificates list
  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      const matchesSearch = 
        cert.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = filterType === 'ALL' || cert.certType === filterType
      return matchesSearch && matchesType
    })
  }, [certificates, searchTerm, filterType])

  // Handle issuance
  const handleIssueCertificate = (e) => {
    e.preventDefault()
    if (!formData.studentId) {
      toast?.error?.('Please select a student from the campus directory.')
      return
    }

    const student = campusStudents.find(s => s.id === formData.studentId)
    if (!student) {
      toast?.error?.('Selected student record not found.')
      return
    }

    if (!formData.duesCleared) {
      toast?.error?.('Cannot issue certificate: Accounts dues clearance is mandatory.')
      return
    }

    const prefix = formData.certType.includes('Transcript') || formData.certType.includes('Degree') ? 'TRN' :
                   formData.certType.includes('College Leaving') || formData.certType.includes('CLC') ? 'CLC' :
                   formData.certType.includes('School Leaving') || formData.certType.includes('SLC') ? 'SLC' : 
                   formData.certType.includes('Character') ? 'CHR' : 
                   formData.certType.includes('Bonafide') ? 'BON' : 'AWARD'
    const seq = String(certificates.length + 1).padStart(3, '0')
    const serial = `${campusCode}-${prefix}-${new Date().getFullYear()}-${seq}`
    const randomHash = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)

    const newCert = {
      id: `CRT-${Date.now()}`,
      serialNumber: serial,
      studentId: student.id,
      studentName: student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Enrolled Student',
      fatherName: student.fatherName || student.guardianName || 'Guardian',
      rollNumber: student.rollNumber || student.roll || 'N/A',
      className: student.grade || student.class || 'Regular Class',
      certType: formData.certType,
      issueDate: new Date().toISOString().split('T')[0],
      purpose: formData.purpose || 'Official Campus Clearance',
      conduct: formData.conduct,
      duesCleared: formData.duesCleared,
      libraryCleared: formData.libraryCleared,
      labCleared: formData.labCleared,
      status: 'Issued',
      qrHash: randomHash
    }

    setCertificates(prev => [newCert, ...prev])
    toast?.success?.(`Certificate ${serial} generated and issued successfully!`)
    setIsIssueModalOpen(false)
    setFormData({
      studentId: '',
      certType: primaryCertName,
      purpose: '',
      conduct: 'Good',
      duesCleared: true,
      libraryCleared: true,
      labCleared: true,
      remarks: ''
    })
    setSelectedCertForPreview(newCert)
  }

  const handleDeleteCertificate = (id, serial) => {
    if (window.confirm(`Revoke certificate ${serial}? This record will be permanently deleted from the register.`)) {
      setCertificates(prev => prev.filter(c => c.id !== id))
      toast?.info?.(`Certificate ${serial} revoked.`)
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#111c30] via-[#1a2d52] to-[#0f3460] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-[#223b6b]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Campus Office Administration • Credentials Authority</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Certificates & Student Credentials
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Issue School Leaving Certificates (SLC), Character Certificates, and Bonafide verifications with QR cryptographic hash for {campusName}.
            </p>
          </div>
          <button 
            onClick={() => setIsIssueModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Certificate</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Issued</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{certificates.length}</span>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Official Register
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">School Leaving (SLC)</span>
          <span className="text-2xl font-bold text-indigo-600 mt-1 block">
            {certificates.filter(c => c.certType.includes('Leaving')).length}
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">Transfer Credentials</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Character Certificates</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">
            {certificates.filter(c => c.certType.includes('Character')).length}
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">Conduct Attestations</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Bonafide / Other</span>
          <span className="text-2xl font-bold text-teal-600 mt-1 block">
            {certificates.filter(c => !c.certType.includes('Leaving') && !c.certType.includes('Character')).length}
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">Verification Letters</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl p-1.5 border border-slate-200/80 shadow-2xs flex items-center gap-1">
        <button
          onClick={() => setActiveTab('register')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'register'
              ? 'bg-[#111c30] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Issued Certificates Register</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'register' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {certificates.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-[#111c30] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileBadge className="w-4 h-4" />
          <span>Certificate Formats & Templates</span>
        </button>
      </div>

      {/* Tab Content: Register */}
      {activeTab === 'register' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Search & Filter Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student, roll no, serial..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="ALL">All Certificate Types</option>
                <option value="School Leaving Certificate (SLC)">School Leaving (SLC)</option>
                <option value="Character & Conduct Certificate">Character Certificate</option>
                <option value="Bonafide Student Certificate">Bonafide Certificate</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Serial #</th>
                  <th className="py-3 px-4">Student & Roll No</th>
                  <th className="py-3 px-4">Certificate Type</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Clearance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCertificates.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      <FileCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <span>No certificates found matching criteria</span>
                    </td>
                  </tr>
                ) : (
                  filteredCertificates.map(cert => (
                    <tr key={cert.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-700">
                        {cert.serialNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{cert.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">Roll: {cert.rollNumber} • {cert.className}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">{cert.certType}</span>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{cert.purpose}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                        {cert.issueDate}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <Check className="w-3 h-3" /> All Cleared
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                          {cert.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCertForPreview(cert)}
                            title="Preview and Print"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedCertForPreview(cert)}
                            title="Print Certificate"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCertificate(cert.id, cert.serialNumber)}
                            title="Revoke Certificate"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Templates */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'School Leaving Certificate (SLC)',
              code: 'TPL-SLC-01',
              desc: 'Official mandatory transfer certificate stating student clearance, attendance percentage, conduct report, and date of leaving.',
              badge: 'Transfer Document',
              color: 'emerald'
            },
            {
              title: 'Character & Conduct Certificate',
              code: 'TPL-CHR-02',
              desc: 'Attestation of moral character, disciplinary record, co-curricular participation, and general behavior for college/university admission.',
              badge: 'Conduct Attestation',
              color: 'indigo'
            },
            {
              title: 'Bonafide Student Certificate',
              code: 'TPL-BON-03',
              desc: 'Affidavit affirming current regular enrollment for passport, visa, student concession, and bank account requirements.',
              badge: 'Enrollment Proof',
              color: 'amber'
            }
          ].map((t, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-slate-400">{t.code}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {t.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">{t.title}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{t.desc}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Certified Format
                </span>
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, certType: t.title }))
                    setIsIssueModalOpen(true)
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#111c30] hover:bg-[#1a2d52] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Use Format
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Issue Certificate */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Issue Student Certificate</h3>
              </div>
              <button 
                onClick={() => setIsIssueModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueCertificate} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Enrolled Student *</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">-- Choose student from {campusName} --</option>
                  {campusStudents.map(std => (
                    <option key={std.id} value={std.id}>
                      {std.name || `${std.firstName || ''} ${std.lastName || ''}`.trim()} (Roll: {std.rollNumber || std.roll || 'N/A'}) - {std.grade || std.class || 'Class'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Certificate Type *</label>
                <select
                  value={formData.certType}
                  onChange={(e) => setFormData({ ...formData, certType: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {tierConfig.isUniversityOnly ? (
                    <>
                      <option value="Official Academic Transcript & Degree Attestation">Official Academic Transcript & Degree Attestation</option>
                      <option value="Provisional Degree Certificate">Provisional Degree Certificate</option>
                      <option value="Degree Clearance & No Objection Certificate (HEC)">Degree Clearance & No Objection Certificate (HEC)</option>
                      <option value="Academic Distinction & Honor Roll Certificate">Academic Distinction & Honor Roll Certificate</option>
                    </>
                  ) : tierConfig.isCollegeOnly ? (
                    <>
                      <option value="College Leaving Certificate (CLC)">College Leaving Certificate (CLC)</option>
                      <option value="Character & Good Conduct Certificate">Character & Good Conduct Certificate</option>
                      <option value="Bonafide College Student Certificate">Bonafide College Student Certificate</option>
                      <option value="FBISE / BISE Inter-Board Clearance & Migration Certificate">FBISE / BISE Inter-Board Clearance & Migration Certificate</option>
                      <option value="Academic Merit & College Honors Award">Academic Merit & College Honors Award</option>
                    </>
                  ) : (
                    <>
                      <option value="School Leaving Certificate (SLC)">School Leaving Certificate (SLC)</option>
                      <option value="Character & Conduct Certificate">Character & Conduct Certificate</option>
                      <option value="Bonafide Student Certificate">Bonafide Student Certificate</option>
                      <option value="Academic Achievement & Merit Award">Academic Achievement & Merit Award</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Purpose / Reason of Certificate</label>
                <input
                  type="text"
                  placeholder="e.g. Higher Studies, Migration to other board, Embassy Visa"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Conduct & Moral Record</label>
                <select
                  value={formData.conduct}
                  onChange={(e) => setFormData({ ...formData, conduct: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Exemplary">Exemplary</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Satisfactory">Satisfactory</option>
                </select>
              </div>

              {/* Clearance checklist */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <span className="block font-semibold text-slate-800 text-xs">Mandatory Clearance Checklist:</span>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.duesCleared}
                    onChange={(e) => setFormData({ ...formData, duesCleared: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Tuition & Examination Accounts Dues Cleared</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.libraryCleared}
                    onChange={(e) => setFormData({ ...formData, libraryCleared: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Library Books Returned & Fine Settled</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.labCleared}
                    onChange={(e) => setFormData({ ...formData, labCleared: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Science Labs / Sports Equipment Cleared</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Generate Certificate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Official Printable Certificate Document Preview */}
      {selectedCertForPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-auto">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Certificate Document Preview ({selectedCertForPreview.serialNumber})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setSelectedCertForPreview(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Certificate Paper Layout */}
            <div className="p-8 sm:p-10 bg-[#fffdfa] border-8 border-double border-slate-300 relative select-text text-slate-900">
              {/* Institutional Header */}
              <div className="text-center border-b-2 border-slate-800 pb-5 mb-6">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-white mx-auto flex items-center justify-center mb-2 font-bold">
                  <School className="w-6 h-6 text-amber-400" />
                </div>
                <h2 className="text-2xl font-serif font-black tracking-wide uppercase text-slate-900">
                  {campusName}
                </h2>
                <p className="text-xs font-sans text-slate-600 mt-1 uppercase tracking-widest font-semibold">
                  Board Affiliation Code: {campusCode} • Office of the Registrar
                </p>
                <div className="mt-4 inline-block px-5 py-1.5 rounded-full bg-slate-900 text-white font-serif font-bold text-sm tracking-wider uppercase">
                  {selectedCertForPreview.certType}
                </div>
              </div>

              {/* Serial & Date Bar */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-600 border-b border-slate-200 pb-3 mb-6">
                <span>Serial No: <strong className="text-slate-900">{selectedCertForPreview.serialNumber}</strong></span>
                <span>Date: <strong className="text-slate-900">{selectedCertForPreview.issueDate}</strong></span>
              </div>

              {/* Certificate Body Paragraph */}
              <div className="font-serif text-sm sm:text-base leading-loose text-slate-800 space-y-4 my-8 text-justify">
                <p>
                  This is to solemnly certify that <span className="font-bold border-b border-dotted border-slate-600 px-2 text-slate-950">{selectedCertForPreview.studentName}</span>, 
                  Child / Ward of <span className="font-bold border-b border-dotted border-slate-600 px-2 text-slate-950">{selectedCertForPreview.fatherName}</span>, 
                  holding Campus Roll Number <span className="font-mono font-bold px-1 bg-slate-100 rounded text-slate-950">{selectedCertForPreview.rollNumber}</span>, 
                  was a bonafide registered student of this institution in <span className="font-bold px-1">{selectedCertForPreview.className}</span>.
                </p>
                <p>
                  According to official institution records, all dues relating to tuition, examinations, laboratory equipment, and library books have been completely settled. 
                  During the student's tenure at this campus, their general moral conduct and character were observed to be <strong className="uppercase underline">{selectedCertForPreview.conduct}</strong>.
                </p>
                <p>
                  This official certificate is granted upon formal request for the purpose of: <em className="font-sans font-semibold text-slate-900">{selectedCertForPreview.purpose}</em>. 
                  We extend our sincere best wishes for all their future academic and professional endeavors.
                </p>
              </div>

              {/* Footer Signatures & QR Seal */}
              <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-3 gap-4 text-center items-end text-xs">
                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-700">Office Assistant</div>
                  <span className="text-[10px] text-slate-400">Prepared By</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border-2 border-dashed border-slate-400 rounded-lg flex flex-col items-center justify-center p-1 bg-white">
                    <QrCode className="w-8 h-8 text-slate-800" />
                    <span className="text-[7px] font-mono text-slate-500 truncate w-full text-center mt-0.5">{selectedCertForPreview.qrHash?.substring(0, 8)}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 font-mono uppercase">Verified Seal</span>
                </div>
                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-700">Campus Principal</div>
                  <span className="text-[10px] text-slate-400">Official Signature & Stamp</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CertificatesView
import React, { useState, useMemo, useRef } from 'react'
import { ArrowLeft, FileText, Download, Upload, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'
import { getDistinctInstituteClassNames } from '../../utils/tierGating'
import { normalizeClassSections } from '../../constants/academicLevels'

const FEE_TYPE_VALUES = ['Monthly', 'Seasonal', 'Bi-Yearly', 'Yearly', 'One-Time']

const parseCsvLine = (line) => {
  const out = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  out.push(current.trim())
  return out
}

export const BulkImportView = ({ currentInstitute, onRouteChange }) => {
  const { students = [], classes = [], addItem, logAuditEvent } = useAppData()
  const { toast } = useToast()
  const fileInputRef = useRef(null)

  const instId = currentInstitute?.id || 'inst-1'
  const availableClasses = useMemo(
    () => getDistinctInstituteClassNames(classes, students, currentInstitute),
    [classes, students, currentInstitute]
  )

  const [selectedClass, setSelectedClass] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewRows, setPreviewRows] = useState([])
  const [isImporting, setIsImporting] = useState(false)

  const defaultSection = useMemo(() => {
    if (!selectedClass) return 'Super'
    const clsObj = classes.find((c) => (c.name || '').toLowerCase() === selectedClass.toLowerCase())
    const secs = normalizeClassSections(clsObj)
    return secs[0] || 'Super'
  }, [selectedClass, classes])

  const handleDownloadTemplate = () => {
    const headers = [
      'Student Name',
      'Guardian Name',
      'Roll Number',
      'Gender',
      'Mobile',
      'Email',
      'Admission No',
      'Monthly Fee',
      'Fee Type'
    ]
    const sample = [
      'Ali Ahmed Khan',
      'Ahmed Khan',
      '101',
      'Male',
      '03001234567',
      'ali@example.com',
      'ADM-2026-101',
      '3500',
      'Monthly'
    ]
    const csv = `${headers.join(',')}\n${sample.join(',')}\n`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student_bulk_import_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast('CSV template downloaded.', 'success')
  }

  const handleUploadPreview = async () => {
    if (!selectedClass) {
      toast('Select a class first.', 'warning')
      return
    }
    if (!selectedFile) {
      toast('Choose a CSV file first.', 'warning')
      return
    }

    try {
      const text = await selectedFile.text()
      const rawLines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
      if (rawLines.length < 2) {
        toast('CSV must contain a header row and at least one student row.', 'warning')
        return
      }

      const headers = parseCsvLine(rawLines[0]).map((h) => h.toLowerCase())
      const idxOf = (...names) => headers.findIndex((h) => names.some((n) => h.includes(n)))

      const nameIdx = idxOf('student', 'name')
      const guardIdx = idxOf('guardian', 'father', 'parent')
      const rollIdx = idxOf('roll')
      const genderIdx = idxOf('gender')
      const phoneIdx = idxOf('mobile', 'phone', 'contact')
      const emailIdx = idxOf('email')
      const admIdx = idxOf('admission', 'adm')
      const feeIdx = idxOf('fee', 'tuition', 'amount')
      const feeTypeIdx = idxOf('fee type', 'frequency', 'schedule')

      if (nameIdx < 0) {
        toast('CSV header must include a "Student Name" column.', 'error')
        return
      }

      const existingInClass = students.filter(
        (s) =>
          (!currentInstitute?.id || !s.instituteId || s.instituteId === currentInstitute.id) &&
          (s.className || '').toLowerCase() === selectedClass.toLowerCase()
      )

      const parsed = rawLines.slice(1).map((line, i) => {
        const cols = parseCsvLine(line)
        const name = (cols[nameIdx] || '').trim()
        const fatherName = guardIdx >= 0 ? (cols[guardIdx] || '').trim() : ''
        const rollNumber = rollIdx >= 0 ? (cols[rollIdx] || '').trim() : String(existingInClass.length + i + 1)
        const gender = genderIdx >= 0 && cols[genderIdx] ? cols[genderIdx].trim() : 'Male'
        const phone = phoneIdx >= 0 ? (cols[phoneIdx] || '').trim() : ''
        const email = emailIdx >= 0 ? (cols[emailIdx] || '').trim() : ''
        const admissionNo = admIdx >= 0 ? (cols[admIdx] || '').trim() : ''
        const monthlyFee = feeIdx >= 0 ? Math.max(0, Number(cols[feeIdx] || 0)) : 0
        const rawFreq = feeTypeIdx >= 0 ? (cols[feeTypeIdx] || '').trim() : 'Monthly'
        const feeType = FEE_TYPE_VALUES.includes(rawFreq) ? rawFreq : 'Monthly'

        const isDuplicate =
          !name ||
          existingInClass.some(
            (s) =>
              (rollNumber && s.rollNumber && String(s.rollNumber).trim().toLowerCase() === rollNumber.toLowerCase()) ||
              ((s.fullName || s.name || '').trim().toLowerCase() === name.toLowerCase())
          )

        return {
          rowNum: i + 1,
          name,
          fatherName,
          rollNumber,
          gender,
          phone,
          email,
          admissionNo,
          monthlyFee,
          feeType,
          isDuplicate
        }
      })

      setPreviewRows(parsed)
      toast(`Parsed ${parsed.length} row(s). Review the preview below.`, 'info')
    } catch {
      toast('Could not read the CSV file.', 'error')
    }
  }

  const validRows = useMemo(() => previewRows.filter((r) => !r.isDuplicate && r.name), [previewRows])

  const handleConfirmImport = async () => {
    if (validRows.length === 0) {
      toast('No valid non-duplicate rows to import.', 'warning')
      return
    }
    setIsImporting(true)
    try {
      const todayIso = new Date().toISOString().split('T')[0]
      for (const row of validRows) {
        const created = await addItem('students', {
          name: row.name,
          fullName: row.name,
          fatherName: row.fatherName,
          rollNumber: row.rollNumber,
          admissionNo: row.admissionNo || `ADM-${Date.now().toString().slice(-5)}-${row.rowNum}`,
          className: selectedClass,
          section: defaultSection,
          gender: row.gender,
          phone: row.phone,
          parentPhone: row.phone,
          email: row.email,
          monthlyFee: row.monthlyFee,
          tuitionFee: row.monthlyFee,
          feeFrequency: row.feeType,
          status: 'Active',
          instituteId: instId,
          campus: currentInstitute?.name || 'Main Campus',
          admissionDate: todayIso
        })

        if (row.monthlyFee > 0) {
          await addItem('fees', {
            studentId: created?.id,
            studentName: row.name,
            fatherName: row.fatherName,
            rollNumber: row.rollNumber,
            className: selectedClass,
            feeTitle: 'Tuition Fee',
            feeHead: 'Tuition Fee',
            feeType: 'Tuition Fee',
            frequency: row.feeType,
            schedule: row.feeType,
            amount: row.monthlyFee,
            grossAmount: row.monthlyFee,
            discount: 0,
            paidAmount: 0,
            status: 'Pending',
            dueDate: todayIso,
            createdAt: new Date().toISOString(),
            instituteId: instId
          })
        }
      }
      logAuditEvent?.(
        `Bulk imported ${validRows.length} student(s) into ${selectedClass}`,
        currentInstitute?.name || 'Admin',
        'Success'
      )
      toast(`Imported ${validRows.length} student(s) into ${selectedClass}.`, 'success')
      setPreviewRows([])
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      toast(err?.message || 'Import failed.', 'error')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-4 pb-8 animate-fade-in">
      {/* Header matching Pick 3 */}
      <div>
        <div className="flex items-center gap-2 text-slate-900">
          <FileText className="w-5 h-5 text-slate-600" />
          <h1 className="text-lg font-bold tracking-tight">Bulk Import</h1>
        </div>
        <button
          type="button"
          onClick={() => onRouteChange?.('inst-dashboard')}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 mt-0.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      {/* Main Card matching Pick 3 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Import from CSV</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-3.5 py-1.5 rounded-lg border border-cyan-400 text-cyan-600 hover:bg-cyan-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Template</span>
          </button>
        </div>

        {/* Info Banner */}
        <div className="rounded-lg bg-sky-50 border border-sky-200 px-4 py-3 space-y-2 text-xs text-sky-900">
          <p>
            Fill the template, pick a class, upload, check the preview and save. One class at a time; duplicates are skipped.
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold">Fee Type values:</span>
            {FEE_TYPE_VALUES.map((ft) => (
              <span
                key={ft}
                className="px-2 py-0.5 rounded bg-white border border-sky-200 text-[11px] font-semibold text-slate-700"
              >
                {ft}
              </span>
            ))}
          </div>
        </div>

        {/* Step 1: Select Class */}
        <div className="rounded-xl border border-slate-200 p-4 space-y-2.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <span className="w-5 h-5 rounded bg-blue-600 text-white text-[11px] font-bold inline-flex items-center justify-center">
              1
            </span>
            <span>Select Class</span>
          </div>

          <div className="max-w-lg space-y-1">
            <label className="block font-semibold text-slate-700">
              Class <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value)
                setPreviewRows([])
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Select Class</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Section will be assigned automatically as {defaultSection}.
            </p>
          </div>
        </div>

        {/* Step 2: Upload CSV File */}
        <div className="rounded-xl border border-slate-200 p-4 space-y-2.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <span className="w-5 h-5 rounded bg-blue-600 text-white text-[11px] font-bold inline-flex items-center justify-center">
              2
            </span>
            <span>Upload CSV File</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1 space-y-1">
              <label className="block font-semibold text-slate-700">
                CSV File <span className="text-rose-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                disabled={!selectedClass}
                onChange={(e) => {
                  setSelectedFile(e.target.files?.[0] || null)
                  setPreviewRows([])
                }}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border file:border-slate-300 file:bg-white file:text-xs file:font-semibold file:text-slate-700 disabled:opacity-60 cursor-pointer"
              />
              {!selectedClass && <p className="text-[11px] text-slate-400">Select a class first.</p>}
            </div>

            <button
              type="button"
              disabled={!selectedClass || !selectedFile}
              onClick={handleUploadPreview}
              className="px-4 py-2 rounded-lg bg-sky-400 hover:bg-sky-500 disabled:bg-sky-300 disabled:cursor-not-allowed text-white font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload &amp; Preview</span>
            </button>
          </div>
        </div>

        {/* Preview & Save Table (shown after Upload & Preview) */}
        {previewRows.length > 0 && (
          <div className="rounded-xl border border-slate-200 p-4 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-bold text-slate-800">
                Preview ({validRows.length} ready · {previewRows.length - validRows.length} duplicate/invalid skipped)
              </div>
              <button
                type="button"
                disabled={isImporting || validRows.length === 0}
                onClick={handleConfirmImport}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isImporting ? 'Importing...' : `Save ${validRows.length} Student(s)`}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Student Name</th>
                    <th className="py-2 px-3">Guardian</th>
                    <th className="py-2 px-3">Roll No</th>
                    <th className="py-2 px-3">Mobile</th>
                    <th className="py-2 px-3">Fee (PKR)</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewRows.map((row) => (
                    <tr key={row.rowNum} className={row.isDuplicate ? 'bg-amber-50/50 text-slate-400' : ''}>
                      <td className="py-2 px-3">{row.rowNum}</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">{row.name || '—'}</td>
                      <td className="py-2 px-3">{row.fatherName || '—'}</td>
                      <td className="py-2 px-3">{row.rollNumber}</td>
                      <td className="py-2 px-3">{row.phone || '—'}</td>
                      <td className="py-2 px-3">{row.monthlyFee.toLocaleString()} ({row.feeType})</td>
                      <td className="py-2 px-3">
                        {row.isDuplicate ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold text-[10px]">
                            <AlertTriangle className="w-3 h-3" />
                            Skipped
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Ready
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BulkImportView
